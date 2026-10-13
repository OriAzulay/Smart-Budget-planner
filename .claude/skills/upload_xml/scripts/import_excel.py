"""Import a RiseUp-style budget workbook (.xlsx) into the Smart Budget database.

Overwrites ALL budget data in the app: every month tab (with its line items) and
the cells of the three dashboard grids (monthly_balances, monthly_summary,
fixed_expenses). Users and grid structure (row/column labels) are kept.

Usage:
    python import_excel.py <workbook.xlsx> [--dry-run] [--db PATH]

A timestamped backup of the database is written next to it before any write.
"""

import argparse
import datetime
import re
import shutil
import sqlite3
import sys
import tempfile
import uuid
from pathlib import Path

try:
    import openpyxl
except ImportError:
    sys.exit("openpyxl is missing. Install it with: python -m pip install openpyxl")

REPO_ROOT = Path(__file__).resolve().parents[4]
DEFAULT_DB = REPO_ROOT / "backend" / "budget.db"

HEBREW_MONTHS = ["ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני",
                 "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר"]
MONTH_SHEET_RE = re.compile(r"^(%s)_(\d{2})$" % "|".join(HEBREW_MONTHS))
SUM_RE = re.compile(r"^=\s*SUM\(\s*C(\d+)\s*:\s*C(\d+)\s*\)$", re.IGNORECASE)

MAIN_SHEET = "עמוד ראשי"
HOUSE_SHEET = "הוצאות בית"


# ---------- cell helpers ----------

def num(v):
    """Number or None. Blank cells and '-' stay empty."""
    if v is None or isinstance(v, bool):
        return None
    if isinstance(v, str):
        s = v.strip().replace(",", "").replace("₪", "")
        if s in ("", "-", "—"):
            return None
        try:
            return round(float(s), 2)
        except ValueError:
            return None
    return round(float(v), 2)


def text(v):
    if v is None:
        return None
    s = str(v).strip()
    return None if s in ("", "-", "—") else s


def norm(label):
    """Normalize Hebrew labels: '' -> ", collapse spaces."""
    return re.sub(r"\s+", " ", str(label or "").replace("''", '"').replace("״", '"')).strip()


def find_cell(ws, predicate, max_row=40, max_col=30):
    for row in ws.iter_rows(min_row=1, max_row=min(max_row, ws.max_row), max_col=max_col):
        for c in row:
            if isinstance(c.value, str) and predicate(norm(c.value)):
                return c
    return None


class ImportError_(Exception):
    pass


# ---------- parsing ----------

def parse_month(ws_val, ws_formula, warnings):
    title = ws_val.title
    m = MONTH_SHEET_RE.match(title)
    name = f"{m.group(1)} 20{m.group(2)}"

    def label_row(prefix):
        c = find_cell(ws_val, lambda s: s.startswith(prefix), max_col=4)
        if not c:
            raise ImportError_(f"{title}: missing label '{prefix}'")
        return c.row, c.column

    inc_row, inc_col = label_row("מקור הכנסה")
    start_row, _ = label_row('סכום עו"ש התחלתי')
    end_row, _ = label_row('סכום עו"ש סופי')
    name_col, amt_col, note_col = inc_col, inc_col + 1, inc_col + 2

    # Fixed / variable ranges come from the sheet's own summary formulas: the cell
    # directly below the "הוצאות קבועות" / "הוצאות משתנות" labels.
    ranges = {}
    for key, label in (("fixed", "הוצאות קבועות"), ("variable", "הוצאות משתנות")):
        lc = find_cell(ws_formula, lambda s, l=label: s == l, max_row=20)
        if not lc:
            raise ImportError_(f"{title}: missing summary label '{label}'")
        f = ws_formula.cell(lc.row + 1, lc.column).value
        g = SUM_RE.match(str(f or ""))
        if not g:
            raise ImportError_(f"{title}: expected =SUM(Cx:Cy) under '{label}', found {f!r}")
        ranges[key] = (int(g.group(1)), int(g.group(2)), ws_val.cell(lc.row + 1, lc.column).value)

    def collect(r1, r2):
        out = []
        for r in range(r1, r2 + 1):
            n, a = text(ws_val.cell(r, name_col).value), num(ws_val.cell(r, amt_col).value)
            if n or a is not None:
                out.append({"row": r, "source": n or "", "amount": a,
                            "notes": text(ws_val.cell(r, note_col).value)})
        return out

    income = collect(inc_row + 1, start_row - 1)
    fixed = collect(*ranges["fixed"][:2])
    variable = collect(*ranges["variable"][:2])

    # Validate against the workbook's own totals.
    for key, items in (("fixed", fixed), ("variable", variable)):
        expected = num(ranges[key][2])
        got = round(sum(i["amount"] or 0 for i in items), 2)
        if expected is not None and abs(expected - got) > 0.01:
            warnings.append(f"{name}: {key} total {got} != Excel {expected}")

    covered = set(range(ranges["fixed"][0], ranges["fixed"][1] + 1)) | \
        set(range(ranges["variable"][0], ranges["variable"][1] + 1))
    first = min(ranges["fixed"][0], ranges["variable"][0])
    for r in range(first, ws_val.max_row + 1):
        if r in covered:
            continue
        n, a = text(ws_val.cell(r, name_col).value), num(ws_val.cell(r, amt_col).value)
        if n or a is not None:
            warnings.append(f"{name}: row {r} ({n}, {a}) is outside the fixed/variable ranges and was skipped")

    for i in income + fixed + variable:
        if i["amount"] is None:
            warnings.append(f"{name}: row {i['row']} '{i['source']}' has no amount (saved as 0)")

    return {"name": name, "start": num(ws_val.cell(start_row, amt_col).value),
            "end": num(ws_val.cell(end_row, amt_col).value),
            "income": income, "fixed": fixed, "variable": variable}


def parse_main(ws):
    """Balances table (one row per month incl. opening December) and the monthly summary table."""
    hdr = find_cell(ws, lambda s: s == "פיקדון")
    if not hdr:
        raise ImportError_(f"{MAIN_SHEET}: balances header 'פיקדון' not found")
    hrow = hdr.row
    headers = {norm(ws.cell(hrow, c).value): c for c in range(1, ws.max_column + 1) if ws.cell(hrow, c).value}

    def col(pred, what):
        for h, c in headers.items():
            if pred(h):
                return c
        raise ImportError_(f"{MAIN_SHEET}: column '{what}' not found in balances header")

    c_start = col(lambda h: "התחלתי" in h, 'עו"ש התחלתי')
    c_end = col(lambda h: "סוף" in h, 'עו"ש סוף')
    c_dep = col(lambda h: h == "פיקדון", "פיקדון")
    c_inv = col(lambda h: "השקעות ניצן" in h, "השקעות ניצן")
    c_label = max(c for c in range(1, ws.max_column + 1)
                  if any(isinstance(ws.cell(r, c).value, str) and norm(ws.cell(r, c).value).split(" ")[0] in HEBREW_MONTHS
                         for r in range(hrow + 1, hrow + 4)))

    balances = []
    r = hrow + 1
    while r <= ws.max_row and text(ws.cell(r, c_label).value):
        balances.append({"label": norm(ws.cell(r, c_label).value),
                         "values": {"start": num(ws.cell(r, c_start).value), "end": num(ws.cell(r, c_end).value),
                                    "deposit": num(ws.cell(r, c_dep).value), "investments": num(ws.cell(r, c_inv).value)}})
        r += 1

    shdr = find_cell(ws, lambda s: s == "חסכון חודשי")
    summary = []
    if shdr:
        srow = shdr.row
        sh = {norm(ws.cell(srow, c).value): c for c in range(1, ws.max_column + 1) if ws.cell(srow, c).value}
        c_sav = shdr.column
        c_exp = next(c for h, c in sh.items() if h.startswith("הוצאות"))
        c_inc = next(c for h, c in sh.items() if h.startswith("הכנסות"))
        r = srow + 1
        while r <= ws.max_row and text(ws.cell(r, c_label).value):
            summary.append({"label": norm(ws.cell(r, c_label).value),
                            "values": {"saving": num(ws.cell(r, c_sav).value), "expenses": num(ws.cell(r, c_exp).value),
                                       "income": num(ws.cell(r, c_inc).value)}})
            r += 1
    return balances, summary


def parse_house(ws):
    hdr = find_cell(ws, lambda s: s == "דצמבר")
    if not hdr:
        raise ImportError_(f"{HOUSE_SHEET}: month header row not found")
    month_cols = [c for c in range(hdr.column, ws.max_column + 1)
                  if norm(ws.cell(hdr.row, c).value).split(" ")[0] in HEBREW_MONTHS]
    label_col = hdr.column - 1
    rows = []
    r = hdr.row + 1
    while r <= ws.max_row:
        label = text(ws.cell(r, label_col).value)
        if not label or norm(label).startswith('סה"כ'):
            break
        rows.append({"label": norm(label), "values": [num(ws.cell(r, c).value) for c in month_cols]})
        r += 1
    return rows


# ---------- writing ----------

def write(db, data):
    now = lambda: datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%d %H:%M:%S.%f")
    uid = lambda: str(uuid.uuid4())
    report = []

    db.execute("delete from month_line_items")
    db.execute("delete from months")
    for order, m in enumerate(data["months"], start=1):
        mid = uid()
        db.execute("insert into months (id,name,order_index,starting_balance,ending_balance,notes,created_at) "
                   "values (?,?,?,?,?,?,?)", (mid, m["name"], order, m["start"] or 0, m["end"] or 0, None, now()))
        idx = 0
        for cat, key in (("INCOME", "income"), ("FIXED", "fixed"), ("VARIABLE", "variable")):
            for it in m[key]:
                db.execute("insert into month_line_items (id,month_id,category,source,amount,notes,order_index,created_at) "
                           "values (?,?,?,?,?,?,?,?)",
                           (uid(), mid, cat, it["source"], it["amount"] if it["amount"] is not None else 0,
                            it["notes"], idx, now()))
                idx += 1

    def grid(key):
        row = db.execute("select id from grids where key=?", (key,)).fetchone()
        if not row:
            raise ImportError_(f"grid '{key}' does not exist in the database")
        gid = row[0]
        cols = db.execute("select id,label from grid_columns where grid_id=? order by order_index", (gid,)).fetchall()
        rows = db.execute("select id,label from grid_rows where grid_id=? order by order_index", (gid,)).fetchall()
        db.execute("delete from grid_cells where row_id in (select id from grid_rows where grid_id=?)", (gid,))
        return gid, cols, rows

    def put(row_id, col_id, value):
        if value is not None:
            db.execute("insert into grid_cells (id,row_id,column_id,value,updated_at) values (?,?,?,?,?)",
                       (uid(), row_id, col_id, value, now()))

    def col_by(cols, pred):
        return next((cid for cid, label in cols if pred(norm(label))), None)

    # monthly_balances: rows matched by position (first row = opening December).
    _, cols, rows = grid("monthly_balances")
    colmap = {"start": col_by(cols, lambda l: "התחלתי" in l), "end": col_by(cols, lambda l: "סוף" in l),
              "deposit": col_by(cols, lambda l: l == "פיקדון"), "investments": col_by(cols, lambda l: l.startswith("השקעות"))}
    for (rid, _), b in zip(rows, data["balances"]):
        for k, v in b["values"].items():
            if colmap[k]:
                put(rid, colmap[k], v)
    if len(data["balances"]) > len(rows):
        report.append(f"monthly_balances: {len(data['balances']) - len(rows)} Excel rows had no matching grid row")

    # monthly_summary: rows matched by month name.
    _, cols, rows = grid("monthly_summary")
    colmap = {"saving": col_by(cols, lambda l: l.startswith("חסכון")), "expenses": col_by(cols, lambda l: l.startswith("הוצאות")),
              "income": col_by(cols, lambda l: l.startswith("הכנסות"))}
    row_by_label = {norm(label): rid for rid, label in rows}
    for s in data["summary"]:
        rid = row_by_label.get(s["label"].split(" ")[0])
        if not rid:
            report.append(f"monthly_summary: no grid row for '{s['label']}'")
            continue
        for k, v in s["values"].items():
            if colmap[k]:
                put(rid, colmap[k], v)

    # fixed_expenses (house expenses): rows matched by label (new labels are added),
    # columns matched by position (Dec, Jan..Dec).
    gid, cols, rows = grid("fixed_expenses")
    row_by_label = {norm(label): rid for rid, label in rows}
    next_order = len(rows)
    for h in data["house"]:
        rid = row_by_label.get(h["label"])
        if not rid:
            rid = uid()
            db.execute("insert into grid_rows (id,grid_id,label,order_index,created_at) values (?,?,?,?,?)",
                       (rid, gid, h["label"], next_order, now()))
            next_order += 1
            report.append(f"fixed_expenses: added new row '{h['label']}'")
        for (cid, _), v in zip(cols, h["values"]):
            put(rid, cid, v)
    return report


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("xlsx")
    ap.add_argument("--dry-run", action="store_true", help="parse and validate only, write nothing")
    ap.add_argument("--db", default=str(DEFAULT_DB))
    args = ap.parse_args()

    src = Path(args.xlsx)
    if not src.exists():
        sys.exit(f"File not found: {src}")
    # Read from a temp copy so an open/locked workbook is never touched.
    tmp = Path(tempfile.mkdtemp()) / "workbook.xlsx"
    shutil.copy2(src, tmp)
    wv = openpyxl.load_workbook(tmp, data_only=True)
    wf = openpyxl.load_workbook(tmp)

    warnings = []
    try:
        month_sheets = [ws.title for ws in wv.worksheets if MONTH_SHEET_RE.match(ws.title)]
        if not month_sheets:
            raise ImportError_("no month sheets named like 'ינואר_26' were found")
        if MAIN_SHEET not in wv.sheetnames:
            raise ImportError_(f"sheet '{MAIN_SHEET}' not found")
        data = {"months": [parse_month(wv[t], wf[t], warnings) for t in month_sheets]}
        data["balances"], data["summary"] = parse_main(wv[MAIN_SHEET])
        data["house"] = parse_house(wv[HOUSE_SHEET]) if HOUSE_SHEET in wv.sheetnames else []
    except ImportError_ as e:
        sys.exit(f"IMPORT FAILED: {e}")

    print("== Parsed workbook ==")
    for m in data["months"]:
        t = lambda xs: round(sum(i["amount"] or 0 for i in xs), 2)
        print(f"{m['name']}: start {m['start']} | end {m['end']} | income {len(m['income'])} rows = {t(m['income'])}"
              f" | fixed {len(m['fixed'])} = {t(m['fixed'])} | variable {len(m['variable'])} = {t(m['variable'])}")
    print(f"main balances rows: {len(data['balances'])} | summary rows: {len(data['summary'])} | house rows: {len(data['house'])}")
    print("== Warnings ==" if warnings else "== No warnings ==")
    for w in warnings:
        print(" -", w)

    if args.dry_run:
        print("Dry run: nothing written.")
        return

    db_path = Path(args.db)
    stamp = datetime.datetime.now().strftime("%Y-%m-%d_%H%M%S")
    backup = db_path.with_name(f"budget.backup-{stamp}.db")
    shutil.copy2(db_path, backup)
    print(f"Backup: {backup}")

    db = sqlite3.connect(db_path)
    try:
        with db:
            report = write(db, data)
    except ImportError_ as e:
        sys.exit(f"IMPORT FAILED (database unchanged): {e}")
    finally:
        db.close()
    for line in report:
        print(" -", line)
    print("Import complete.")


if __name__ == "__main__":
    main()
