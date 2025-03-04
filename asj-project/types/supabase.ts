export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      properties: {
        Row: {
          id: string
          created_at: string
          title: string
          description: string
          price_per_night: number
          location: string
          address: string
          image_urls: string[]
          host_id: string
          bedrooms: number
          bathrooms: number
          max_guests: number
          amenities: string[]
          latitude: number | null
          longitude: number | null
        }
        Insert: {
          id?: string
          created_at?: string
          title: string
          description: string
          price_per_night: number
          location: string
          address: string
          image_urls: string[]
          host_id: string
          bedrooms: number
          bathrooms: number
          max_guests: number
          amenities: string[]
          latitude?: number | null
          longitude?: number | null
        }
        Update: {
          id?: string
          created_at?: string
          title?: string
          description?: string
          price_per_night?: number
          location?: string
          address?: string
          image_urls?: string[]
          host_id?: string
          bedrooms?: number
          bathrooms?: number
          max_guests?: number
          amenities?: string[]
          latitude?: number | null
          longitude?: number | null
        }
      }
      bookings: {
        Row: {
          id: string
          created_at: string
          property_id: string
          user_id: string
          check_in_date: string
          check_out_date: string
          total_price: number
          status: "pending" | "confirmed" | "cancelled" | "completed"
          guest_count: number
        }
        Insert: {
          id?: string
          created_at?: string
          property_id: string
          user_id: string
          check_in_date: string
          check_out_date: string
          total_price: number
          status?: "pending" | "confirmed" | "cancelled" | "completed"
          guest_count: number
        }
        Update: {
          id?: string
          created_at?: string
          property_id?: string
          user_id?: string
          check_in_date?: string
          check_out_date?: string
          total_price?: number
          status?: "pending" | "confirmed" | "cancelled" | "completed"
          guest_count?: number
        }
      }
      reviews: {
        Row: {
          id: string
          created_at: string
          booking_id: string
          user_id: string
          property_id: string
          rating: number
          comment: string
        }
        Insert: {
          id?: string
          created_at?: string
          booking_id: string
          user_id: string
          property_id: string
          rating: number
          comment: string
        }
        Update: {
          id?: string
          created_at?: string
          booking_id?: string
          user_id?: string
          property_id?: string
          rating?: number
          comment?: string
        }
      }
      profiles: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          full_name: string | null
          avatar_url: string | null
          email: string | null
          phone: string | null
          is_host: boolean
        }
        Insert: {
          id: string
          created_at?: string
          updated_at?: string
          full_name?: string | null
          avatar_url?: string | null
          email?: string | null
          phone?: string | null
          is_host?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          full_name?: string | null
          avatar_url?: string | null
          email?: string | null
          phone?: string | null
          is_host?: boolean
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

