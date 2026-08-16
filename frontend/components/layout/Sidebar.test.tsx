import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi, beforeEach } from "vitest"
import { Sidebar } from "./Sidebar"

const { usePathname, useSession, signOut } = vi.hoisted(() => ({
  usePathname: vi.fn(),
  useSession: vi.fn(),
  signOut: vi.fn(),
}))

vi.mock("next/navigation", () => ({ usePathname }))
vi.mock("next-auth/react", () => ({ useSession, signOut }))

describe("Sidebar", () => {
  beforeEach(() => {
    usePathname.mockReturnValue("/dashboard")
  })

  it("shows the dashboard link for a regular user but hides admin-only links", () => {
    useSession.mockReturnValue({ data: { user: { role: "user" } } })
    render(<Sidebar />)

    expect(screen.getByRole("link", { name: /דשבורד/ })).toBeInTheDocument()
    expect(screen.queryByRole("link", { name: /ניהול משתמשים/ })).not.toBeInTheDocument()
  })

  it("shows admin-only links for an admin user", () => {
    useSession.mockReturnValue({ data: { user: { role: "admin" } } })
    render(<Sidebar />)

    expect(screen.getByRole("link", { name: /ניהול משתמשים/ })).toBeInTheDocument()
  })

  it("highlights the active route", () => {
    usePathname.mockReturnValue("/dashboard")
    useSession.mockReturnValue({ data: { user: { role: "user" } } })
    render(<Sidebar />)

    expect(screen.getByRole("link", { name: /דשבורד/ })).toHaveClass("bg-blue-600")
  })

  it("calls signOut when the logout button is clicked", async () => {
    useSession.mockReturnValue({ data: { user: { role: "user" } } })
    const { default: userEvent } = await import("@testing-library/user-event")
    render(<Sidebar />)

    await userEvent.click(screen.getByRole("button", { name: /התנתקות/ }))
    expect(signOut).toHaveBeenCalled()
  })
})
