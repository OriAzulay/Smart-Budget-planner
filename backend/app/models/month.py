from datetime import datetime
from enum import Enum
from uuid import uuid4

from sqlalchemy import DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy import Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class LineItemCategory(str, Enum):
    """Category of a month line item."""

    INCOME = "income"
    FIXED = "fixed_expense"
    VARIABLE = "variable_expense"


class Month(Base):
    """A single month budget tab."""

    __tablename__ = "months"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid4())
    )
    name: Mapped[str] = mapped_column(String(100))
    order_index: Mapped[int] = mapped_column(Integer, unique=True)
    starting_balance: Mapped[float] = mapped_column(Float, default=0)
    ending_balance: Mapped[float] = mapped_column(Float, default=0)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=datetime.utcnow
    )

    line_items: Mapped[list["MonthLineItem"]] = relationship(
        back_populates="month",
        cascade="all, delete-orphan",
        order_by="MonthLineItem.order_index",
    )


class MonthLineItem(Base):
    __tablename__ = "month_line_items"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid4())
    )
    month_id: Mapped[str] = mapped_column(ForeignKey("months.id"))
    category: Mapped[LineItemCategory] = mapped_column(SQLEnum(LineItemCategory))
    source: Mapped[str] = mapped_column(String(255))
    amount: Mapped[float] = mapped_column(Float, default=0)
    notes: Mapped[str | None] = mapped_column(String(500), nullable=True)
    order_index: Mapped[int] = mapped_column(Integer)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=datetime.utcnow
    )

    month: Mapped["Month"] = relationship(back_populates="line_items")
