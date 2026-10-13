import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it } from "vitest"
import { ThemeProvider, THEME_STORAGE_KEY } from "./ThemeProvider"
import { ThemeToggle } from "./ThemeToggle"

function renderToggle() {
  return render(
    <ThemeProvider>
      <ThemeToggle />
    </ThemeProvider>
  )
}

describe("ThemeToggle", () => {
  beforeEach(() => {
    document.documentElement.classList.remove("dark")
    localStorage.clear()
  })

  it("starts in light mode by default", () => {
    renderToggle()

    expect(screen.getByRole("switch", { name: "מצב לילה" })).toHaveAttribute("aria-checked", "false")
    expect(document.documentElement).not.toHaveClass("dark")
  })

  it("switches to dark mode and back, persisting the choice", async () => {
    renderToggle()
    const toggle = screen.getByRole("switch", { name: "מצב לילה" })

    await userEvent.click(toggle)
    expect(toggle).toHaveAttribute("aria-checked", "true")
    expect(document.documentElement).toHaveClass("dark")
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark")

    await userEvent.click(toggle)
    expect(toggle).toHaveAttribute("aria-checked", "false")
    expect(document.documentElement).not.toHaveClass("dark")
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("light")
  })

  it("picks up a dark theme already applied by the init script", () => {
    document.documentElement.classList.add("dark")
    renderToggle()

    expect(screen.getByRole("switch", { name: "מצב לילה" })).toHaveAttribute("aria-checked", "true")
  })
})
