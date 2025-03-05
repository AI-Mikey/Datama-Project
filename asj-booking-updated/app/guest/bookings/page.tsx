"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useUser } from "@/lib/store"
import { supabase } from "@/lib/supabase"
import { formatCurrency } from "@/lib/utils"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Calendar, CreditCard } from "lucide-react"

type BookingWithProperty = {
  booking_id: string
  property_id: string
  check_in_date: string
  check_out_date: string
  total_price: number
  status: string
  created_at: string
  payment_id: string | null
  property: {
    name: string
    address: string
  }
  payment?: {
    payment_type: string
    status: string
  }
}

export default function GuestBookings() {
  const { guestId } = useUser()
  const [bookings, setBookings] = useState<BookingWithProperty[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchBookings() {
      if (!guestId) return

      try {
        setLoading(true)

        const { data, error } = await supabase
          .from("bookings")
          .select(`
            booking_id,
            property_id,
            check_in_date,
            check_out_date,
            total_price,
            status,
            created_at,
            payment_id,
            property:properties(name, address),
            payment:payments(payment_type, status)
          `)
          .eq("guest_id", guestId)
          .order("created_at", { ascending: false })

        if (error) throw error

        if (data) {
          setBookings(data as BookingWithProperty[])
        }
      } catch (error) {
        console.error("Error fetching bookings:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchBookings()
  }, [guestId])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Bookings</h1>
        <p className="text-muted-foreground">View and manage your bookings</p>
      </div>

      {loading ? (
        <p>Loading bookings...</p>
      ) : bookings.length > 0 ? (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <Card key={booking.booking_id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{booking.property.name}</CardTitle>
                    <CardDescription>{booking.property.address}</CardDescription>
                  </div>
                  <div className="text-right">
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
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>
                        {new Date(booking.check_in_date).toLocaleDateString()} -{" "}
                        {new Date(booking.check_out_date).toLocaleDateString()}
                      </span>
                    </div>
                    {booking.payment && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <CreditCard className="h-4 w-4 mr-2" />
                        <span>
                          Paid with {booking.payment.payment_type === "credit_card" ? "Credit Card" : "Digital Wallet"}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="font-medium">{formatCurrency(booking.total_price)}</p>
                    <Button asChild size="sm">
                      <Link href={`/guest/properties/${booking.property_id}`}>View Property</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>No bookings found</CardTitle>
            <CardDescription>You haven't made any bookings yet.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Browse properties and make your first booking.</p>
            <Button asChild className="mt-4">
              <Link href="/guest/properties">Browse Properties</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

