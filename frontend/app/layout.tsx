import type { Metadata } from "next"
import { Rubik } from "next/font/google"
import { SessionProvider } from "next-auth/react"
import { ThemeProvider, themeInitScript } from "@/components/theme/ThemeProvider"
import "./globals.css"

const rubik = Rubik({
  subsets: ["hebrew", "latin"],
  variable: "--font-rubik",
  display: "swap",
})

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
    <html lang="he" dir="rtl" className={rubik.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="bg-background text-foreground font-sans antialiased">
        <ThemeProvider>
          <SessionProvider>
            {children}
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
