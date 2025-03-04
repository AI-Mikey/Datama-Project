import Image from "next/image"
import { notFound } from "next/navigation"
import { Star, Bed, Bath, Users } from "lucide-react"
import { createServerSupabaseClient } from "@/lib/auth"
import { formatPrice } from "@/lib/utils"
import BookingForm from "./booking-form"
import ReviewList from "./review-list"

interface PropertyPageProps {
  params: {
    id: string
  }
}

async function getProperty(id: string) {
  const supabase = await createServerSupabaseClient()

  const { data: property } = await supabase
    .from("properties")
    .select("*, profiles(full_name, avatar_url)")
    .eq("id", id)
    .single()

  if (!property) {
    return null
  }

  // Get reviews for this property
  const { data: reviews } = await supabase
    .from("reviews")
    .select("*, profiles(full_name, avatar_url)")
    .eq("property_id", id)
    .order("created_at", { ascending: false })

  // Calculate average rating
  let averageRating = 0
  if (reviews && reviews.length > 0) {
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0)
    averageRating = sum / reviews.length
  }

  return { property, reviews, averageRating }
}

export default async function PropertyPage({ params }: PropertyPageProps) {
  const { property, reviews, averageRating } = (await getProperty(params.id)) || {}

  if (!property) {
    notFound()
  }

  return (
    <div className="container py-10">
      <h1 className="mb-2 text-3xl font-bold">{property.title}</h1>

      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center">
          <Star className="w-4 h-4 mr-1 fill-current" />
          <span>{averageRating.toFixed(1)}</span>
          <span className="mx-1">·</span>
          <span>{reviews?.length || 0} reviews</span>
        </div>
        <div>{property.location}</div>
      </div>

      <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2">
        <div className="overflow-hidden rounded-lg aspect-video">
          <Image
            src={property.image_urls[0] || "/placeholder.svg?height=600&width=800"}
            alt={property.title}
            width={800}
            height={600}
            className="object-cover w-full h-full"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          {property.image_urls.slice(1, 5).map((image, index) => (
            <div key={index} className="overflow-hidden rounded-lg aspect-square">
              <Image
                src={image || `/placeholder.svg?height=300&width=300&text=Image ${index + 2}`}
                alt={`${property.title} - Image ${index + 2}`}
                width={300}
                height={300}
                className="object-cover w-full h-full"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold">Hosted by {(property.profiles as any)?.full_name || "Host"}</h2>

            <div className="flex gap-4 mb-4">
              <div className="flex items-center">
                <Bed className="w-5 h-5 mr-2" />
                <span>
                  {property.bedrooms} {property.bedrooms === 1 ? "bedroom" : "bedrooms"}
                </span>
              </div>
              <div className="flex items-center">
                <Bath className="w-5 h-5 mr-2" />
                <span>
                  {property.bathrooms} {property.bathrooms === 1 ? "bathroom" : "bathrooms"}
                </span>
              </div>
              <div className="flex items-center">
                <Users className="w-5 h-5 mr-2" />
                <span>Up to {property.max_guests} guests</span>
              </div>
            </div>

            <div className="prose max-w-none">
              <p>{property.description}</p>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold">Amenities</h2>
            <ul className="grid grid-cols-2 gap-2">
              {property.amenities.map((amenity, index) => (
                <li key={index} className="flex items-center">
                  <span className="mr-2">✓</span>
                  {amenity}
                </li>
              ))}
            </ul>
          </div>

          <ReviewList reviews={reviews || []} averageRating={averageRating} />
        </div>

        <div>
          <div className="sticky p-6 border rounded-lg shadow-sm top-24">
            <div className="mb-4">
              <span className="text-2xl font-bold">{formatPrice(property.price_per_night)}</span>
              <span className="text-muted-foreground"> / night</span>
            </div>

            <BookingForm property={property} />
          </div>
        </div>
      </div>
    </div>
  )
}

