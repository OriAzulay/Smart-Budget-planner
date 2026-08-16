import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { Topbar } from "./Topbar"

const { useSession, signOut } = vi.hoisted(() => ({
  useSession: vi.fn(),
  signOut: vi.fn(),
}))

vi.mock("next-auth/react", () => ({ useSession, signOut }))

describe("Topbar", () => {
  it("shows the signed-in user's name and initial", () => {
    useSession.mockReturnValue({ data: { user: { name: "Ori Azualy" } } })
    render(<Topbar />)

    expect(screen.getByText("Ori Azualy")).toBeInTheDocument()
    expect(screen.getByText("O")).toBeInTheDocument()
  })

  it("falls back to a generic label when there is no session", () => {
    useSession.mockReturnValue({ data: null })
    render(<Topbar />)

    expect(screen.getByText("משתמש")).toBeInTheDocument()
    expect(screen.getByText("U")).toBeInTheDocument()
  })

  it("calls signOut when the logout button is clicked", async () => {
    useSession.mockReturnValue({ data: { user: { name: "Ori" } } })
    const { default: userEvent } = await import("@testing-library/user-event")
    render(<Topbar />)

    await userEvent.click(screen.getByRole("button", { name: /התנתקות/ }))
    expect(signOut).toHaveBeenCalled()
  })
})
