import { redirect } from "next/navigation"
import { requireAuth, getUserProfile } from "@/lib/auth"
import ProfileForm from "./profile-form"

export default async function ProfilePage() {
  const session = await requireAuth()
  const profile = await getUserProfile(session.user.id)

  if (!profile) {
    redirect("/")
  }

  return (
    <div className="container py-10">
      <h1 className="mb-8 text-3xl font-bold">Edit Profile</h1>

      <div className="max-w-2xl mx-auto">
        <ProfileForm profile={profile} />
      </div>
    </div>
  )
}

