"""Script to create an admin user."""
import asyncio
from app.database import AsyncSessionLocal
from app.models.user import User, UserRole
from app.services.auth_service import hash_password


async def create_admin():
    async with AsyncSessionLocal() as session:
        # Check if admin already exists
        from sqlalchemy import select
        result = await session.execute(
            select(User).where(User.email == "admin@admin.com")
        )
        existing = result.scalar_one_or_none()
        
        if existing:
            print("Admin user already exists!")
            return
        
        # Create admin user
        admin = User(
            email="admin@admin.com",
            name="Admin User",
            hashed_password=hash_password("admin123"),
            role=UserRole.ADMIN,
            is_active=True,
        )
        session.add(admin)
        await session.commit()
        print("Admin user created successfully!")
        print("Email: admin@admin.com")
        print("Password: admin123")


if __name__ == "__main__":
    asyncio.run(create_admin())
