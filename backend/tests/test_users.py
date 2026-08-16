import pytest

from tests.conftest import auth_headers

pytestmark = pytest.mark.asyncio


async def test_list_users_requires_admin(client, regular_user):
    resp = await client.get("/users", headers=auth_headers(regular_user))
    assert resp.status_code == 403


async def test_list_users_as_admin(client, admin_user, regular_user):
    resp = await client.get("/users", headers=auth_headers(admin_user))
    assert resp.status_code == 200
    emails = {u["email"] for u in resp.json()}
    assert {admin_user.email, regular_user.email} <= emails


async def test_get_user_as_admin(client, admin_user, regular_user):
    resp = await client.get(f"/users/{regular_user.id}", headers=auth_headers(admin_user))
    assert resp.status_code == 200
    assert resp.json()["id"] == str(regular_user.id)


async def test_get_user_not_found(client, admin_user):
    resp = await client.get("/users/does-not-exist", headers=auth_headers(admin_user))
    assert resp.status_code == 404


async def test_update_user_as_admin(client, admin_user, regular_user):
    resp = await client.patch(
        f"/users/{regular_user.id}",
        json={"name": "Renamed"},
        headers=auth_headers(admin_user),
    )
    assert resp.status_code == 200
    assert resp.json()["name"] == "Renamed"


async def test_update_user_requires_admin(client, regular_user):
    resp = await client.patch(
        f"/users/{regular_user.id}",
        json={"name": "Hacked"},
        headers=auth_headers(regular_user),
    )
    assert resp.status_code == 403


async def test_delete_user_as_admin(client, admin_user, regular_user):
    resp = await client.delete(f"/users/{regular_user.id}", headers=auth_headers(admin_user))
    assert resp.status_code == 204

    follow_up = await client.get(f"/users/{regular_user.id}", headers=auth_headers(admin_user))
    assert follow_up.status_code == 404


async def test_delete_user_requires_admin(client, regular_user, admin_user):
    resp = await client.delete(f"/users/{admin_user.id}", headers=auth_headers(regular_user))
    assert resp.status_code == 403
