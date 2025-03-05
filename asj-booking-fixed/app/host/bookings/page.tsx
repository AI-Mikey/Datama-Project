"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useUser } from "@/lib/store"
import { supabase } from "@/lib/supabase"
import { formatCurrency } from "@/lib/utils"
import { useEffect, useState } from "react"
import { useToast } from "@/components/ui/use-toast"

type BookingWithProperty = {
  booking_id: string
  property_id: string
  guest_id: string
  check_in_date: string
  check_out_date: string
  total_price: number
  status: string
  created_at: string
  property: {
    name: string
  }
}

export default function HostBookings() {
  const { hostId } = useUser()
  const [bookings, setBookings] = useState<BookingWithProperty[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    async function fetchBookings() {
      if (!hostId) return

      try {
        setLoading(true)
        const { data, error } = await supabase
          .from("bookings")
          .select("*, property:properties(name)")
          .eq("host_id", hostId)

        if (error) throw error
        setBookings(data || [])
      } catch (err) {
        console.error("Error fetching bookings:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchBookings()
  }, [hostId])

  async function updateBookingStatus(bookingId: string, status: string) {
    try {
      const { error } = await supabase
        .from("bookings")
        .update({ status })
        .eq("booking_id", bookingId)

      if (error) {
        toast({ title: "Error updating booking status", description: error.message })
      } else {
        toast({ title: `Booking ${status}` })
        setBookings((prev) =>
          prev.map((booking) =>
            booking.booking_id === bookingId ? { ...booking, status } : booking
          )
        )
      }
    } catch (err) {
      console.error("Error updating booking status:", err)
    }
  }

  return (
    <div>
      <h1>Host Bookings</h1>
      {loading ? (
        <p>Loading...</p>
      ) : (
        bookings.map((booking) => (
          <Card key={booking.booking_id}>
            <CardHeader>
              <CardTitle>{booking.property.name}</CardTitle>
              <CardDescription>{booking.status}</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Check-in: {booking.check_in_date}</p>
              <p>Check-out: {booking.check_out_date}</p>
              <p>Total: {formatCurrency(booking.total_price)}</p>
              <Button onClick={() => updateBookingStatus(booking.booking_id, "confirmed")}>Confirm</Button>
              <Button onClick={() => updateBookingStatus(booking.booking_id, "declined")}>Decline</Button>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )
}
