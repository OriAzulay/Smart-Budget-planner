from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.dependencies import get_current_user
from app.models.month import LineItemCategory, Month, MonthLineItem
from app.models.user import User
from app.schemas.month import (
    MonthCreate,
    MonthLineItemCreate,
    MonthLineItemRead,
    MonthLineItemUpdate,
    MonthRead,
    MonthSummary,
    MonthUpdate,
)
from app.services.month_service import create_month

router = APIRouter(prefix="/months", tags=["months"])


def _to_month_read(month: Month) -> MonthRead:
    total_income = sum(
        i.amount for i in month.line_items if i.category == LineItemCategory.INCOME
    )
    total_fixed = sum(
        i.amount for i in month.line_items if i.category == LineItemCategory.FIXED
    )
    total_variable = sum(
        i.amount for i in month.line_items if i.category == LineItemCategory.VARIABLE
    )
    total_expenses = total_fixed + total_variable

    return MonthRead(
        id=month.id,
        name=month.name,
        order_index=month.order_index,
        starting_balance=month.starting_balance,
        ending_balance=month.ending_balance,
        notes=month.notes,
        line_items=[MonthLineItemRead.model_validate(i) for i in month.line_items],
        total_income=total_income,
        total_fixed_expenses=total_fixed,
        total_variable_expenses=total_variable,
        total_expenses=total_expenses,
        balance=total_income - total_expenses,
    )


async def _get_month_or_404(db: AsyncSession, month_id: str) -> Month:
    result = await db.execute(
        select(Month)
        .options(selectinload(Month.line_items))
        .where(Month.id == month_id)
    )
    month = result.scalar_one_or_none()
    if month is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Month not found")
    return month


@router.get("", response_model=list[MonthSummary])
async def list_months(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(Month).order_by(Month.order_index))
    return result.scalars().all()


@router.post("", response_model=MonthRead)
async def add_month(
    payload: MonthCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    month = await create_month(db, payload.name)
    month = await _get_month_or_404(db, month.id)
    return _to_month_read(month)


@router.get("/{month_id}", response_model=MonthRead)
async def get_month(
    month_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    month = await _get_month_or_404(db, month_id)
    return _to_month_read(month)


@router.patch("/{month_id}", response_model=MonthRead)
async def update_month(
    month_id: str,
    payload: MonthUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    month = await _get_month_or_404(db, month_id)
    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(month, field, value)
    await db.commit()
    month = await _get_month_or_404(db, month_id)
    return _to_month_read(month)


@router.delete("/{month_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_month(
    month_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    month = await _get_month_or_404(db, month_id)
    await db.delete(month)
    await db.commit()
    return None


@router.post("/{month_id}/line-items", response_model=MonthLineItemRead)
async def add_line_item(
    month_id: str,
    payload: MonthLineItemCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    month = await _get_month_or_404(db, month_id)
    max_order = max((i.order_index for i in month.line_items), default=-1)
    item = MonthLineItem(
        month_id=month.id,
        category=payload.category,
        source=payload.source,
        amount=payload.amount,
        notes=payload.notes,
        order_index=max_order + 1,
    )
    db.add(item)
    await db.commit()
    await db.refresh(item)
    return item


@router.patch("/{month_id}/line-items/{item_id}", response_model=MonthLineItemRead)
async def update_line_item(
    month_id: str,
    item_id: str,
    payload: MonthLineItemUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(MonthLineItem).where(
            MonthLineItem.id == item_id, MonthLineItem.month_id == month_id
        )
    )
    item = result.scalar_one_or_none()
    if item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Line item not found")

    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(item, field, value)

    await db.commit()
    await db.refresh(item)
    return item


@router.delete("/{month_id}/line-items/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_line_item(
    month_id: str,
    item_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(MonthLineItem).where(
            MonthLineItem.id == item_id, MonthLineItem.month_id == month_id
        )
    )
    item = result.scalar_one_or_none()
    if item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Line item not found")
    await db.delete(item)
    await db.commit()
    return None
