import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import { requireAuth, createServerSupabaseClient } from "@/lib/auth"
import { formatDate, formatPrice } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import CancelBookingButton from "./cancel-booking-button"

interface BookingPageProps {
  params: {
    id: string
  }
}

async function getBooking(id: string, userId: string) {
  const supabase = await createServerSupabaseClient()

  const { data: booking } = await supabase
    .from("bookings")
    .select("*, properties(*, profiles(full_name, avatar_url))")
    .eq("id", id)
    .eq("user_id", userId)
    .single()

  return booking
}

export default async function BookingPage({ params }: BookingPageProps) {
  const session = await requireAuth()
  const booking = await getBooking(params.id, session.user.id)

  if (!booking) {
    notFound()
  }

  const property = booking.properties as any

  return (
    <div className="container py-10">
      <div className="mb-6">
        <Link href="/bookings" className="text-primary hover:underline">
          ← Back to bookings
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h1 className="mb-2 text-3xl font-bold">Your booking at {property.title}</h1>
          <p className="mb-6 text-muted-foreground">{property.location}</p>

          <div className="overflow-hidden mb-6 rounded-lg aspect-video">
            <Image
              src={property.image_urls[0] || "/placeholder.svg?height=600&width=800"}
              alt={property.title}
              width={800}
              height={600}
              className="object-cover w-full h-full"
            />
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="p-4 border rounded-lg">
              <h2 className="mb-4 text-lg font-semibold">Booking Details</h2>

              <div className="space-y-3">
                <div className="grid grid-cols-2">
                  <div className="text-muted-foreground">Booking ID</div>
                  <div>{booking.id}</div>
                </div>
                <div className="grid grid-cols-2">
                  <div className="text-muted-foreground">Status</div>
                  <div className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary">
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </div>
                </div>
                <div className="grid grid-cols-2">
                  <div className="text-muted-foreground">Check-in</div>
                  <div>{formatDate(booking.check_in_date)}</div>
                </div>
                <div className="grid grid-cols-2">
                  <div className="text-muted-foreground">Check-out</div>
                  <div>{formatDate(booking.check_out_date)}</div>
                </div>
                <div className="grid grid-cols-2">
                  <div className="text-muted-foreground">Guests</div>
                  <div>{booking.guest_count}</div>
                </div>
                <div className="grid grid-cols-2">
                  <div className="text-muted-foreground">Total Price</div>
                  <div className="font-semibold">{formatPrice(booking.total_price)}</div>
                </div>
              </div>
            </div>

            <div className="p-4 border rounded-lg">
              <h2 className="mb-4 text-lg font-semibold">Host Information</h2>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 overflow-hidden rounded-full">
                  <Image
                    src={property.profiles?.avatar_url || "/placeholder.svg?height=48&width=48"}
                    alt={property.profiles?.full_name || "Host"}
                    width={48}
                    height={48}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div>
                  <div className="font-medium">{property.profiles?.full_name || "Host"}</div>
                  <div className="text-sm text-muted-foreground">Host</div>
                </div>
              </div>

              <p className="text-sm">
                If you need to contact your host regarding your stay, please use the messaging system.
              </p>
            </div>
          </div>

          {booking.status === "completed" && (
            <div className="mt-6">
              <Link href={`/reviews/new?booking=${booking.id}`}>
                <Button>Leave a Review</Button>
              </Link>
            </div>
          )}

          {booking.status === "pending" || booking.status === "confirmed" ? (
            <div className="mt-6">
              <CancelBookingButton bookingId={booking.id} />
            </div>
          ) : null}
        </div>

        <div>
          <div className="sticky p-6 border rounded-lg shadow-sm top-24">
            <h2 className="mb-4 text-lg font-semibold">Property Details</h2>

            <div className="space-y-4">
              <div>
                <div className="text-sm text-muted-foreground">Location</div>
                <div>{property.location}</div>
              </div>

              <div>
                <div className="text-sm text-muted-foreground">Address</div>
                <div>{property.address}</div>
              </div>

              <div>
                <div className="text-sm text-muted-foreground">Bedrooms</div>
                <div>{property.bedrooms}</div>
              </div>

              <div>
                <div className="text-sm text-muted-foreground">Bathrooms</div>
                <div>{property.bathrooms}</div>
              </div>

              <div>
                <div className="text-sm text-muted-foreground">Max Guests</div>
                <div>{property.max_guests}</div>
              </div>

              <div>
                <div className="text-sm text-muted-foreground">Price per night</div>
                <div>{formatPrice(property.price_per_night)}</div>
              </div>
            </div>

            <div className="mt-6">
              <Link href={`/properties/${property.id}`}>
                <Button variant="outline" className="w-full">
                  View Property
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

