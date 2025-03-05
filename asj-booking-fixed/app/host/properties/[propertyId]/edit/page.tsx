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
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"

export default function EditPropertyPage({ params }: { params: { propertyId: string } }) {
  const { hostId } = useUser()
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
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchPropertyDetails() {
      if (!hostId) return

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
          setFormData({
            name: propertyData.name,
            address: propertyData.address,
            type: propertyData.type,
            description: propertyData.description || "",
            number_of_rooms: propertyData.number_of_rooms,
            price_per_night: propertyData.price_per_night,
          })
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
        description: "You must be logged in as a host to update a property.",
      })
      return
    }

    try {
      setLoading(true)

      const { error } = await supabase
        .from("properties")
        .update({
          name: formData.name,
          address: formData.address,
          type: formData.type,
          description: formData.description,
          number_of_rooms: formData.number_of_rooms,
          price_per_night: formData.price_per_night,
        })
        .eq("property_id", params.propertyId)
        .eq("host_id", hostId)

      if (error) throw error

      toast({
        title: "Property updated",
        description: "Your property has been successfully updated.",
      })

      router.push("/host/properties")
    } catch (error) {
      console.error("Error updating property:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update property. Please try again.",
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-[50vh]">Loading property details...</div>
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold tracking-tight mb-6">Edit Property</h1>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Property Details</CardTitle>
            <CardDescription>Update your property information</CardDescription>
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
              {loading ? "Saving..." : "Update Property"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}

