import { createClient } from "@supabase/supabase-js"

const supabaseUrl = "https://ttorrxkiqkohlwmqucvu.supabase.co"
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0b3JyeGtpcWtvaGx3bXF1Y3Z1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEwNzcyODUsImV4cCI6MjA1NjY1MzI4NX0.OQHTfCT_juFfAHJbdKgCCsEpC00D0mEWJcWiHCYeT7Q"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type UserType = "host" | "guest"

export type Host = {
  host_id: string
  user_id: string
  name: string
  host_rating: number
  created_at: string
}

export type Guest = {
  guest_id: string
  user_id: string
  preferences: Record<string, any>
  created_at: string
}

export type Property = {
  property_id: string
  host_id: string
  name: string
  address: string
  type: string
  description: string
  number_of_rooms: number
  price_per_night: number
  availability_status: boolean
  created_at: string
  updated_at: string
  host?: Host
}

export type PaymentMethod = "credit_card" | "digital_wallet"

export type Payment = {
  payment_id: string
  amount: number
  currency: string
  status: "pending" | "completed" | "failed" | "refunded"
  payment_type: PaymentMethod
  created_at: string
  updated_at: string
}

export type CreditCardPayment = {
  payment_id: string
  card_number: string
  cardholder_name: string
  expiry_month: number
  expiry_year: number
  last_four: string
  created_at: string
}

export type DigitalWalletPayment = {
  payment_id: string
  wallet_id: string
  provider: string
  created_at: string
}

export type Booking = {
  booking_id: string
  property_id: string
  guest_id: string
  payment_id?: string
  check_in_date: string
  check_out_date: string
  total_price: number
  status: "pending" | "confirmed" | "cancelled" | "completed"
  created_at: string
  updated_at: string
  property?: Property
  payment?: Payment
}

export type Review = {
  review_id: string
  booking_id: string
  guest_id: string
  property_id: string
  rating: number
  comments: string
  date: string
  property?: Property
}

