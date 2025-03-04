import { createServerSupabaseClient } from "@/lib/auth"
import PropertyCard from "@/components/property-card"
import SearchFilters from "./search-filters"

interface SearchPageProps {
  searchParams: {
    location?: string
    guests?: string
    minPrice?: string
    maxPrice?: string
  }
}

async function searchProperties(params: SearchPageProps["searchParams"]) {
  const supabase = await createServerSupabaseClient()

  let query = supabase.from("properties").select("*").order("created_at", { ascending: false })

  if (params.location) {
    query = query.ilike("location", `%${params.location}%`)
  }

  if (params.guests) {
    const guests = Number.parseInt(params.guests)
    if (!isNaN(guests)) {
      query = query.gte("max_guests", guests)
    }
  }

  if (params.minPrice) {
    const minPrice = Number.parseFloat(params.minPrice)
    if (!isNaN(minPrice)) {
      query = query.gte("price_per_night", minPrice)
    }
  }

  if (params.maxPrice) {
    const maxPrice = Number.parseFloat(params.maxPrice)
    if (!isNaN(maxPrice)) {
      query = query.lte("price_per_night", maxPrice)
    }
  }

  const { data: properties } = await query

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

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { properties, averageRatings } = await searchProperties(searchParams)

  return (
    <div className="container py-10">
      <h1 className="mb-8 text-3xl font-bold">Find your perfect stay</h1>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
        <div>
          <SearchFilters initialValues={searchParams} />
        </div>

        <div className="lg:col-span-3">
          {properties && properties.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {properties.map((property) => (
                <PropertyCard key={property.id} property={property} averageRating={averageRatings[property.id]} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No properties found matching your criteria.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

