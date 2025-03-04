"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { addDays, differenceInDays } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useSupabase } from "@/components/auth-provider"
import { formatPrice, calculateTotalPrice } from "@/lib/utils"
import type { Database } from "@/types/supabase"

type Property = Database["public"]["Tables"]["properties"]["Row"]

interface BookingFormProps {
  property: Property
}

export default function BookingForm({ property }: BookingFormProps) {
  const [checkIn, setCheckIn] = useState<Date | undefined>(new Date())
  const [checkOut, setCheckOut] = useState<Date | undefined>(addDays(new Date(), 5))
  const [guests, setGuests] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { supabase } = useSupabase()

  const handleBooking = async () => {
    if (!checkIn || !checkOut) {
      setError("Please select check-in and check-out dates")
      return
    }

    if (guests < 1 || guests > property.max_guests) {
      setError(`Guest count must be between 1 and ${property.max_guests}`)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/login")
        return
      }

      const totalPrice = calculateTotalPrice(property.price_per_night, checkIn, checkOut)

      const { data, error } = await supabase
        .from("bookings")
        .insert({
          property_id: property.id,
          user_id: user.id,
          check_in_date: checkIn.toISOString(),
          check_out_date: checkOut.toISOString(),
          total_price: totalPrice,
          guest_count: guests,
          status: "pending",
        })
        .select()
        .single()

      if (error) {
        throw error
      }

      router.push(`/bookings/${data.id}`)
    } catch (error: any) {
      setError(error.message || "Failed to create booking")
    } finally {
      setIsLoading(false)
    }
  }

  const nights = checkIn && checkOut ? differenceInDays(checkOut, checkIn) : 0
  const totalPrice = checkIn && checkOut ? calculateTotalPrice(property.price_per_night, checkIn, checkOut) : 0

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Dates</label>
        <div className="p-2 border rounded-md">
          <Calendar
            mode="range"
            selected={{
              from: checkIn,
              to: checkOut,
            }}
            onSelect={(range) => {
              setCheckIn(range?.from)
              setCheckOut(range?.to)
            }}
            disabled={{ before: new Date() }}
            numberOfMonths={1}
            className="border-blue-200"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="guests" className="text-sm font-medium">
          Guests
        </label>
        <Input
          id="guests"
          type="number"
          min={1}
          max={property.max_guests}
          value={guests}
          onChange={(e) => setGuests(Number.parseInt(e.target.value))}
          className="border-blue-200 focus-visible:ring-blue-500"
        />
        <p className="text-xs text-muted-foreground">This place has a maximum of {property.max_guests} guests</p>
      </div>

      {error && <div className="p-2 text-sm text-red-500 bg-red-50 rounded">{error}</div>}

      <Button
        className="w-full bg-blue-500 hover:bg-blue-600"
        onClick={handleBooking}
        disabled={isLoading || !checkIn || !checkOut || guests < 1}
      >
        {isLoading ? "Processing..." : "Reserve"}
      </Button>

      <div className="pt-4 space-y-2 border-t">
        <div className="flex justify-between">
          <span>
            {formatPrice(property.price_per_night)} x {nights} nights
          </span>
          <span>{formatPrice(property.price_per_night * nights)}</span>
        </div>
        <div className="flex justify-between">
          <span>Service fee</span>
          <span>{formatPrice(totalPrice * 0.1)}</span>
        </div>
        <div className="flex justify-between pt-2 font-bold border-t">
          <span>Total</span>
          <span className="text-blue-600">{formatPrice(totalPrice + totalPrice * 0.1)}</span>
        </div>
      </div>
    </div>
  )
}

