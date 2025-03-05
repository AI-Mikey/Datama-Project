"use client"

import type React from "react"
import { Navbar } from "@/components/navbar"
import { useUser } from "@/lib/store"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function GuestLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { userType, loading } = useUser()
  const router = useRouter()

  useEffect(() => {
    // If not in guest mode and not loading, redirect to home
    if (!loading && userType !== "guest") {
      router.push("/")
    }
  }, [userType, loading, router])

  // Don't render anything until we've checked the auth
  if (loading) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>
  }

  // Don't render anything if not a guest
  if (userType !== "guest") {
    return null
  }

  return (
    <>
      <Navbar />
      <main className="container py-6">{children}</main>
    </>
  )
}

