"use client"

import { Moon, Sun } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTheme } from "./ThemeProvider"

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === "dark"

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label="מצב לילה"
      onClick={toggleTheme}
      className={cn(
        "relative h-8 w-[60px] shrink-0 rounded-full transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        isDark ? "bg-primary" : "bg-accent"
      )}
    >
      <span
        className={cn(
          "absolute top-[3px] flex h-[26px] w-[26px] items-center justify-center rounded-full shadow-sm transition-all duration-300",
          isDark ? "right-[31px] bg-background text-secondary" : "right-[3px] bg-surface text-warning"
        )}
      >
        {isDark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
      </span>
    </button>
  )
}
