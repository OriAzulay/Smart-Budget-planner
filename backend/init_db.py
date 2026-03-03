"""Script to create database tables and admin user."""
import asyncio
from app.database import engine, AsyncSessionLocal
from app.models.base import Base
from app.models.user import User, UserRole
from app.services.auth_service import hash_password
from sqlalchemy import select


async def init_db():
    # Create tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("Database tables created!")
    
    # Create admin user
    async with AsyncSessionLocal() as session:
        result = await session.execute(
            select(User).where(User.email == "admin@admin.com")
        )
        existing = result.scalar_one_or_none()
        
        if existing:
            print("Admin user already exists!")
        else:
            admin = User(
                email="admin@admin.com",
                name="Admin User",
                hashed_password=hash_password("admin123"),
                role=UserRole.ADMIN,
                is_active=True,
            )
            session.add(admin)
            await session.commit()
            print("Admin user created!")
    
    print("\n=== Login Credentials ===")
    print("Email: admin@admin.com")
    print("Password: admin123")


if __name__ == "__main__":
    asyncio.run(init_db())
