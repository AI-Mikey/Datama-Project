"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { DatePicker } from "@/components/ui/date-picker"
import { Rating } from "@/components/ui/rating"
import { Textarea } from "@/components/ui/textarea"
import { useUser } from "@/lib/store"
import { type Property, type Review, supabase } from "@/lib/supabase"
import { calculateNights, formatCurrency } from "@/lib/utils"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import { Building, MapPin, Star, User } from "lucide-react"
import { PaymentForm, type PaymentData } from "@/components/payment-form"

export default function PropertyDetails() {
  const params = useParams()
  const propertyId = params.id as string
  const router = useRouter()
  const { guestId } = useUser()
  const { toast } = useToast()

  const [property, setProperty] = useState<Property | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [checkInDate, setCheckInDate] = useState<Date | undefined>(undefined)
  const [checkOutDate, setCheckOutDate] = useState<Date | undefined>(undefined)
  const [bookingLoading, setBookingLoading] = useState(false)
  const [reviewText, setReviewText] = useState("")
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewLoading, setReviewLoading] = useState(false)
  const [userHasBooked, setUserHasBooked] = useState(false)
  const [userHasReviewed, setUserHasReviewed] = useState(false)
  const [showPaymentForm, setShowPaymentForm] = useState(false)

  useEffect(() => {
    async function fetchPropertyData() {
      try {
        setLoading(true)

        // Fetch property details
        const { data: propertyData, error: propertyError } = await supabase
          .from("properties")
          .select(`
            *,
            host:hosts(name, host_rating)
          `)
          .eq("property_id", propertyId)
          .single()

        if (propertyError) throw propertyError

        if (propertyData) {
          setProperty(propertyData)
        }

        // Fetch reviews for this property
        const { data: reviewsData, error: reviewsError } = await supabase
          .from("reviews")
          .select("*")
          .eq("property_id", propertyId)
          .order("date", { ascending: false })

        if (reviewsError) throw reviewsError

        if (reviewsData) {
          setReviews(reviewsData)
        }

        // Check if user has booked this property
        if (guestId) {
          const { count, error: bookingError } = await supabase
            .from("bookings")
            .select("*", { count: "exact", head: true })
            .eq("property_id", propertyId)
            .eq("guest_id", guestId)

          if (!bookingError && count !== null && count > 0) {
            setUserHasBooked(true)
          }

          // Check if user has reviewed this property
          const { count: reviewCount, error: reviewCheckError } = await supabase
            .from("reviews")
            .select("*", { count: "exact", head: true })
            .eq("property_id", propertyId)
            .eq("guest_id", guestId)

          if (!reviewCheckError && reviewCount !== null && reviewCount > 0) {
            setUserHasReviewed(true)
          }
        }
      } catch (error) {
        console.error("Error fetching property data:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load property details",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchPropertyData()
  }, [propertyId, guestId, toast])

  const handleBookingStart = () => {
    if (!guestId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "You must be logged in as a guest to book",
      })
      return
    }

    if (!checkInDate || !checkOutDate) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select check-in and check-out dates",
      })
      return
    }

    if (checkInDate >= checkOutDate) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Check-out date must be after check-in date",
      })
      return
    }

    setShowPaymentForm(true)
  }

  const handlePaymentSubmit = async (formPaymentData: PaymentData) => {
    if (!property || !guestId || !checkInDate || !checkOutDate) return

    try {
      setBookingLoading(true)

      const nights = calculateNights(checkInDate, checkOutDate)
      const totalPrice = property.price_per_night * nights

      // 1. Create payment record
      const { data: paymentData, error: paymentError } = await supabase
        .from("payments")
        .insert([
          {
            amount: totalPrice,
            currency: "USD",
            status: "completed", // In a real app, this would be 'pending' until payment is processed
            payment_type: formPaymentData.paymentType,
          },
        ])
        .select()

      if (paymentError) throw paymentError

      if (!paymentData || paymentData.length === 0) {
        throw new Error("Failed to create payment record")
      }

      const paymentId = paymentData[0].payment_id

      // 2. Store payment details based on payment type
      if (formPaymentData.paymentType === "credit_card" && formPaymentData.cardData) {
        const { error: cardError } = await supabase.from("credit_card_payments").insert([
          {
            payment_id: paymentId,
            card_number: formPaymentData.cardData.cardNumber,
            cardholder_name: formPaymentData.cardData.cardholderName,
            expiry_month: formPaymentData.cardData.expiryMonth,
            expiry_year: formPaymentData.cardData.expiryYear,
            last_four: formPaymentData.cardData.cardNumber.slice(-4),
          },
        ])

        if (cardError) throw cardError
      } else if (formPaymentData.paymentType === "digital_wallet" && formPaymentData.walletData) {
        const { error: walletError } = await supabase.from("digital_wallet_payments").insert([
          {
            payment_id: paymentId,
            wallet_id: formPaymentData.walletData.walletId,
            provider: formPaymentData.walletData.provider,
          },
        ])

        if (walletError) throw walletError
      }

      // 3. Create booking with payment reference
      const { data: bookingData, error: bookingError } = await supabase
        .from("bookings")
        .insert([
          {
            property_id: propertyId,
            guest_id: guestId,
            payment_id: paymentId,
            check_in_date: checkInDate.toISOString().split("T")[0],
            check_out_date: checkOutDate.toISOString().split("T")[0],
            total_price: totalPrice,
            status: "pending",
          },
        ])
        .select()

      if (bookingError) throw bookingError

      toast({
        title: "Booking successful",
        description: "Your booking request has been submitted",
      })

      router.push("/guest/bookings")
    } catch (error) {
      console.error("Error creating booking:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create booking. Please try again.",
      })
    } finally {
      setBookingLoading(false)
      setShowPaymentForm(false)
    }
  }

  const handleReviewSubmit = async () => {
    if (!guestId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "You must be logged in as a guest to leave a review",
      })
      return
    }

    if (!userHasBooked) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "You must book this property before leaving a review",
      })
      return
    }

    if (reviewText.trim() === "") {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a review comment",
      })
      return
    }

    try {
      setReviewLoading(true)

      // Get the booking ID for this guest and property
      const { data: bookingData, error: bookingError } = await supabase
        .from("bookings")
        .select("booking_id")
        .eq("property_id", propertyId)
        .eq("guest_id", guestId)
        .limit(1)

      if (bookingError) throw bookingError

      if (!bookingData || bookingData.length === 0) {
        throw new Error("No booking found for this property")
      }

      const bookingId = bookingData[0].booking_id

      const { data, error } = await supabase
        .from("reviews")
        .insert([
          {
            booking_id: bookingId,
            guest_id: guestId,
            property_id: propertyId,
            rating: reviewRating,
            comments: reviewText,
            date: new Date().toISOString(),
          },
        ])
        .select()

      if (error) throw error

      // Add the new review to the list
      if (data && data.length > 0) {
        setReviews([data[0], ...reviews])
        setUserHasReviewed(true)
        setReviewText("")
      }

      toast({
        title: "Review submitted",
        description: "Thank you for your feedback",
      })
    } catch (error) {
      console.error("Error submitting review:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to submit review. Please try again.",
      })
    } finally {
      setReviewLoading(false)
    }
  }

  if (loading) {
    return <div className="flex justify-center p-12">Loading property details...</div>
  }

  if (!property) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p>Property not found.</p>
        </CardContent>
      </Card>
    )
  }

  const averageRating =
    reviews.length > 0 ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0

  return (
    <div className="space-y-6">
      <Button variant="outline" onClick={() => router.back()} className="mb-4">
        Back
      </Button>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <div className="aspect-video w-full bg-muted">
              <div className="h-full w-full flex items-center justify-center bg-muted">
                <Building className="h-16 w-16 text-muted-foreground/50" />
              </div>
            </div>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl">{property.name}</CardTitle>
                  <CardDescription className="flex items-center mt-1">
                    <MapPin className="h-4 w-4 mr-1" />
                    {property.address}
                  </CardDescription>
                </div>
                <div className="flex items-center">
                  <Star className="h-5 w-5 text-yellow-400 fill-yellow-400 mr-1" />
                  <span className="font-medium">{averageRating.toFixed(1)}</span>
                  <span className="text-muted-foreground ml-1">({reviews.length})</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div>
                  <p className="text-muted-foreground text-sm">Price</p>
                  <p className="font-medium">{formatCurrency(property.price_per_night)}/night</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Rooms</p>
                  <p className="font-medium">{property.number_of_rooms}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Type</p>
                  <p className="font-medium">{property.type}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Host</p>
                  <div className="flex items-center">
                    <p className="font-medium mr-1">{property.host?.name || "Unknown"}</p>
                    {property.host?.host_rating ? (
                      <div className="flex items-center text-sm">
                        <Star className="h-3 w-3 text-yellow-400 fill-yellow-400 mr-0.5" />
                        <span>{property.host.host_rating.toFixed(1)}</span>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-2">Description</h3>
                <p className="text-muted-foreground">{property.description || "No description provided."}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Reviews</CardTitle>
              <CardDescription>
                {reviews.length} {reviews.length === 1 ? "review" : "reviews"} for this property
              </CardDescription>
            </CardHeader>
            <CardContent>
              {userHasBooked && !userHasReviewed && (
                <div className="mb-6 border-b pb-6">
                  <h3 className="font-medium mb-2">Leave a Review</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Rating</p>
                      <Rating value={reviewRating} onChange={setReviewRating} />
                    </div>
                    <div>
                      <Textarea
                        placeholder="Share your experience..."
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        rows={3}
                      />
                    </div>
                    <Button onClick={handleReviewSubmit} disabled={reviewLoading}>
                      {reviewLoading ? "Submitting..." : "Submit Review"}
                    </Button>
                  </div>
                </div>
              )}

              {reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.review_id} className="border-b pb-4 last:border-0">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center">
                          <User className="h-5 w-5 mr-2 text-muted-foreground" />
                          <span className="font-medium">Guest</span>
                        </div>
                        <Rating value={review.rating} readOnly />
                      </div>
                      <p className="text-muted-foreground">{review.comments}</p>
                      <p className="text-xs text-muted-foreground mt-2">{new Date(review.date).toLocaleDateString()}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No reviews yet.</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          {showPaymentForm ? (
            <PaymentForm
              amount={property.price_per_night * calculateNights(checkInDate!, checkOutDate!)}
              onSubmit={handlePaymentSubmit}
              onCancel={() => setShowPaymentForm(false)}
              isLoading={bookingLoading}
            />
          ) : (
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle>Book this property</CardTitle>
                <CardDescription>Select your dates to book</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium mb-2">Price</p>
                  <p className="text-2xl font-bold">{formatCurrency(property.price_per_night)}</p>
                  <p className="text-sm text-muted-foreground">per night</p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium">Check-in Date</p>
                  <DatePicker date={checkInDate} setDate={setCheckInDate} label="Select check-in date" />
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium">Check-out Date</p>
                  <DatePicker date={checkOutDate} setDate={setCheckOutDate} label="Select check-out date" />
                </div>

                {checkInDate && checkOutDate && checkInDate < checkOutDate && (
                  <div className="border-t pt-4 mt-4">
                    <div className="flex justify-between mb-2">
                      <p>
                        {formatCurrency(property.price_per_night)} x {calculateNights(checkInDate, checkOutDate)} nights
                      </p>
                      <p>{formatCurrency(property.price_per_night * calculateNights(checkInDate, checkOutDate))}</p>
                    </div>
                    <div className="flex justify-between font-bold">
                      <p>Total</p>
                      <p>{formatCurrency(property.price_per_night * calculateNights(checkInDate, checkOutDate))}</p>
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  onClick={handleBookingStart}
                  disabled={!checkInDate || !checkOutDate || checkInDate >= checkOutDate || bookingLoading}
                >
                  {bookingLoading ? "Processing..." : "Book Now"}
                </Button>
              </CardFooter>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

