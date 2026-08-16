import pytest

from tests.conftest import auth_headers

pytestmark = pytest.mark.asyncio


async def test_register_creates_user(client):
    resp = await client.post(
        "/auth/register",
        json={"name": "New User", "email": "new@example.com", "password": "password123"},
    )
    assert resp.status_code == 200
    body = resp.json()
    assert body["email"] == "new@example.com"
    assert body["role"] == "user"
    assert "hashed_password" not in body


async def test_register_rejects_duplicate_email(client, regular_user):
    resp = await client.post(
        "/auth/register",
        json={"name": "Dupe", "email": regular_user.email, "password": "password123"},
    )
    assert resp.status_code == 400


async def test_login_succeeds_with_correct_credentials(client, regular_user):
    resp = await client.post(
        "/auth/login",
        json={"email": regular_user.email, "password": "password123"},
    )
    assert resp.status_code == 200
    body = resp.json()
    assert body["token_type"] == "bearer"
    assert body["access_token"]


async def test_login_rejects_wrong_password(client, regular_user):
    resp = await client.post(
        "/auth/login",
        json={"email": regular_user.email, "password": "wrongpassword"},
    )
    assert resp.status_code == 401


async def test_login_rejects_unknown_email(client):
    resp = await client.post(
        "/auth/login",
        json={"email": "nobody@example.com", "password": "password123"},
    )
    assert resp.status_code == 401


async def test_login_rejects_inactive_user(client, session_factory):
    from app.models.user import User, UserRole
    from app.services.auth_service import hash_password

    async with session_factory() as session:
        user = User(
            email="inactive@example.com",
            name="Inactive",
            hashed_password=hash_password("password123"),
            role=UserRole.USER,
            is_active=False,
        )
        session.add(user)
        await session.commit()

    resp = await client.post(
        "/auth/login",
        json={"email": "inactive@example.com", "password": "password123"},
    )
    assert resp.status_code == 403


async def test_me_returns_current_user(client, regular_user):
    resp = await client.get("/auth/me", headers=auth_headers(regular_user))
    assert resp.status_code == 200
    assert resp.json()["email"] == regular_user.email


async def test_me_rejects_missing_token(client):
    resp = await client.get("/auth/me")
    assert resp.status_code == 401


async def test_me_rejects_invalid_token(client):
    resp = await client.get("/auth/me", headers={"Authorization": "Bearer garbage"})
    assert resp.status_code == 401
