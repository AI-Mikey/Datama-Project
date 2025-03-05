"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useUser } from "@/lib/store"
import { supabase } from "@/lib/supabase"
import { formatCurrency } from "@/lib/utils"
import { useEffect, useState } from "react"
import { Calendar, MapPin } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"

export default function PropertyPage({ params }: { params: { propertyId: string } }) {
  const { hostId } = useUser()
  const [property, setProperty] = useState<any>(null)
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isNewProperty, setIsNewProperty] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    type: "min 2 guests",
    description: "",
    number_of_rooms: 1,
    price_per_night: 100,
  })

  useEffect(() => {
    async function fetchPropertyDetails() {
      if (!hostId) return

      if (params.propertyId === "new") {
        setIsNewProperty(true)
        setLoading(false)
        return
      }

      try {
        setLoading(true)

        // Fetch property details
        const { data: propertyData, error: propertyError } = await supabase
          .from("properties")
          .select("*")
          .eq("property_id", params.propertyId)
          .eq("host_id", hostId)
          .single()

        if (propertyError) throw propertyError

        if (propertyData) {
          setProperty(propertyData)
          setFormData({
            name: propertyData.name,
            address: propertyData.address,
            type: propertyData.type,
            description: propertyData.description,
            number_of_rooms: propertyData.number_of_rooms,
            price_per_night: propertyData.price_per_night,
          })

          // Fetch bookings for this property
          const { data: bookingsData, error: bookingsError } = await supabase
            .from("bookings")
            .select("*")
            .eq("property_id", params.propertyId)
            .order("check_in_date", { ascending: false })
            .limit(5)

          if (bookingsError) throw bookingsError

          if (bookingsData) {
            setBookings(bookingsData)
          }
        } else {
          // Property not found or doesn't belong to this host
          router.push("/host/properties")
          toast({
            variant: "destructive",
            title: "Property not found",
            description: "The property you're looking for doesn't exist or doesn't belong to you.",
          })
        }
      } catch (error) {
        console.error("Error fetching property details:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load property details.",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchPropertyDetails()
  }, [hostId, params.propertyId, router, toast])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === "number_of_rooms" || name === "price_per_night" ? Number.parseFloat(value) : value,
    }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!hostId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "You must be logged in as a host to manage properties.",
      })
      return
    }

    try {
      setLoading(true)

      const propertyData = {
        host_id: hostId,
        name: formData.name,
        address: formData.address,
        type: formData.type,
        description: formData.description,
        number_of_rooms: formData.number_of_rooms,
        price_per_night: formData.price_per_night,
        availability_status: true,
      }

      let result
      if (isNewProperty) {
        result = await supabase.from("properties").insert([propertyData]).select()
      } else {
        result = await supabase.from("properties").update(propertyData).eq("property_id", params.propertyId).select()
      }

      const { data, error } = result

      if (error) throw error

      toast({
        title: isNewProperty ? "Property added" : "Property updated",
        description: isNewProperty
          ? "Your property has been successfully listed."
          : "Your property has been successfully updated.",
      })

      router.push("/host/properties")
    } catch (error) {
      console.error("Error managing property:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: isNewProperty
          ? "Failed to add property. Please try again."
          : "Failed to update property. Please try again.",
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-[50vh]">Loading property details...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{isNewProperty ? "Add New Property" : property?.name}</h1>
          {!isNewProperty && property?.address && (
            <p className="text-muted-foreground flex items-center">
              <MapPin className="h-4 w-4 mr-1" />
              {property.address}
            </p>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>{isNewProperty ? "Property Details" : "Edit Property"}</CardTitle>
            <CardDescription>
              {isNewProperty ? "Enter the details of your property listing" : "Update your property details"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Property Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Cozy Beach House"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="123 Main St, City, Country"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Property Type</Label>
              <Select value={formData.type} onValueChange={(value) => handleSelectChange("type", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="min 2 guests">Minimum 2 Guests</SelectItem>
                  <SelectItem value="min 4 guests">Minimum 4 Guests</SelectItem>
                  <SelectItem value="single">Single Room</SelectItem>
                  <SelectItem value="family">Family House</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe your property..."
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="number_of_rooms">Number of Rooms</Label>
                <Input
                  id="number_of_rooms"
                  name="number_of_rooms"
                  type="number"
                  min="1"
                  value={formData.number_of_rooms}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price_per_night">Price per Night ($)</Label>
                <Input
                  id="price_per_night"
                  name="price_per_night"
                  type="number"
                  min="1"
                  step="0.01"
                  value={formData.price_per_night}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => router.push("/host/properties")}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : isNewProperty ? "Add Property" : "Update Property"}
            </Button>
          </CardFooter>
        </Card>
      </form>

      {!isNewProperty && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Bookings</CardTitle>
            <CardDescription>Recent bookings for this property</CardDescription>
          </CardHeader>
          <CardContent>
            {bookings.length > 0 ? (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <div key={booking.booking_id} className="flex items-center justify-between border-b pb-4">
                    <div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        <p className="text-sm">
                          {new Date(booking.check_in_date).toLocaleDateString()} -{" "}
                          {new Date(booking.check_out_date).toLocaleDateString()}
                        </p>
                      </div>
                      <p className="text-sm text-muted-foreground">{formatCurrency(booking.total_price)}</p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        booking.status === "confirmed"
                          ? "bg-green-100 text-green-800"
                          : booking.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : booking.status === "cancelled"
                              ? "bg-red-100 text-red-800"
                              : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No bookings found for this property.</p>
            )}
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline" className="w-full">
              <Link href="/host/bookings">View All Bookings</Link>
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}

