from datetime import datetime

from pydantic import BaseModel


class GridColumnCreate(BaseModel):
    label: str


class GridColumnRead(BaseModel):
    id: str
    label: str
    order_index: int

    class Config:
        from_attributes = True


class GridCellUpsert(BaseModel):
    row_id: str
    column_id: str
    value: float | None = None


class GridCellRead(BaseModel):
    id: str
    row_id: str
    column_id: str
    value: float | None

    class Config:
        from_attributes = True


class GridRowCreate(BaseModel):
    label: str


class GridRowRead(BaseModel):
    id: str
    label: str
    order_index: int
    cells: list[GridCellRead]

    class Config:
        from_attributes = True


class GridRead(BaseModel):
    id: str
    key: str
    title: str
    created_at: datetime
    columns: list[GridColumnRead]
    rows: list[GridRowRead]

    class Config:
        from_attributes = True
