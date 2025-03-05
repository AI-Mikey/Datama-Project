"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { type Property, supabase } from "@/lib/supabase"
import { formatCurrency } from "@/lib/utils"
import { useEffect, useState } from "react"
import { Building, Search } from "lucide-react"
import Link from "next/link"

export default function GuestProperties() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [priceFilter, setPriceFilter] = useState<string>("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")

  useEffect(() => {
    async function fetchProperties() {
      try {
        setLoading(true)

        const { data, error } = await supabase
          .from("properties")
          .select(`
            *,
            host:hosts(name, host_rating)
          `)
          .eq("availability_status", true)
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
  }, [])

  const filteredProperties = properties.filter((property) => {
    // Search filter
    const matchesSearch =
      property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.description?.toLowerCase().includes(searchTerm.toLowerCase())

    // Price filter
    let matchesPrice = true
    if (priceFilter === "under100") {
      matchesPrice = property.price_per_night < 100
    } else if (priceFilter === "100to200") {
      matchesPrice = property.price_per_night >= 100 && property.price_per_night <= 200
    } else if (priceFilter === "over200") {
      matchesPrice = property.price_per_night > 200
    }

    // Type filter
    let matchesType = true
    if (typeFilter !== "all") {
      matchesType = property.type === typeFilter
    }

    return matchesSearch && matchesPrice && matchesType
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Find Properties</h1>
        <p className="text-muted-foreground">Browse available properties for your next stay</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="col-span-3 md:col-span-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by name, address, or description..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="col-span-3 md:col-span-1 grid grid-cols-2 gap-4">
          <Select value={priceFilter} onValueChange={setPriceFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Price Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Prices</SelectItem>
              <SelectItem value="under100">Under $100</SelectItem>
              <SelectItem value="100to200">$100 - $200</SelectItem>
              <SelectItem value="over200">Over $200</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Property Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="min 2 guests">Min 2 Guests</SelectItem>
              <SelectItem value="min 4 guests">Min 4 Guests</SelectItem>
              <SelectItem value="single">Single Room</SelectItem>
              <SelectItem value="family">Family House</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <p>Loading properties...</p>
      ) : filteredProperties.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredProperties.map((property) => (
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
                    <p className="text-muted-foreground">Host</p>
                    <p className="font-medium">{property.host?.name || "Unknown"}</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full">
                  <Link href={`/guest/properties/${property.property_id}`}>View Details</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <p>No properties found matching your criteria.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

