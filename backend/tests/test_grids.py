import pytest
import pytest_asyncio

from app.models.grid import Grid, GridColumn, GridRow
from tests.conftest import auth_headers

pytestmark = pytest.mark.asyncio


@pytest_asyncio.fixture
async def seeded_grid(session_factory):
    async with session_factory() as session:
        grid = Grid(key="test_grid", title="Test Grid")
        session.add(grid)
        await session.flush()
        column = GridColumn(grid_id=grid.id, label="Col A", order_index=0)
        row = GridRow(grid_id=grid.id, label="Row A", order_index=0)
        session.add_all([column, row])
        await session.commit()
        await session.refresh(grid)
        return {"grid_id": grid.id, "column_id": column.id, "row_id": row.id}


async def test_get_grid_not_found(client, regular_user):
    resp = await client.get("/grids/nope", headers=auth_headers(regular_user))
    assert resp.status_code == 404


async def test_get_grid_requires_auth(client, seeded_grid):
    resp = await client.get("/grids/test_grid")
    assert resp.status_code == 401


async def test_get_grid_returns_columns_and_rows(client, regular_user, seeded_grid):
    resp = await client.get("/grids/test_grid", headers=auth_headers(regular_user))
    assert resp.status_code == 200
    body = resp.json()
    assert body["key"] == "test_grid"
    assert len(body["columns"]) == 1
    assert len(body["rows"]) == 1


async def test_add_column(client, regular_user, seeded_grid):
    resp = await client.post(
        "/grids/test_grid/columns",
        json={"label": "Col B"},
        headers=auth_headers(regular_user),
    )
    assert resp.status_code == 200
    assert resp.json()["order_index"] == 1


async def test_add_row(client, regular_user, seeded_grid):
    resp = await client.post(
        "/grids/test_grid/rows",
        json={"label": "Row B"},
        headers=auth_headers(regular_user),
    )
    assert resp.status_code == 200
    assert resp.json()["order_index"] == 1


async def test_upsert_cell_creates_then_updates(client, regular_user, seeded_grid):
    payload = {
        "row_id": seeded_grid["row_id"],
        "column_id": seeded_grid["column_id"],
        "value": 42.5,
    }
    create_resp = await client.put(
        "/grids/test_grid/cells", json=payload, headers=auth_headers(regular_user)
    )
    assert create_resp.status_code == 200
    assert create_resp.json()["value"] == 42.5

    payload["value"] = 99.0
    update_resp = await client.put(
        "/grids/test_grid/cells", json=payload, headers=auth_headers(regular_user)
    )
    assert update_resp.status_code == 200
    assert update_resp.json()["value"] == 99.0
    assert update_resp.json()["id"] == create_resp.json()["id"]


async def test_upsert_cell_rejects_foreign_ids(client, regular_user, seeded_grid):
    resp = await client.put(
        "/grids/test_grid/cells",
        json={"row_id": "not-in-grid", "column_id": seeded_grid["column_id"], "value": 1},
        headers=auth_headers(regular_user),
    )
    assert resp.status_code == 400


async def test_delete_column(client, regular_user, seeded_grid):
    resp = await client.delete(
        f"/grids/test_grid/columns/{seeded_grid['column_id']}",
        headers=auth_headers(regular_user),
    )
    assert resp.status_code == 204

    grid_resp = await client.get("/grids/test_grid", headers=auth_headers(regular_user))
    assert grid_resp.json()["columns"] == []


async def test_delete_row_not_found(client, regular_user, seeded_grid):
    resp = await client.delete(
        "/grids/test_grid/rows/does-not-exist",
        headers=auth_headers(regular_user),
    )
    assert resp.status_code == 404
