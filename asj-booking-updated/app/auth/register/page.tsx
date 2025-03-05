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

export default function RegisterPage() {
  const searchParams = useSearchParams()
  const userType = (searchParams.get("type") as "host" | "guest") || "guest"
  const router = useRouter()
  const { toast } = useToast()
  const { checkAuth } = useUser()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !password || (userType === "host" && !name)) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill in all fields",
      })
      return
    }

    try {
      setLoading(true)

      // Register user with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      })

      if (authError) throw authError

      if (!authData.user) {
        throw new Error("Failed to create user")
      }

      const userId = authData.user.id

      // Create user profile based on type using the secure functions
      if (userType === "host") {
        // Direct insert since RLS is disabled
        const { error: hostError } = await supabase.from("hosts").insert([{ user_id: userId, name }])

        if (hostError) {
          console.error("Host creation error:", hostError)
          throw new Error("Failed to create host profile: " + hostError.message)
        }
      } else {
        // Direct insert since RLS is disabled
        const { error: guestError } = await supabase.from("guests").insert([{ user_id: userId, preferences: {} }])

        if (guestError) {
          console.error("Guest creation error:", guestError)
          throw new Error("Failed to create guest profile: " + guestError.message)
        }
      }

      toast({
        title: "Registration successful",
        description: "Your account has been created",
      })

      // Refresh auth state
      await checkAuth()

      // Redirect to dashboard
      router.push(userType === "host" ? "/host" : "/guest")
    } catch (error: any) {
      console.error("Registration error:", error)
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: error.message || "An error occurred during registration",
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
          <CardTitle>Register as a {userType === "host" ? "Host" : "Guest"}</CardTitle>
          <CardDescription>
            Create an account to {userType === "host" ? "list your properties" : "book your next stay"}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleRegister}>
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

            {userType === "host" && (
              <div className="space-y-2">
                <Label htmlFor="name">Host Name</Label>
                <Input
                  id="name"
                  placeholder="Your name or business name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            )}
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Registering...
                </>
              ) : (
                "Register"
              )}
            </Button>

            <div className="text-center text-sm">
              Already have an account?{" "}
              <Link href={`/auth/login?type=${userType}`} className="text-primary hover:underline">
                Log in
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

