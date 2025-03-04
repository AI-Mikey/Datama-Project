import { Star } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatDate } from "@/lib/utils"
import type { Database } from "@/types/supabase"

type Review = Database["public"]["Tables"]["reviews"]["Row"] & {
  profiles: {
    full_name: string | null
    avatar_url: string | null
  } | null
}

interface ReviewListProps {
  reviews: Review[]
  averageRating: number
}

export default function ReviewList({ reviews, averageRating }: ReviewListProps) {
  if (reviews.length === 0) {
    return (
      <div className="mb-8">
        <h2 className="mb-4 text-2xl font-semibold">Reviews</h2>
        <p className="text-muted-foreground">No reviews yet.</p>
      </div>
    )
  }

  return (
    <div className="mb-8">
      <h2 className="mb-4 text-2xl font-semibold">Reviews</h2>

      <div className="flex items-center gap-2 mb-6">
        <div className="flex">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`w-5 h-5 ${star <= Math.round(averageRating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
            />
          ))}
        </div>
        <span className="text-lg font-medium">{averageRating.toFixed(1)}</span>
        <span className="text-muted-foreground">· {reviews.length} reviews</span>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {reviews.map((review) => (
          <div key={review.id} className="p-4 border rounded-lg">
            <div className="flex items-center gap-3 mb-3">
              <Avatar>
                <AvatarImage src={review.profiles?.avatar_url || undefined} />
                <AvatarFallback className="bg-blue-500 text-white">
                  {review.profiles?.full_name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium">{review.profiles?.full_name || "Anonymous"}</div>
                <div className="text-sm text-muted-foreground">{formatDate(review.created_at)}</div>
              </div>
            </div>

            <div className="flex mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-4 h-4 ${star <= review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                />
              ))}
            </div>

            <p className="text-sm">{review.comment}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

