"use client"

import type React from "react"

import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface SearchFiltersProps {
  initialValues: {
    location?: string
    guests?: string
    minPrice?: string
    maxPrice?: string
  }
}

export default function SearchFilters({ initialValues }: SearchFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [location, setLocation] = useState(initialValues.location || "")
  const [guests, setGuests] = useState(initialValues.guests || "")
  const [minPrice, setMinPrice] = useState(initialValues.minPrice || "")
  const [maxPrice, setMaxPrice] = useState(initialValues.maxPrice || "")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const params = new URLSearchParams()

    if (location) params.set("location", location)
    if (guests) params.set("guests", guests)
    if (minPrice) params.set("minPrice", minPrice)
    if (maxPrice) params.set("maxPrice", maxPrice)

    router.push(`${pathname}?${params.toString()}`)
  }

  const handleReset = () => {
    setLocation("")
    setGuests("")
    setMinPrice("")
    setMaxPrice("")
    router.push(pathname)
  }

  return (
    <div className="p-4 border rounded-lg sticky top-24">
      <h2 className="mb-4 text-lg font-semibold">Filters</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="location" className="text-sm font-medium">
            Location
          </label>
          <Input
            id="location"
            placeholder="Any location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="guests" className="text-sm font-medium">
            Guests
          </label>
          <Input
            id="guests"
            type="number"
            min="1"
            placeholder="Number of guests"
            value={guests}
            onChange={(e) => setGuests(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="price-range" className="text-sm font-medium">
            Price Range
          </label>
          <div className="flex items-center gap-2">
            <Input
              id="min-price"
              type="number"
              min="0"
              placeholder="Min"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
            />
            <span>-</span>
            <Input
              id="max-price"
              type="number"
              min="0"
              placeholder="Max"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Button type="submit">Apply Filters</Button>
          <Button type="button" variant="outline" onClick={handleReset}>
            Reset Filters
          </Button>
        </div>
      </form>
    </div>
  )
}

