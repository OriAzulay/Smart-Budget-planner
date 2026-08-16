from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.grid import Grid, GridColumn, GridRow

MONTH_NAMES = [
    "ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני",
    "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר",
]

# 13-month span matching the Excel workbook: prior December + the 12 months of the year.
THIRTEEN_MONTH_LABELS = ["דצמבר"] + MONTH_NAMES

DEFAULT_GRIDS = [
    {
        "key": "monthly_balances",
        "title": "יתרות חודשיות",
        "columns": ["סה\"כ", "עו\"ש התחלתי (תחילת חודש)", "עו\"ש (סוף חודש)", "פיקדון", "השקעות"],
        "rows": THIRTEEN_MONTH_LABELS,
    },
    {
        "key": "monthly_summary",
        "title": "סיכום חודשי",
        "columns": ["חסכון חודשי", "הוצאות", "הכנסות"],
        "rows": MONTH_NAMES,
    },
    {
        "key": "fixed_expenses",
        "title": "הוצאות קבועות",
        "columns": THIRTEEN_MONTH_LABELS,
        "rows": ["שכ\"ד", "ועד", "חשמל", "ארנונה", "גז", "מים", "אינטרנט"],
    },
]


async def seed_default_grids(db: AsyncSession) -> None:
    """Idempotently create the 3 default grids (matching the reference Excel) if missing."""
    for spec in DEFAULT_GRIDS:
        result = await db.execute(select(Grid).where(Grid.key == spec["key"]))
        if result.scalar_one_or_none() is not None:
            continue

        grid = Grid(key=spec["key"], title=spec["title"])
        db.add(grid)
        await db.flush()

        for i, label in enumerate(spec["columns"]):
            db.add(GridColumn(grid_id=grid.id, label=label, order_index=i))
        for i, label in enumerate(spec["rows"]):
            db.add(GridRow(grid_id=grid.id, label=label, order_index=i))

    await db.commit()
