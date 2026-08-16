from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.dependencies import get_current_user
from app.models.grid import Grid, GridCell, GridColumn, GridRow
from app.models.user import User
from app.schemas.grid import (
    GridCellRead,
    GridCellUpsert,
    GridColumnCreate,
    GridColumnRead,
    GridRead,
    GridRowCreate,
    GridRowRead,
)

router = APIRouter(prefix="/grids", tags=["grids"])


async def _get_grid_or_404(db: AsyncSession, key: str) -> Grid:
    result = await db.execute(
        select(Grid)
        .options(
            selectinload(Grid.columns),
            selectinload(Grid.rows).selectinload(GridRow.cells),
        )
        .where(Grid.key == key)
    )
    grid = result.scalar_one_or_none()
    if grid is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Grid not found")
    return grid


@router.get("/{key}", response_model=GridRead)
async def get_grid(
    key: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await _get_grid_or_404(db, key)


@router.post("/{key}/columns", response_model=GridColumnRead)
async def add_column(
    key: str,
    payload: GridColumnCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    grid = await _get_grid_or_404(db, key)
    max_order = max((c.order_index for c in grid.columns), default=-1)
    column = GridColumn(grid_id=grid.id, label=payload.label, order_index=max_order + 1)
    db.add(column)
    await db.commit()
    await db.refresh(column)
    return column


@router.post("/{key}/rows", response_model=GridRowRead)
async def add_row(
    key: str,
    payload: GridRowCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    grid = await _get_grid_or_404(db, key)
    max_order = max((r.order_index for r in grid.rows), default=-1)
    row = GridRow(grid_id=grid.id, label=payload.label, order_index=max_order + 1)
    db.add(row)
    await db.commit()
    await db.refresh(row)
    # A brand-new row has no cells yet; skip the relationship to avoid a lazy
    # load outside greenlet context (async SQLAlchemy can't lazy-load here).
    return GridRowRead(id=row.id, label=row.label, order_index=row.order_index, cells=[])


@router.delete("/{key}/columns/{column_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_column(
    key: str,
    column_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    grid = await _get_grid_or_404(db, key)
    result = await db.execute(
        select(GridColumn).where(GridColumn.id == column_id, GridColumn.grid_id == grid.id)
    )
    column = result.scalar_one_or_none()
    if column is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Column not found")
    await db.delete(column)
    await db.commit()
    return None


@router.delete("/{key}/rows/{row_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_row(
    key: str,
    row_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    grid = await _get_grid_or_404(db, key)
    result = await db.execute(
        select(GridRow).where(GridRow.id == row_id, GridRow.grid_id == grid.id)
    )
    row = result.scalar_one_or_none()
    if row is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Row not found")
    await db.delete(row)
    await db.commit()
    return None


@router.put("/{key}/cells", response_model=GridCellRead)
async def upsert_cell(
    key: str,
    payload: GridCellUpsert,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    grid = await _get_grid_or_404(db, key)
    row_ids = {r.id for r in grid.rows}
    column_ids = {c.id for c in grid.columns}
    if payload.row_id not in row_ids or payload.column_id not in column_ids:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="row_id/column_id do not belong to this grid",
        )

    result = await db.execute(
        select(GridCell).where(
            GridCell.row_id == payload.row_id, GridCell.column_id == payload.column_id
        )
    )
    cell = result.scalar_one_or_none()
    if cell is None:
        cell = GridCell(row_id=payload.row_id, column_id=payload.column_id, value=payload.value)
        db.add(cell)
    else:
        cell.value = payload.value

    await db.commit()
    await db.refresh(cell)
    return cell
