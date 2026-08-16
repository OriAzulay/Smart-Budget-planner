from pydantic import BaseModel

from app.models.month import LineItemCategory


class MonthLineItemCreate(BaseModel):
    category: LineItemCategory
    source: str
    amount: float = 0
    notes: str | None = None


class MonthLineItemUpdate(BaseModel):
    source: str | None = None
    amount: float | None = None
    notes: str | None = None


class MonthLineItemRead(BaseModel):
    id: str
    category: LineItemCategory
    source: str
    amount: float
    notes: str | None
    order_index: int

    class Config:
        from_attributes = True


class MonthCreate(BaseModel):
    name: str


class MonthUpdate(BaseModel):
    name: str | None = None
    starting_balance: float | None = None
    ending_balance: float | None = None
    notes: str | None = None


class MonthSummary(BaseModel):
    id: str
    name: str
    order_index: int

    class Config:
        from_attributes = True


class MonthRead(BaseModel):
    id: str
    name: str
    order_index: int
    starting_balance: float
    ending_balance: float
    notes: str | None
    line_items: list[MonthLineItemRead]
    total_income: float
    total_fixed_expenses: float
    total_variable_expenses: float
    total_expenses: float
    balance: float
