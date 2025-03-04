import Link from "next/link"
import Image from "next/image"
import { Star } from "lucide-react"
import { formatPrice } from "@/lib/utils"
import type { Database } from "@/types/supabase"

type Property = Database["public"]["Tables"]["properties"]["Row"]

interface PropertyCardProps {
  property: Property
  averageRating?: number
}

export default function PropertyCard({ property, averageRating }: PropertyCardProps) {
  return (
    <Link href={`/properties/${property.id}`} className="group">
      <div className="overflow-hidden rounded-lg aspect-square">
        <Image
          src={property.image_urls[0] || "/placeholder.svg?height=300&width=300"}
          alt={property.title}
          width={300}
          height={300}
          className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <div className="mt-2">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">{property.location}</h3>
          {averageRating !== undefined && (
            <div className="flex items-center">
              <Star className="w-4 h-4 mr-1 text-yellow-400 fill-yellow-400" />
              <span>{averageRating.toFixed(1)}</span>
            </div>
          )}
        </div>
        <p className="text-sm text-muted-foreground">{property.title}</p>
        <p className="mt-1 font-medium">
          {formatPrice(property.price_per_night)} <span className="font-normal">night</span>
        </p>
      </div>
    </Link>
  )
}

