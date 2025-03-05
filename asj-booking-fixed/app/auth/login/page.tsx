"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase"
import { useUser } from "@/lib/store"
import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"
import Link from "next/link"
import { Home, Loader2 } from "lucide-react"

export default function LoginPage() {
  const searchParams = useSearchParams()
  const userType = (searchParams.get("type") as "host" | "guest") || "guest"
  const router = useRouter()
  const { toast } = useToast()
  const { checkAuth } = useUser()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !password) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter your email and password",
      })
      return
    }

    try {
      setLoading(true)

      // Sign in with Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      if (!data.user) {
        throw new Error("Failed to log in")
      }

      // Check if user is registered as the correct type
      const userId = data.user.id

      if (userType === "host") {
        const { data: hostData, error: hostError } = await supabase.from("hosts").select("*").eq("user_id", userId)

        if (hostError) {
          console.error("Host lookup error:", hostError)
          throw new Error("Error checking host profile")
        }

        if (!hostData || hostData.length === 0) {
          await supabase.auth.signOut()
          throw new Error("You are not registered as a host. Please log in as a guest or register as a host.")
        }
      } else {
        const { data: guestData, error: guestError } = await supabase.from("guests").select("*").eq("user_id", userId)

        if (guestError) {
          console.error("Guest lookup error:", guestError)
          throw new Error("Error checking guest profile")
        }

        if (!guestData || guestData.length === 0) {
          await supabase.auth.signOut()
          throw new Error("You are not registered as a guest. Please log in as a host or register as a guest.")
        }
      }

      // Refresh auth state
      await checkAuth()

      toast({
        title: "Login successful",
        description: "Welcome back!",
      })

      // Redirect to dashboard
      router.push(userType === "host" ? "/host" : "/guest")
    } catch (error: any) {
      console.error("Login error:", error)
      toast({
        variant: "destructive",
        title: "Login failed",
        description: error.message || "Invalid email or password",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-b from-blue-50 to-white">
      <Link href="/" className="absolute top-8 left-8 flex items-center gap-2 text-lg font-bold">
        <Home className="h-5 w-5" />
        ASJ Booking
      </Link>

      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Log in as a {userType === "host" ? "Host" : "Guest"}</CardTitle>
          <CardDescription>Enter your credentials to access your account</CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                "Log in"
              )}
            </Button>

            <div className="text-center text-sm">
              Don't have an account?{" "}
              <Link href={`/auth/register?type=${userType}`} className="text-primary hover:underline">
                Register
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

