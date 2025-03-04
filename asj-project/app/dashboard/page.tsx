import Link from "next/link"
import { redirect } from "next/navigation"
import { requireAuth, createServerSupabaseClient, getUserProfile } from "@/lib/auth"
import { Button } from "@/components/ui/button"

export default async function DashboardPage() {
  const session = await requireAuth()
  const supabase = await createServerSupabaseClient()
  const profile = await getUserProfile(session.user.id)

  if (!profile) {
    redirect("/")
  }

  // Get booking statistics
  const { data: bookings } = await supabase.from("bookings").select("status").eq("user_id", session.user.id)

  const bookingStats = {
    total: bookings?.length || 0,
    upcoming: bookings?.filter((b) => b.status === "confirmed").length || 0,
    completed: bookings?.filter((b) => b.status === "completed").length || 0,
    cancelled: bookings?.filter((b) => b.status === "cancelled").length || 0,
  }

  // Get review statistics
  const { data: reviews } = await supabase.from("reviews").select("id").eq("user_id", session.user.id)

  return (
    <div className="container py-10">
      <h1 className="mb-8 text-3xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
        <div className="p-6 border rounded-lg bg-blue-50">
          <div className="text-sm text-blue-600">Total Bookings</div>
          <div className="text-3xl font-bold text-blue-700">{bookingStats.total}</div>
        </div>
        <div className="p-6 border rounded-lg bg-blue-50">
          <div className="text-sm text-blue-600">Upcoming Stays</div>
          <div className="text-3xl font-bold text-blue-700">{bookingStats.upcoming}</div>
        </div>
        <div className="p-6 border rounded-lg bg-yellow-50">
          <div className="text-sm text-yellow-600">Completed Stays</div>
          <div className="text-3xl font-bold text-yellow-700">{bookingStats.completed}</div>
        </div>
        <div className="p-6 border rounded-lg bg-yellow-50">
          <div className="text-sm text-yellow-600">Reviews Written</div>
          <div className="text-3xl font-bold text-yellow-700">{reviews?.length || 0}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div className="p-6 border rounded-lg">
          <h2 className="mb-4 text-xl font-semibold text-blue-700">Account Information</h2>

          <div className="space-y-4">
            <div>
              <div className="text-sm text-muted-foreground">Name</div>
              <div>{profile.full_name || "Not provided"}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Email</div>
              <div>{profile.email || session.user.email}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Phone</div>
              <div>{profile.phone || "Not provided"}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Account Type</div>
              <div>{profile.is_host ? "Host" : "Guest"}</div>
            </div>
          </div>

          <div className="mt-6">
            <Link href="/dashboard/profile">
              <Button variant="outline" className="border-blue-500 text-blue-500 hover:bg-blue-50">
                Edit Profile
              </Button>
            </Link>
          </div>
        </div>

        <div className="p-6 border rounded-lg">
          <h2 className="mb-4 text-xl font-semibold text-blue-700">Quick Actions</h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Link href="/search">
              <Button variant="outline" className="w-full justify-start border-blue-500 text-blue-500 hover:bg-blue-50">
                Find a Place
              </Button>
            </Link>
            <Link href="/bookings">
              <Button variant="outline" className="w-full justify-start border-blue-500 text-blue-500 hover:bg-blue-50">
                View Bookings
              </Button>
            </Link>
            <Link href="/dashboard/favorites">
              <Button
                variant="outline"
                className="w-full justify-start border-yellow-400 text-yellow-600 hover:bg-yellow-50"
              >
                Saved Places
              </Button>
            </Link>
            <Link href="/dashboard/settings">
              <Button
                variant="outline"
                className="w-full justify-start border-yellow-400 text-yellow-600 hover:bg-yellow-50"
              >
                Account Settings
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

