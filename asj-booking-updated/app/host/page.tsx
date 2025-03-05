"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useUser } from "@/lib/store"
import { supabase } from "@/lib/supabase"
import { useEffect, useState } from "react"
import { Building, Home, Star, Users } from "lucide-react"
import Link from "next/link"

export default function HostDashboard() {
  const { hostId, hostData } = useUser()
  const [propertyCount, setPropertyCount] = useState(0)
  const [bookingCount, setBookingCount] = useState(0)
  const [recentBookings, setRecentBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchDashboardData() {
      if (!hostId) return

      try {
        setLoading(true)

        // Get property count
        const { count: propCount } = await supabase
          .from("properties")
          .select("*", { count: "exact", head: true })
          .eq("host_id", hostId)

        if (propCount !== null) {
          setPropertyCount(propCount)
        }

        // Get properties
        const { data: properties } = await supabase.from("properties").select("property_id").eq("host_id", hostId)

        if (properties && properties.length > 0) {
          const propertyIds = properties.map((p) => p.property_id)

          // Get booking count
          const { count: bookCount } = await supabase
            .from("bookings")
            .select("*", { count: "exact", head: true })
            .in("property_id", propertyIds)

          if (bookCount !== null) {
            setBookingCount(bookCount)
          }

          // Get recent bookings
          const { data: bookings } = await supabase
            .from("bookings")
            .select(`
              booking_id,
              check_in_date,
              check_out_date,
              status,
              total_price,
              property:properties(name)
            `)
            .in("property_id", propertyIds)
            .order("created_at", { ascending: false })
            .limit(5)

          if (bookings) {
            setRecentBookings(bookings)
          }
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [hostId])

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Host Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {hostData?.name || "Host"}</p>
        </div>
        <Button asChild>
          <Link href="/host/properties/new">
            <Home className="mr-2 h-4 w-4" />
            Add New Property
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : propertyCount}</div>
            <p className="text-xs text-muted-foreground">Properties listed on the platform</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : bookingCount}</div>
            <p className="text-xs text-muted-foreground">Bookings across all properties</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Host Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{hostData?.host_rating?.toFixed(1) || "N/A"}</div>
            <p className="text-xs text-muted-foreground">Average rating from guests</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Bookings</CardTitle>
          <CardDescription>Your most recent booking requests</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading bookings...</p>
          ) : recentBookings.length > 0 ? (
            <div className="space-y-4">
              {recentBookings.map((booking) => (
                <div key={booking.booking_id} className="flex items-center justify-between border-b pb-4">
                  <div>
                    <p className="font-medium">{booking.property?.name || "Property"}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(booking.check_in_date).toLocaleDateString()} -{" "}
                      {new Date(booking.check_out_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        booking.status === "confirmed"
                          ? "bg-green-100 text-green-800"
                          : booking.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : booking.status === "cancelled"
                              ? "bg-red-100 text-red-800"
                              : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </span>
                    <p className="font-medium">${booking.total_price}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No bookings found. List a property to get started.</p>
          )}
        </CardContent>
        <CardFooter>
          <Button asChild variant="outline" className="w-full">
            <Link href="/host/bookings">View All Bookings</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

