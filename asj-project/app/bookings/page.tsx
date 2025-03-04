import Link from "next/link"
import { redirect } from "next/navigation"
import { requireAuth, createServerSupabaseClient } from "@/lib/auth"
import { formatDate, formatPrice } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export default async function BookingsPage() {
  const session = await requireAuth()
  const supabase = await createServerSupabaseClient()

  const { data: bookings } = await supabase
    .from("bookings")
    .select("*, properties(title, location, image_urls)")
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false })

  if (!bookings) {
    redirect("/")
  }

  return (
    <div className="container py-10">
      <h1 className="mb-8 text-3xl font-bold">My Bookings</h1>

      {bookings.length === 0 ? (
        <div className="text-center py-12">
          <p className="mb-4 text-muted-foreground">You don't have any bookings yet.</p>
          <Link href="/">
            <Button className="bg-blue-500 hover:bg-blue-600">Find a place to stay</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {bookings.map((booking) => (
            <div key={booking.id} className="p-6 border rounded-lg shadow-sm">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
                <div className="md:col-span-3">
                  <h2 className="text-xl font-semibold">
                    <Link href={`/properties/${booking.property_id}`} className="hover:underline text-blue-500">
                      {(booking.properties as any).title}
                    </Link>
                  </h2>
                  <p className="text-muted-foreground">{(booking.properties as any).location}</p>

                  <div className="grid grid-cols-2 gap-4 mt-4 sm:grid-cols-3">
                    <div>
                      <div className="text-sm text-muted-foreground">Check-in</div>
                      <div>{formatDate(booking.check_in_date)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Check-out</div>
                      <div>{formatDate(booking.check_out_date)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Guests</div>
                      <div>{booking.guest_count}</div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="text-sm text-muted-foreground">Status</div>
                    <div
                      className={`inline-block px-2 py-1 mt-1 text-xs font-medium rounded-full ${
                        booking.status === "confirmed"
                          ? "bg-blue-100 text-blue-500"
                          : booking.status === "completed"
                            ? "bg-green-100 text-green-500"
                            : booking.status === "cancelled"
                              ? "bg-red-100 text-red-500"
                              : "bg-yellow-100 text-yellow-600"
                      }`}
                    >
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col justify-between md:items-end">
                  <div className="text-xl font-bold">{formatPrice(booking.total_price)}</div>

                  <div className="flex flex-col gap-2 mt-4">
                    <Link href={`/bookings/${booking.id}`}>
                      <Button variant="outline" className="w-full border-blue-500 text-blue-500 hover:bg-blue-50">
                        View Details
                      </Button>
                    </Link>

                    {booking.status === "completed" && (
                      <Link href={`/reviews/new?booking=${booking.id}`}>
                        <Button
                          variant="outline"
                          className="w-full border-yellow-400 text-yellow-600 hover:bg-yellow-50"
                        >
                          Leave a Review
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

