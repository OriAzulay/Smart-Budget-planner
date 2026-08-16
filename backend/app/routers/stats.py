from pydantic import BaseModel
from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import require_admin
from app.models.user import User, UserRole
from datetime import datetime, timedelta

router = APIRouter(prefix="/stats", tags=["stats"])


class StatsOverview(BaseModel):
    """Stats overview response."""

    total_users: int
    active_users: int
    admin_count: int
    new_this_month: int


@router.get("/overview", response_model=StatsOverview)
async def get_stats_overview(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Get overview statistics."""
    # Total users count
    total_result = await db.execute(
        select(func.count(User.id))
    )
    total_users = total_result.scalar() or 0

    # Active users count
    active_result = await db.execute(
        select(func.count(User.id)).where(User.is_active == True)
    )
    active_users = active_result.scalar() or 0

    # Admin count
    admin_result = await db.execute(
        select(func.count(User.id)).where(User.role == UserRole.ADMIN)
    )
    admin_count = admin_result.scalar() or 0

    # New users this month
    start_of_month = datetime.utcnow().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    new_month_result = await db.execute(
        select(func.count(User.id)).where(User.created_at >= start_of_month)
    )
    new_this_month = new_month_result.scalar() or 0

    return StatsOverview(
        total_users=total_users,
        active_users=active_users,
        admin_count=admin_count,
        new_this_month=new_this_month,
    )
