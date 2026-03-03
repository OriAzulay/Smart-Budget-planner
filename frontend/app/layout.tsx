import type { Metadata } from "next"
import { SessionProvider } from "next-auth/react"
import "./globals.css"

export const metadata: Metadata = {
  title: "Dashboard Platform",
  description: "Professional role-based dashboard platform",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-slate-50">
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  )
}
