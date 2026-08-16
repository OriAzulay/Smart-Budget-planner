import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const { signIn, push } = vi.hoisted(() => ({
  signIn: vi.fn(),
  push: vi.fn(),
}))

vi.mock("next-auth/react", () => ({ signIn }))
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }))

describe("LoginPage", () => {
  const originalSkipLogin = process.env.NEXT_PUBLIC_SKIP_LOGIN

  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
  })

  afterEach(() => {
    process.env.NEXT_PUBLIC_SKIP_LOGIN = originalSkipLogin
  })

  it("logs in with the entered credentials and redirects to the dashboard", async () => {
    process.env.NEXT_PUBLIC_SKIP_LOGIN = "false"
    signIn.mockResolvedValue({ ok: true })
    const { default: LoginPage } = await import("./page")
    const user = userEvent.setup()

    render(<LoginPage />)
    await user.type(screen.getByPlaceholderText("your@email.com"), "user@example.com")
    await user.type(screen.getByPlaceholderText("••••••••"), "password123")
    await user.click(screen.getByRole("button", { name: /Sign In/ }))

    await waitFor(() =>
      expect(signIn).toHaveBeenCalledWith("credentials", {
        email: "user@example.com",
        password: "password123",
        redirect: false,
      })
    )
    await waitFor(() => expect(push).toHaveBeenCalledWith("/dashboard"))
  })

  it("shows an error message when credentials are rejected", async () => {
    process.env.NEXT_PUBLIC_SKIP_LOGIN = "false"
    signIn.mockResolvedValue({ error: "Invalid email or password" })
    const { default: LoginPage } = await import("./page")
    const user = userEvent.setup()

    render(<LoginPage />)
    await user.type(screen.getByPlaceholderText("your@email.com"), "user@example.com")
    await user.type(screen.getByPlaceholderText("••••••••"), "wrongpassword")
    await user.click(screen.getByRole("button", { name: /Sign In/ }))

    expect(await screen.findByText("Invalid email or password")).toBeInTheDocument()
    expect(push).not.toHaveBeenCalled()
  })

  it("auto-signs-in and redirects when the dev skip-login toggle is on", async () => {
    process.env.NEXT_PUBLIC_SKIP_LOGIN = "true"
    signIn.mockResolvedValue({ ok: true })
    const { default: LoginPage } = await import("./page")

    render(<LoginPage />)
    expect(screen.getByText(/מתחבר אוטומטית/)).toBeInTheDocument()

    await waitFor(() =>
      expect(signIn).toHaveBeenCalledWith("credentials", {
        email: "admin@admin.com",
        password: "admin123",
        redirect: false,
      })
    )
    await waitFor(() => expect(push).toHaveBeenCalledWith("/dashboard"))
  })
})
