import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { InlineAddPopover } from "./InlineAddPopover"

describe("InlineAddPopover", () => {
  it("is closed by default and opens when the trigger is clicked", async () => {
    const user = userEvent.setup()
    render(<InlineAddPopover triggerLabel="הוסף שורה" onSubmit={vi.fn()} />)

    expect(screen.queryByRole("textbox")).not.toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: /הוסף שורה/ }))
    expect(screen.getByRole("textbox")).toBeInTheDocument()
  })

  it("submits the trimmed value and closes the popover", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    const user = userEvent.setup()
    render(<InlineAddPopover triggerLabel="הוסף עמודה" onSubmit={onSubmit} />)

    await user.click(screen.getByRole("button", { name: /הוסף עמודה/ }))
    await user.type(screen.getByRole("textbox"), "  New Column  ")
    await user.click(screen.getByRole("button", { name: "הוסף" }))

    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith("New Column"))
    await waitFor(() => expect(screen.queryByRole("textbox")).not.toBeInTheDocument())
  })

  it("does not submit an empty or whitespace-only value", async () => {
    const onSubmit = vi.fn()
    const user = userEvent.setup()
    render(<InlineAddPopover triggerLabel="הוסף פריט" onSubmit={onSubmit} />)

    await user.click(screen.getByRole("button", { name: "הוסף פריט" }))
    expect(screen.getByRole("button", { name: "הוסף" })).toBeDisabled()

    await user.type(screen.getByRole("textbox"), "   ")
    expect(screen.getByRole("button", { name: "הוסף" })).toBeDisabled()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it("closes without submitting when clicking outside", async () => {
    const onSubmit = vi.fn()
    const user = userEvent.setup()
    render(
      <div>
        <InlineAddPopover triggerLabel="הוסף פריט" onSubmit={onSubmit} />
        <button>outside</button>
      </div>
    )

    await user.click(screen.getByRole("button", { name: "הוסף פריט" }))
    expect(screen.getByRole("textbox")).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "outside" }))
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it("renders a custom form body via children instead of the default input", async () => {
    const user = userEvent.setup()
    render(
      <InlineAddPopover triggerLabel="הוסף חודש" onSubmit={vi.fn()}>
        {({ close }) => (
          <button onClick={close}>custom close</button>
        )}
      </InlineAddPopover>
    )

    await user.click(screen.getByRole("button", { name: "הוסף חודש" }))
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument()
    expect(screen.getByRole("button", { name: "custom close" })).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "custom close" }))
    expect(screen.queryByRole("button", { name: "custom close" })).not.toBeInTheDocument()
  })
})
