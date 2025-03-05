"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useUser } from "@/lib/store"
import { supabase } from "@/lib/supabase"
import { useEffect, useState } from "react"
import { Building, CalendarDays, Star } from "lucide-react"
import Link from "next/link"

export default function GuestDashboard() {
  const { guestId } = useUser()
  const [bookingCount, setBookingCount] = useState(0)
  const [reviewCount, setReviewCount] = useState(0)
  const [featuredProperties, setFeaturedProperties] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true)

        // Get booking count for this guest
        if (guestId) {
          const { count: bookCount } = await supabase
            .from("bookings")
            .select("*", { count: "exact", head: true })
            .eq("guest_id", guestId)

          if (bookCount !== null) {
            setBookingCount(bookCount)
          }

          // Get review count for this guest
          const { count: revCount } = await supabase
            .from("reviews")
            .select("*", { count: "exact", head: true })
            .eq("guest_id", guestId)

          if (revCount !== null) {
            setReviewCount(revCount)
          }
        }

        // Get featured properties
        const { data: properties } = await supabase
          .from("properties")
          .select(`
            property_id,
            name,
            address,
            price_per_night,
            type,
            number_of_rooms,
            host:hosts(name, host_rating)
          `)
          .eq("availability_status", true)
          .order("created_at", { ascending: false })
          .limit(3)

        if (properties) {
          setFeaturedProperties(properties)
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [guestId])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Guest Dashboard</h1>
        <p className="text-muted-foreground">Find your perfect stay</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Bookings</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : bookingCount}</div>
            <p className="text-xs text-muted-foreground">Total bookings made</p>
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline" className="w-full">
              <Link href="/guest/bookings">View Bookings</Link>
            </Button>
          </CardFooter>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Reviews</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : reviewCount}</div>
            <p className="text-xs text-muted-foreground">Reviews you've left</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Find Properties</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Explore</div>
            <p className="text-xs text-muted-foreground">Discover new places to stay</p>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/guest/properties">Browse Properties</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-4">Featured Properties</h2>

        {loading ? (
          <p>Loading properties...</p>
        ) : featuredProperties.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featuredProperties.map((property) => (
              <Card key={property.property_id} className="overflow-hidden">
                <div className="aspect-video w-full bg-muted">
                  <div className="h-full w-full flex items-center justify-center bg-muted">
                    <Building className="h-10 w-10 text-muted-foreground/50" />
                  </div>
                </div>
                <CardHeader>
                  <CardTitle className="line-clamp-1">{property.name}</CardTitle>
                  <CardDescription className="line-clamp-1">{property.address}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">Price</p>
                      <p className="font-medium">${property.price_per_night}/night</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Rooms</p>
                      <p className="font-medium">{property.number_of_rooms}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Type</p>
                      <p className="font-medium">{property.type}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Host</p>
                      <p className="font-medium">{property.host?.name || "Unknown"}</p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full">
                    <Link href={`/guest/properties/${property.property_id}`}>View Details</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <p>No properties available at the moment.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

