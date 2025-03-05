"use client"

import type React from "react"

import { UserProvider } from "@/lib/store"

export function Providers({ children }: { children: React.ReactNode }) {
  return <UserProvider>{children}</UserProvider>
}

