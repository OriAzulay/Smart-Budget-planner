---
name: upload_xml
description: Import a RiseUp-style budget Excel workbook (.xlsx, e.g. RiseUp2026.xlsx) into the Smart Budget app, overwriting all existing budget data (months, line items, dashboard tables). Use when the user attaches or points to such a workbook and asks to load, upload, sync or import it into the app.
argument-hint: <path to .xlsx>
disable-model-invocation: true
allowed-tools: Read, Write, Glob, Grep, Bash
---

# upload_xml: import a budget workbook into the app

Loads the user's budget workbook into `backend/budget.db`, **replacing all existing budget data**. Users and the table structure (row and column names) are kept. Everything else comes from the Excel file.

## Steps

1. **Get the file.** Use the path in the arguments or the attached file. If none was given, ask for it. Work only with that one file, and never edit the workbook. The script reads a temp copy, so it's fine if the file is open in Excel.
2. **Dry run.**
   ```bash
   python .claude/skills/upload_xml/scripts/import_excel.py "<path.xlsx>" --dry-run
   ```
   Run from the repo root. On Windows, prefix the command with `PYTHONIOENCODING=utf-8` so Hebrew prints. If `openpyxl` is missing: `python -m pip install openpyxl`.
3. **Check the output.**
   - `IMPORT FAILED` means the workbook layout differs from what's expected (see below). Tell the user what's missing and stop.
   - A warning that a **total doesn't match** or a **row is outside the ranges** means data would be lost or miscounted. Show it to the user and ask before continuing.
   - "has no amount (saved as 0)" warnings are expected. Mention them in the summary; there's no need to ask.
4. **Import.** Run the same command without `--dry-run`. The script first saves a backup, `backend/budget.backup-<timestamp>.db`, then writes everything in one transaction. If anything fails, nothing changes.
5. **Report** to the user, in Hebrew:
   - the months imported, with income, fixed and variable totals for each
   - the warnings
   - the backup file path
   - that the change is already live and a browser refresh shows it

   The backend can stay running, because SQLite picks up the change.

## Fixed rules (agreed with the user, built into the script)

- A blank cell or a cell with `-` stays **empty**. A month line item has to have an amount, so a named row with no amount is saved as **0**.
- **Month sheets** are named `<חודש>_<yy>` (for example `ינואר_26`) and become the month tabs `<חודש> 20<yy>`, in workbook order. All existing months are deleted first.
  - **Income** is every row between "מקור הכנסה" and "סכום עו"ש התחלתי". Extra income rows are added even when the Excel total skips them.
  - **Fixed and variable expenses** come from the `=SUM(Cx:Cy)` formulas under the summary labels "הוצאות קבועות" / "הוצאות משתנות". Column D goes into the notes.
  - **Opening and closing balances** come from "סכום עו"ש התחלתי" / "סכום עו"ש סופי".
  - Income such as "פרעון פיקדון" is imported as is, like any other income row.
- **The "עמוד ראשי" sheet becomes the main tab:**
  - The **יתרות חודשיות** table gets opening balance, closing balance, deposit, and **only "השקעות ניצן"** in the investments column. Ori's investments, אוצר החייל, בנק לאומי and the Excel total are **not** imported. Rows are matched by position: opening December, then January to December.
  - The **סיכום חודשי** table gets savings, expenses and income, matched by month name.
- **The "הוצאות בית" sheet becomes the "הוצאות קבועות" tab** (grid `fixed_expenses`). Rows are matched by name, and a new name becomes a new row. Columns are matched by position: December, then January to December. The Excel total row is skipped, because the app calculates it.

## When the workbook changes shape

The script finds tables by their **header text**, not by fixed cell positions, so moved rows or columns are fine. If headers are renamed or a sheet is renamed, update the constants and lookups in `scripts/import_excel.py` (`MAIN_SHEET`, `HOUSE_SHEET`, the label strings in `parse_month` / `parse_main` / `parse_house`). Then dry-run again.
