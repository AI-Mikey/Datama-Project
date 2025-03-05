"use client"

import type React from "react"
import { Navbar } from "@/components/navbar"
import { useUser } from "@/lib/store"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function HostLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { userType, loading } = useUser()
  const router = useRouter()

  useEffect(() => {
    // If not in host mode and not loading, redirect to home
    if (!loading && userType !== "host") {
      router.push("/")
    }
  }, [userType, loading, router])

  // Don't render anything until we've checked the auth
  if (loading) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>
  }

  // Don't render anything if not a host
  if (userType !== "host") {
    return null
  }

  return (
    <>
      <Navbar />
      <main className="container py-6">{children}</main>
    </>
  )
}

