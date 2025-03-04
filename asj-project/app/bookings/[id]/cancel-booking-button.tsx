"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useSupabase } from "@/components/auth-provider"

interface CancelBookingButtonProps {
  bookingId: string
}

export default function CancelBookingButton({ bookingId }: CancelBookingButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { supabase } = useSupabase()

  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel this booking?")) {
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.from("bookings").update({ status: "cancelled" }).eq("id", bookingId)

      if (error) {
        throw error
      }

      router.refresh()
    } catch (error: any) {
      setError(error.message || "Failed to cancel booking")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <Button variant="destructive" onClick={handleCancel} disabled={isLoading}>
        {isLoading ? "Cancelling..." : "Cancel Booking"}
      </Button>

      {error && <div className="mt-2 text-sm text-red-500">{error}</div>}
    </div>
  )
}

