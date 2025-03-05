"use client"

import { createContext, useContext, useState, useEffect, type ReactNode, useCallback } from "react"
import type { Guest, Host, UserType } from "./supabase"
import { supabase } from "./supabase"

type UserContextType = {
  isAuthenticated: boolean
  userType: UserType | null
  userId: string | null
  guestId: string | null
  hostId: string | null
  guestData: Guest | null
  hostData: Host | null
  email: string | null
  loading: boolean
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [userType, setUserType] = useState<UserType | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [guestId, setGuestId] = useState<string | null>(null)
  const [hostId, setHostId] = useState<string | null>(null)
  const [guestData, setGuestData] = useState<Guest | null>(null)
  const [hostData, setHostData] = useState<Host | null>(null)
  const [email, setEmail] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  const checkAuth = useCallback(async () => {
    try {
      setLoading(true)

      // Check if user is authenticated
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        setIsAuthenticated(false)
        setUserType(null)
        setUserId(null)
        setGuestId(null)
        setHostId(null)
        setGuestData(null)
        setHostData(null)
        setEmail(null)
        return
      }

      const user = session.user
      setIsAuthenticated(true)
      setUserId(user.id)
      setEmail(user.email)

      // Check if user is a guest
      const { data: guestData } = await supabase.from("guests").select("*").eq("user_id", user.id).single()

      if (guestData) {
        setUserType("guest")
        setGuestId(guestData.guest_id)
        setGuestData(guestData)
        return
      }

      // Check if user is a host
      const { data: hostData } = await supabase.from("hosts").select("*").eq("user_id", user.id).single()

      if (hostData) {
        setUserType("host")
        setHostId(hostData.host_id)
        setHostData(hostData)
      }
    } catch (error) {
      console.error("Error checking authentication:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = async () => {
    try {
      await supabase.auth.signOut()
      setIsAuthenticated(false)
      setUserType(null)
      setUserId(null)
      setGuestId(null)
      setHostId(null)
      setGuestData(null)
      setHostData(null)
      setEmail(null)
    } catch (error) {
      console.error("Error logging out:", error)
    }
  }

  // Check authentication on initial load
  useEffect(() => {
    checkAuth()

    // Set up auth state change listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        checkAuth()
      } else {
        setIsAuthenticated(false)
        setUserType(null)
        setUserId(null)
        setGuestId(null)
        setHostId(null)
        setGuestData(null)
        setHostData(null)
        setEmail(null)
      }
    })

      return (
    <UserContext.Provider value={{
      isAuthenticated,
      userType,
      userId,
      guestId,
      hostId,
      guestData,
      hostData,
      email,
      loading,
      logout,
    }}>
      {children}
    </UserContext.Provider>
  )
checkAuth,
      }}
    >
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider")
  }
  return context
}

