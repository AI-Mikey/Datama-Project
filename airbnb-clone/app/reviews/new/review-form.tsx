"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useSupabase } from "@/components/auth-provider"

interface ReviewFormProps {
  bookingId: string
  propertyId: string
  userId: string
}

export default function ReviewForm({ bookingId, propertyId, userId }: ReviewFormProps) {
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { supabase } = useSupabase()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (rating === 0) {
      setError("Please select a rating")
      return
    }

    if (comment.trim().length < 10) {
      setError("Please write a comment (minimum 10 characters)")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.from("reviews").insert({
        booking_id: bookingId,
        property_id: propertyId,
        user_id: userId,
        rating,
        comment,
      })

      if (error) {
        throw error
      }

      router.push(`/bookings/${bookingId}?message=Review submitted successfully`)
    } catch (error: any) {
      setError(error.message || "Failed to submit review")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-medium">Rating</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="p-1 transition-colors"
            >
              <Star
                className={`w-8 h-8 ${
                  (hoverRating ? star <= hoverRating : star <= rating)
                    ? "text-yellow-400 fill-yellow-400"
                    : "text-gray-300"
                }`}
              />
            </button>
          ))}
        </div>
        <div className="text-sm">
          {rating === 1 && "Terrible"}
          {rating === 2 && "Poor"}
          {rating === 3 && "Average"}
          {rating === 4 && "Good"}
          {rating === 5 && "Excellent"}
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="comment" className="text-sm font-medium">
          Your Review
        </label>
        <Textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your experience..."
          rows={6}
        />
      </div>

      {error && <div className="p-2 text-sm text-red-500 bg-red-50 rounded">{error}</div>}

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading} className="bg-blue-500 hover:bg-blue-600">
          {isLoading ? "Submitting..." : "Submit Review"}
        </Button>
      </div>
    </form>
  )
}

