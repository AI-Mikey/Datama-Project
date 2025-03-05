"use client"

import { useState } from "react"
import { Star } from "lucide-react"
import { cn } from "@/lib/utils"
import { supabase } from "@/lib/supabase"

interface RatingProps {
  value: number
  onChange?: (value: number) => void
  readOnly?: boolean
  max?: number
  className?: string
  hostId: string
}

export function Rating({ value = 0, onChange, readOnly = false, max = 5, className, hostId }: RatingProps) {
  const [hoverValue, setHoverValue] = useState<number | null>(null)

  const handleMouseMove = (index: number) => {
    if (readOnly) return
    setHoverValue(index)
  }

  const handleMouseLeave = () => {
    if (readOnly) return
    setHoverValue(null)
  }

  async function saveRating(hostId: string, rating: number) {
    const { error } = await supabase
      .from("hosts")
      .update({ host_rating: rating })
      .eq("host_id", hostId)

    if (error) {
      console.error("Error saving rating:", error)
    }
  }

  const handleClick = async (index: number) => {
    if (readOnly) return
    onChange?.(index)
    await saveRating(hostId, index)
  }

  return (
    <div className={cn("flex", className)}>
      {Array.from({ length: max }).map((_, index) => {
        const starValue = index + 1
        const isFilled = hoverValue !== null ? starValue <= hoverValue : starValue <= value

        return (
          <Star
            key={index}
            onClick={() => handleClick(starValue)}
            onMouseMove={() => handleMouseMove(starValue)}
            onMouseLeave={handleMouseLeave}
            className={cn("cursor-pointer", isFilled ? "text-yellow-500" : "text-gray-300")}
          />
        )
      })}
    </div>
  )
}
