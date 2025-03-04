import { createServerSupabaseClient } from "@/lib/auth"
import PropertyCard from "@/components/property-card"

async function getProperties() {
  const supabase = await createServerSupabaseClient()

  const { data: properties } = await supabase
    .from("properties")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(8)

  // Get average ratings for each property
  const propertyIds = properties?.map((property) => property.id) || []

  const { data: ratings } = await supabase.from("reviews").select("property_id, rating").in("property_id", propertyIds)

  // Calculate average rating for each property
  const averageRatings: Record<string, number> = {}

  if (ratings) {
    const ratingsByProperty: Record<string, number[]> = {}

    ratings.forEach((review) => {
      if (!ratingsByProperty[review.property_id]) {
        ratingsByProperty[review.property_id] = []
      }
      ratingsByProperty[review.property_id].push(review.rating)
    })

    Object.entries(ratingsByProperty).forEach(([propertyId, ratings]) => {
      const sum = ratings.reduce((acc, rating) => acc + rating, 0)
      averageRatings[propertyId] = sum / ratings.length
    })
  }

  return { properties, averageRatings }
}

export default async function Home() {
  const { properties, averageRatings } = await getProperties()

  return (
    <div className="container py-10">
      <h1 className="mb-8 text-3xl font-bold">Featured Places to Stay</h1>

      {properties && properties.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} averageRating={averageRatings[property.id]} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No properties found.</p>
        </div>
      )}
    </div>
  )
}

