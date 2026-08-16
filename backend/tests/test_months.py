import pytest

from tests.conftest import auth_headers

pytestmark = pytest.mark.asyncio


async def test_list_months_empty(client, regular_user):
    resp = await client.get("/months", headers=auth_headers(regular_user))
    assert resp.status_code == 200
    assert resp.json() == []


async def test_add_month_creates_first_month(client, regular_user):
    resp = await client.post(
        "/months", json={"name": "January"}, headers=auth_headers(regular_user)
    )
    assert resp.status_code == 200
    body = resp.json()
    assert body["name"] == "January"
    assert body["order_index"] == 1
    assert body["line_items"] == []
    assert body["balance"] == 0


async def test_second_month_clones_line_items_from_first(client, regular_user):
    headers = auth_headers(regular_user)
    first = await client.post("/months", json={"name": "January"}, headers=headers)
    first_id = first.json()["id"]

    await client.post(
        f"/months/{first_id}/line-items",
        json={"category": "income", "source": "Salary", "amount": 5000},
        headers=headers,
    )

    second = await client.post("/months", json={"name": "February"}, headers=headers)
    body = second.json()
    assert body["order_index"] == 2
    assert len(body["line_items"]) == 1
    assert body["line_items"][0]["source"] == "Salary"
    # amount resets to 0 for the cloned item
    assert body["line_items"][0]["amount"] == 0


async def test_get_month_not_found(client, regular_user):
    resp = await client.get("/months/does-not-exist", headers=auth_headers(regular_user))
    assert resp.status_code == 404


async def test_update_month(client, regular_user):
    headers = auth_headers(regular_user)
    created = await client.post("/months", json={"name": "January"}, headers=headers)
    month_id = created.json()["id"]

    resp = await client.patch(
        f"/months/{month_id}",
        json={"starting_balance": 1000, "notes": "hello"},
        headers=headers,
    )
    assert resp.status_code == 200
    body = resp.json()
    assert body["starting_balance"] == 1000
    assert body["notes"] == "hello"


async def test_delete_month(client, regular_user):
    headers = auth_headers(regular_user)
    created = await client.post("/months", json={"name": "January"}, headers=headers)
    month_id = created.json()["id"]

    resp = await client.delete(f"/months/{month_id}", headers=headers)
    assert resp.status_code == 204

    follow_up = await client.get(f"/months/{month_id}", headers=headers)
    assert follow_up.status_code == 404


async def test_line_item_totals_are_computed(client, regular_user):
    headers = auth_headers(regular_user)
    created = await client.post("/months", json={"name": "January"}, headers=headers)
    month_id = created.json()["id"]

    await client.post(
        f"/months/{month_id}/line-items",
        json={"category": "income", "source": "Salary", "amount": 5000},
        headers=headers,
    )
    await client.post(
        f"/months/{month_id}/line-items",
        json={"category": "fixed_expense", "source": "Rent", "amount": 1500},
        headers=headers,
    )
    await client.post(
        f"/months/{month_id}/line-items",
        json={"category": "variable_expense", "source": "Groceries", "amount": 300},
        headers=headers,
    )

    resp = await client.get(f"/months/{month_id}", headers=headers)
    body = resp.json()
    assert body["total_income"] == 5000
    assert body["total_fixed_expenses"] == 1500
    assert body["total_variable_expenses"] == 300
    assert body["total_expenses"] == 1800
    assert body["balance"] == 3200


async def test_update_line_item(client, regular_user):
    headers = auth_headers(regular_user)
    created = await client.post("/months", json={"name": "January"}, headers=headers)
    month_id = created.json()["id"]
    item = await client.post(
        f"/months/{month_id}/line-items",
        json={"category": "income", "source": "Salary", "amount": 5000},
        headers=headers,
    )
    item_id = item.json()["id"]

    resp = await client.patch(
        f"/months/{month_id}/line-items/{item_id}",
        json={"amount": 6000},
        headers=headers,
    )
    assert resp.status_code == 200
    assert resp.json()["amount"] == 6000


async def test_delete_line_item(client, regular_user):
    headers = auth_headers(regular_user)
    created = await client.post("/months", json={"name": "January"}, headers=headers)
    month_id = created.json()["id"]
    item = await client.post(
        f"/months/{month_id}/line-items",
        json={"category": "income", "source": "Salary", "amount": 5000},
        headers=headers,
    )
    item_id = item.json()["id"]

    resp = await client.delete(f"/months/{month_id}/line-items/{item_id}", headers=headers)
    assert resp.status_code == 204

    month_resp = await client.get(f"/months/{month_id}", headers=headers)
    assert month_resp.json()["line_items"] == []


async def test_line_item_not_found(client, regular_user):
    headers = auth_headers(regular_user)
    created = await client.post("/months", json={"name": "January"}, headers=headers)
    month_id = created.json()["id"]

    resp = await client.patch(
        f"/months/{month_id}/line-items/does-not-exist",
        json={"amount": 10},
        headers=headers,
    )
    assert resp.status_code == 404
