import asyncio

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.pool import StaticPool

from app.database import get_db
from app.main import app
from app.models.base import Base
from app.models.user import User, UserRole
from app.services.auth_service import create_token, hash_password

TEST_DATABASE_URL = "sqlite+aiosqlite://"


@pytest_asyncio.fixture
async def engine():
    engine = create_async_engine(
        TEST_DATABASE_URL,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield engine
    await engine.dispose()


@pytest_asyncio.fixture
async def session_factory(engine):
    return async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


@pytest_asyncio.fixture
async def db_session(session_factory):
    async with session_factory() as session:
        yield session


@pytest_asyncio.fixture
async def client(session_factory):
    async def override_get_db():
        async with session_factory() as session:
            try:
                yield session
            finally:
                await session.close()

    app.dependency_overrides[get_db] = override_get_db
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
    app.dependency_overrides.clear()


async def _create_user(session_factory, *, email, name, password, role, is_active=True):
    async with session_factory() as session:
        user = User(
            email=email,
            name=name,
            hashed_password=hash_password(password),
            role=role,
            is_active=is_active,
        )
        session.add(user)
        await session.commit()
        await session.refresh(user)
        return user


@pytest_asyncio.fixture
async def regular_user(session_factory):
    return await _create_user(
        session_factory,
        email="user@example.com",
        name="Regular User",
        password="password123",
        role=UserRole.USER,
    )


@pytest_asyncio.fixture
async def admin_user(session_factory):
    return await _create_user(
        session_factory,
        email="admin@example.com",
        name="Admin User",
        password="password123",
        role=UserRole.ADMIN,
    )


def auth_headers(user: User) -> dict:
    token = create_token(data={"sub": str(user.id)})
    return {"Authorization": f"Bearer {token}"}
