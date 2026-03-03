from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, EmailStr

from app.models.user import UserRole


class UserCreate(BaseModel):
    """User creation schema."""

    name: str
    email: EmailStr
    password: str


class UserUpdate(BaseModel):
    """User update schema."""

    name: str | None = None
    email: EmailStr | None = None
    role: UserRole | None = None
    is_active: bool | None = None


class UserRead(BaseModel):
    """User read schema."""

    id: UUID
    name: str
    email: str
    role: UserRole
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True
