import { redirect } from "next/navigation"
import { requireAuth, createServerSupabaseClient } from "@/lib/auth"
import ReviewForm from "./review-form"

interface NewReviewPageProps {
  searchParams: {
    booking?: string
  }
}

async function getBookingDetails(bookingId: string, userId: string) {
  const supabase = await createServerSupabaseClient()

  const { data: booking } = await supabase
    .from("bookings")
    .select("*, properties(id, title, image_urls)")
    .eq("id", bookingId)
    .eq("user_id", userId)
    .eq("status", "completed")
    .single()

  if (!booking) {
    return null
  }

  // Check if a review already exists
  const { data: existingReview } = await supabase
    .from("reviews")
    .select("id")
    .eq("booking_id", bookingId)
    .eq("user_id", userId)
    .single()

  return {
    booking,
    hasReview: !!existingReview,
  }
}

export default async function NewReviewPage({ searchParams }: NewReviewPageProps) {
  const session = await requireAuth()

  if (!searchParams.booking) {
    redirect("/bookings")
  }

  const bookingDetails = await getBookingDetails(searchParams.booking, session.user.id)

  if (!bookingDetails) {
    redirect("/bookings")
  }

  if (bookingDetails.hasReview) {
    redirect(`/bookings/${searchParams.booking}?message=You have already reviewed this booking`)
  }

  const { booking } = bookingDetails
  const property = booking.properties as any

  return (
    <div className="container py-10">
      <h1 className="mb-8 text-3xl font-bold">Write a Review</h1>

      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h2 className="text-xl font-semibold">{property.title}</h2>
        </div>

        <ReviewForm bookingId={booking.id} propertyId={property.id} userId={session.user.id} />
      </div>
    </div>
  )
}

