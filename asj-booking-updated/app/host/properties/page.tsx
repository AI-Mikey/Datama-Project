"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useUser } from "@/lib/store"
import { type Property, supabase } from "@/lib/supabase"
import { useEffect, useState } from "react"
import { Building, Plus, Pencil } from "lucide-react"
import Link from "next/link"
import { formatCurrency } from "@/lib/utils"

export default function HostProperties() {
  const { hostId } = useUser()
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProperties() {
      if (!hostId) return

      try {
        setLoading(true)

        const { data, error } = await supabase
          .from("properties")
          .select("*")
          .eq("host_id", hostId)
          .order("created_at", { ascending: false })

        if (error) throw error

        if (data) {
          setProperties(data)
        }
      } catch (error) {
        console.error("Error fetching properties:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProperties()
  }, [hostId])

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Properties</h1>
          <p className="text-muted-foreground">Manage your listed properties</p>
        </div>
        <Button asChild>
          <Link href="/host/properties/new">
            <Plus className="mr-2 h-4 w-4" />
            Add New Property
          </Link>
        </Button>
      </div>

      {loading ? (
        <p>Loading properties...</p>
      ) : properties.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {properties.map((property) => (
            <Card key={property.property_id} className="overflow-hidden">
              <div className="aspect-video w-full bg-muted">
                <div className="h-full w-full flex items-center justify-center bg-muted">
                  <Building className="h-10 w-10 text-muted-foreground/50" />
                </div>
              </div>
              <CardHeader>
                <CardTitle className="line-clamp-1">{property.name}</CardTitle>
                <CardDescription className="line-clamp-1">{property.address}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">Price</p>
                    <p className="font-medium">{formatCurrency(property.price_per_night)}/night</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Rooms</p>
                    <p className="font-medium">{property.number_of_rooms}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Type</p>
                    <p className="font-medium">{property.type}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Status</p>
                    <p className="font-medium">{property.availability_status ? "Available" : "Unavailable"}</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button asChild variant="outline">
                  <Link href={`/host/properties/${property.property_id}`}>View Details</Link>
                </Button>
                <Button asChild variant="secondary">
                  <Link href={`/host/properties/${property.property_id}/edit`}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>No properties found</CardTitle>
            <CardDescription>You haven't listed any properties yet.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Get started by adding your first property listing.</p>
          </CardContent>
          <CardFooter>
            <Button asChild>
              <Link href="/host/properties/new">
                <Plus className="mr-2 h-4 w-4" />
                Add New Property
              </Link>
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}

