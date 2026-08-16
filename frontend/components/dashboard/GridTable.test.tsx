import { render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi, beforeEach } from "vitest"
import { GridTable } from "./GridTable"
import type { Grid } from "@/types"

const { gridsApi } = vi.hoisted(() => ({
  gridsApi: {
    get: vi.fn(),
    addColumn: vi.fn(),
    addRow: vi.fn(),
    deleteColumn: vi.fn(),
    deleteRow: vi.fn(),
    upsertCell: vi.fn(),
  },
}))

vi.mock("@/lib/api", () => ({ gridsApi }))

const baseGrid: Grid = {
  id: "grid-1",
  key: "test_grid",
  title: "Test Grid",
  created_at: "2026-01-01T00:00:00Z",
  columns: [
    { id: "col-1", label: "Column A", order_index: 0 },
    { id: "col-2", label: "Column B", order_index: 1 },
  ],
  rows: [
    {
      id: "row-1",
      label: "Row A",
      order_index: 0,
      cells: [
        { id: "cell-1", row_id: "row-1", column_id: "col-1", value: 100 },
        { id: "cell-2", row_id: "row-1", column_id: "col-2", value: 50 },
      ],
    },
  ],
}

describe("GridTable", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    gridsApi.get.mockResolvedValue({ data: baseGrid })
  })

  it("shows a loading state before the grid loads", () => {
    gridsApi.get.mockReturnValue(new Promise(() => {}))
    render(<GridTable gridKey="test_grid" title="Test Grid" />)
    expect(screen.getByText("טוען...")).toBeInTheDocument()
  })

  it("renders columns, rows and computed totals once loaded", async () => {
    render(<GridTable gridKey="test_grid" title="Test Grid" />)

    await screen.findByText("Column A")
    expect(screen.getByText("Column B")).toBeInTheDocument()
    expect(screen.getByText("Row A")).toBeInTheDocument()

    // row total = 100 + 50 = 150, grand total = 150 too (single row)
    const totals = screen.getAllByText((_, el) => Boolean(el?.textContent?.includes("150")))
    expect(totals.length).toBeGreaterThan(0)
  })

  it("marks a cell dirty after edit and saves pending changes on save click", async () => {
    gridsApi.upsertCell.mockResolvedValue({ data: {} })
    const user = userEvent.setup()
    render(<GridTable gridKey="test_grid" title="Test Grid" />)

    await screen.findByText("Column A")
    const saveButton = screen.getByRole("button", { name: /שמירה/ })
    expect(saveButton).toBeDisabled()

    const inputs = screen.getAllByRole("spinbutton") as HTMLInputElement[]
    await user.clear(inputs[0])
    await user.type(inputs[0], "200")
    await user.tab()

    expect(saveButton).not.toBeDisabled()
    await user.click(saveButton)

    await waitFor(() =>
      expect(gridsApi.upsertCell).toHaveBeenCalledWith("test_grid", {
        row_id: "row-1",
        column_id: "col-1",
        value: 200,
      })
    )
    await waitFor(() => expect(saveButton).toBeDisabled())
  })

  it("adds a column through the popover and reloads the grid", async () => {
    gridsApi.addColumn.mockResolvedValue({ data: {} })
    const user = userEvent.setup()
    render(<GridTable gridKey="test_grid" title="Test Grid" />)

    await screen.findByText("Column A")
    await user.click(screen.getByRole("button", { name: /הוסף עמודה/ }))
    await user.type(screen.getByPlaceholderText("שם עמודה"), "Column C")
    await user.click(screen.getByRole("button", { name: "הוסף" }))

    await waitFor(() =>
      expect(gridsApi.addColumn).toHaveBeenCalledWith("test_grid", "Column C")
    )
    expect(gridsApi.get).toHaveBeenCalledTimes(2)
  })

  it("deletes a row after confirmation", async () => {
    gridsApi.deleteRow.mockResolvedValue({ data: {} })
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true)
    const user = userEvent.setup()
    render(<GridTable gridKey="test_grid" title="Test Grid" />)

    await screen.findByText("Row A")
    const rowCell = screen.getByText("Row A").closest("td") as HTMLElement
    await user.click(within(rowCell).getByTitle("מחק שורה"))

    expect(confirmSpy).toHaveBeenCalled()
    await waitFor(() => expect(gridsApi.deleteRow).toHaveBeenCalledWith("test_grid", "row-1"))
    confirmSpy.mockRestore()
  })

  it("does not delete a row when confirmation is declined", async () => {
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(false)
    const user = userEvent.setup()
    render(<GridTable gridKey="test_grid" title="Test Grid" />)

    await screen.findByText("Row A")
    const rowCell = screen.getByText("Row A").closest("td") as HTMLElement
    await user.click(within(rowCell).getByTitle("מחק שורה"))

    expect(gridsApi.deleteRow).not.toHaveBeenCalled()
    confirmSpy.mockRestore()
  })
})
