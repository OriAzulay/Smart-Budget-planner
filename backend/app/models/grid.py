from datetime import datetime
from uuid import uuid4

from sqlalchemy import DateTime, Float, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class Grid(Base):
    """A named editable grid (predefined columns/rows, user-extensible)."""

    __tablename__ = "grids"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid4())
    )
    key: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    title: Mapped[str] = mapped_column(String(255))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=datetime.utcnow
    )

    columns: Mapped[list["GridColumn"]] = relationship(
        back_populates="grid",
        cascade="all, delete-orphan",
        order_by="GridColumn.order_index",
    )
    rows: Mapped[list["GridRow"]] = relationship(
        back_populates="grid",
        cascade="all, delete-orphan",
        order_by="GridRow.order_index",
    )


class GridColumn(Base):
    __tablename__ = "grid_columns"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid4())
    )
    grid_id: Mapped[str] = mapped_column(ForeignKey("grids.id"))
    label: Mapped[str] = mapped_column(String(255))
    order_index: Mapped[int] = mapped_column(Integer)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=datetime.utcnow
    )

    grid: Mapped["Grid"] = relationship(back_populates="columns")
    cells: Mapped[list["GridCell"]] = relationship(
        back_populates="column", cascade="all, delete-orphan"
    )


class GridRow(Base):
    __tablename__ = "grid_rows"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid4())
    )
    grid_id: Mapped[str] = mapped_column(ForeignKey("grids.id"))
    label: Mapped[str] = mapped_column(String(255))
    order_index: Mapped[int] = mapped_column(Integer)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=datetime.utcnow
    )

    grid: Mapped["Grid"] = relationship(back_populates="rows")
    cells: Mapped[list["GridCell"]] = relationship(
        back_populates="row", cascade="all, delete-orphan"
    )


class GridCell(Base):
    __tablename__ = "grid_cells"
    __table_args__ = (UniqueConstraint("row_id", "column_id", name="uq_gridcell_row_column"),)

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid4())
    )
    row_id: Mapped[str] = mapped_column(ForeignKey("grid_rows.id"))
    column_id: Mapped[str] = mapped_column(ForeignKey("grid_columns.id"))
    value: Mapped[float | None] = mapped_column(Float, nullable=True)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow
    )

    row: Mapped["GridRow"] = relationship(back_populates="cells")
    column: Mapped["GridColumn"] = relationship(back_populates="cells")
