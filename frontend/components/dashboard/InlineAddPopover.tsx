"use client"

import { useState, useRef, useEffect } from "react"
import { Plus } from "lucide-react"

interface InlineAddPopoverProps {
  triggerLabel: string
  inputPlaceholder?: string
  onSubmit: (value: string) => Promise<void> | void
  /** Render a custom form body instead of the default single text input. */
  children?: (props: { close: () => void }) => React.ReactNode
}

export function InlineAddPopover({
  triggerLabel,
  inputPlaceholder,
  onSubmit,
  children,
}: InlineAddPopoverProps) {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const close = () => {
    setOpen(false)
    setValue("")
  }

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) close()
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!value.trim() || submitting) return
    setSubmitting(true)
    try {
      await onSubmit(value.trim())
      close()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="relative inline-block" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-md transition-colors border border-dashed border-blue-300"
      >
        <Plus className="w-3.5 h-3.5" />
        {triggerLabel}
      </button>

      {open && (
        <div className="absolute z-50 top-full mt-1 right-0 w-56 bg-white border border-slate-200 rounded-lg shadow-lg p-3">
          {children ? (
            children({ close })
          ) : (
            <form onSubmit={handleSubmit} className="space-y-2">
              <input
                autoFocus
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={inputPlaceholder}
                className="w-full border border-slate-200 rounded px-2 py-1.5 text-sm text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-400"
              />
              <button
                type="submit"
                disabled={submitting || !value.trim()}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded px-2 py-1.5 transition-colors"
              >
                הוסף
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  )
}
