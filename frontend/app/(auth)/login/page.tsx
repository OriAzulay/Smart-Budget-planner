"use client"

import { useEffect, useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

// DEV TOGGLE: set NEXT_PUBLIC_SKIP_LOGIN=false in frontend/.env.local to restore
// the normal login screen. While true, this page auto-signs-in as the seeded
// admin user instead of showing the form.
const SKIP_LOGIN = process.env.NEXT_PUBLIC_SKIP_LOGIN === "true"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError(result.error)
      } else if (result?.ok) {
        router.push("/dashboard")
      }
    } catch (err) {
      setError("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!SKIP_LOGIN) return
    signIn("credentials", {
      email: "admin@admin.com",
      password: "admin123",
      redirect: false,
    }).then((result) => {
      if (result?.ok) router.push("/dashboard")
    })
  }, [router])

  if (SKIP_LOGIN) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center p-4">
        <p className="text-white text-sm">מתחבר אוטומטית (מצב פיתוח)...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Login</CardTitle>
          <p className="text-sm text-slate-600 mt-2">
            Welcome to Dashboard Platform
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Email
              </label>
              <Input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Password
              </label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <p className="text-sm text-slate-600 text-center mt-4">
            Don't have an account?{" "}
            <Link href="/register" className="text-blue-600 hover:underline">
              Register here
            </Link>
          </p>

          <div className="mt-6 pt-6 border-t border-slate-200">
            <p className="text-xs text-slate-500 text-center mb-2">
              Demo credentials:
            </p>
            <p className="text-xs text-slate-600 text-center">
              Email: admin@example.com
              <br />
              Password: password123
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
