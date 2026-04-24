export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string
          title: string
          subtitle: string
          image: string
          link: string
          gradient: string
          tag: string
          color: string
        }
        Insert: {
          id: string
          title: string
          subtitle: string
          image: string
          link: string
          gradient: string
          tag: string
          color: string
        }
        Update: {
          id?: string
          title?: string
          subtitle?: string
          image?: string
          link?: string
          gradient?: string
          tag?: string
          color?: string
        }
      }
      products: {
        Row: {
          id: number
          name: string
          category: string
          price: number
          original_price: number
          image: string
          tag: string
          rating: number
          reviews: number
          badge: string
          is_trending: boolean
          color: string | null
          material: string | null
          sizes: string[] | null
          inventory_count: number
          gallery_images: string[] | null
          variants: Json[] | null
        }
        Insert: {
          id?: number
          name: string
          category: string
          price: number
          original_price: number
          image: string
          tag: string
          rating?: number
          reviews?: number
          badge?: string
          is_trending?: boolean
          color?: string | null
          material?: string | null
          sizes?: string[] | null
          inventory_count?: number
          gallery_images?: string[] | null
          variants?: Json[] | null
        }
        Update: {
          id?: number
          name?: string
          category?: string
          price?: number
          original_price?: number
          image?: string
          tag?: string
          rating?: number
          reviews?: number
          badge?: string
          is_trending?: boolean
          color?: string | null
          material?: string | null
          sizes?: string[] | null
          inventory_count?: number
          gallery_images?: string[] | null
          variants?: Json[] | null
        }
      }
      testimonials: {
        Row: {
          id: number
          name: string
          location: string
          text: string
          rating: number
        }
        Insert: {
          id?: number
          name: string
          location: string
          text: string
          rating?: number
        }
        Update: {
          id?: number
          name?: string
          location?: string
          text?: string
          rating?: number
        }
      }
      orders: {
        Row: {
          id: string
          user_id: string | null
          total_amount: number
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          total_amount: number
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          total_amount?: number
          status?: string
          created_at?: string
        }
      }
      order_items: {
        Row: {
          id: number
          order_id: string
          product_id: number
          quantity: number
          unit_price: number
        }
        Insert: {
          id?: number
          order_id: string
          product_id: number
          quantity?: number
          unit_price: number
        }
        Update: {
          id?: number
          order_id?: string
          product_id?: number
          quantity?: number
          unit_price?: number
        }
      }
      addresses: {
        Row: {
          id: string
          user_id: string
          full_name: string
          phone: string
          address_line1: string
          address_line2: string | null
          city: string
          state: string
          pincode: string
          is_default: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          full_name: string
          phone: string
          address_line1: string
          address_line2?: string | null
          city: string
          state: string
          pincode: string
          is_default?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          full_name?: string
          phone?: string
          address_line1?: string
          address_line2?: string | null
          city?: string
          state?: string
          pincode?: string
          is_default?: boolean
          created_at?: string
        }
      }
    }
  }
}
