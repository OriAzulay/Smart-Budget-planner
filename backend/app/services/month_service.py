from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.month import Month, MonthLineItem


async def create_month(db: AsyncSession, name: str) -> Month:
    """Create a new month tab. If an earlier month tab already exists, clone its
    line items (source/category/notes, amount reset to 0) as a starting point.
    Otherwise the month starts empty — the user adds rows themselves."""
    max_order = await db.execute(select(func.max(Month.order_index)))
    next_order = (max_order.scalar() or 0) + 1

    # Resolve the template source (the live first month tab, if any) BEFORE
    # inserting the new month — otherwise a first-ever month would find itself
    # via order_index == 1 and clone zero items from itself.
    first_month_result = await db.execute(
        select(Month).where(Month.order_index == 1)
    )
    first_month = first_month_result.scalar_one_or_none()

    month = Month(name=name, order_index=next_order)
    db.add(month)
    await db.flush()

    if first_month is not None:
        items_result = await db.execute(
            select(MonthLineItem)
            .where(MonthLineItem.month_id == first_month.id)
            .order_by(MonthLineItem.order_index)
        )
        for source_item in items_result.scalars().all():
            db.add(
                MonthLineItem(
                    month_id=month.id,
                    category=source_item.category,
                    source=source_item.source,
                    amount=0,
                    notes=source_item.notes,
                    order_index=source_item.order_index,
                )
            )

    await db.commit()
    await db.refresh(month)
    return month
