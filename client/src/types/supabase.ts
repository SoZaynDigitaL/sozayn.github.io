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
      profiles: {
        Row: {
          id: string
          created_at: string
          username: string
          email: string
          business_name: string
          business_type: string
          role: string
          subscription_plan: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscription_status: string | null
          subscription_expires_at: string | null
        }
        Insert: {
          id: string
          created_at?: string
          username: string
          email: string
          business_name: string
          business_type: string
          role?: string
          subscription_plan?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_status?: string | null
          subscription_expires_at?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          username?: string
          email?: string
          business_name?: string
          business_type?: string
          role?: string
          subscription_plan?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_status?: string | null
          subscription_expires_at?: string | null
        }
      }
      integrations: {
        Row: {
          id: number
          created_at: string
          user_id: string
          type: string
          provider: string
          name: string
          api_key: string | null
          api_secret: string | null
          access_token: string | null
          refresh_token: string | null
          token_expires_at: string | null
          webhook_url: string | null
          store_url: string | null
          merchant_id: string | null
          status: string
          settings: Json | null
        }
        Insert: {
          id?: number
          created_at?: string
          user_id: string
          type: string
          provider: string
          name: string
          api_key?: string | null
          api_secret?: string | null
          access_token?: string | null
          refresh_token?: string | null
          token_expires_at?: string | null
          webhook_url?: string | null
          store_url?: string | null
          merchant_id?: string | null
          status?: string
          settings?: Json | null
        }
        Update: {
          id?: number
          created_at?: string
          user_id?: string
          type?: string
          provider?: string
          name?: string
          api_key?: string | null
          api_secret?: string | null
          access_token?: string | null
          refresh_token?: string | null
          token_expires_at?: string | null
          webhook_url?: string | null
          store_url?: string | null
          merchant_id?: string | null
          status?: string
          settings?: Json | null
        }
      }
      webhooks: {
        Row: {
          id: number
          created_at: string
          user_id: string
          type: string
          name: string
          url: string
          secret_key: string
          status: string
          events: string[]
          description: string | null
        }
        Insert: {
          id?: number
          created_at?: string
          user_id: string
          type: string
          name: string
          url: string
          secret_key: string
          status?: string
          events: string[]
          description?: string | null
        }
        Update: {
          id?: number
          created_at?: string
          user_id?: string
          type?: string
          name?: string
          url?: string
          secret_key?: string
          status?: string
          events?: string[]
          description?: string | null
        }
      }
      webhook_logs: {
        Row: {
          id: number
          created_at: string
          webhook_id: number
          status: string
          request_body: Json
          response_body: Json | null
          response_status: number | null
          error_message: string | null
        }
        Insert: {
          id?: number
          created_at?: string
          webhook_id: number
          status: string
          request_body: Json
          response_body?: Json | null
          response_status?: number | null
          error_message?: string | null
        }
        Update: {
          id?: number
          created_at?: string
          webhook_id?: number
          status?: string
          request_body?: Json
          response_body?: Json | null
          response_status?: number | null
          error_message?: string | null
        }
      }
      orders: {
        Row: {
          id: number
          created_at: string
          user_id: string
          order_number: string
          customer_id: number | null
          status: string
          total_amount: number
          currency: string
          payment_status: string
          fulfillment_status: string
          source: string
          notes: string | null
          metadata: Json | null
        }
        Insert: {
          id?: number
          created_at?: string
          user_id: string
          order_number: string
          customer_id?: number | null
          status?: string
          total_amount: number
          currency: string
          payment_status?: string
          fulfillment_status?: string
          source: string
          notes?: string | null
          metadata?: Json | null
        }
        Update: {
          id?: number
          created_at?: string
          user_id?: string
          order_number?: string
          customer_id?: number | null
          status?: string
          total_amount?: number
          currency?: string
          payment_status?: string
          fulfillment_status?: string
          source?: string
          notes?: string | null
          metadata?: Json | null
        }
      }
      customers: {
        Row: {
          id: number
          created_at: string
          user_id: string
          name: string
          email: string
          phone: string | null
          address: string | null
          city: string | null
          state: string | null
          postal_code: string | null
          country: string | null
          metadata: Json | null
        }
        Insert: {
          id?: number
          created_at?: string
          user_id: string
          name: string
          email: string
          phone?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          postal_code?: string | null
          country?: string | null
          metadata?: Json | null
        }
        Update: {
          id?: number
          created_at?: string
          user_id?: string
          name?: string
          email?: string
          phone?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          postal_code?: string | null
          country?: string | null
          metadata?: Json | null
        }
      }
      deliveries: {
        Row: {
          id: number
          created_at: string
          user_id: string
          order_id: number | null
          integration_id: number
          provider: string
          external_id: string | null
          status: string
          tracking_url: string | null
          pickup_address: string
          pickup_lat: number | null
          pickup_lng: number | null
          dropoff_address: string
          dropoff_lat: number | null
          dropoff_lng: number | null
          current_lat: number | null
          current_lng: number | null
          pickup_eta: string | null
          dropoff_eta: string | null
          driver_name: string | null
          driver_phone: string | null
          vehicle_type: string | null
          fee: number | null
          currency: string | null
          metadata: Json | null
        }
        Insert: {
          id?: number
          created_at?: string
          user_id: string
          order_id?: number | null
          integration_id: number
          provider: string
          external_id?: string | null
          status?: string
          tracking_url?: string | null
          pickup_address: string
          pickup_lat?: number | null
          pickup_lng?: number | null
          dropoff_address: string
          dropoff_lat?: number | null
          dropoff_lng?: number | null
          current_lat?: number | null
          current_lng?: number | null
          pickup_eta?: string | null
          dropoff_eta?: string | null
          driver_name?: string | null
          driver_phone?: string | null
          vehicle_type?: string | null
          fee?: number | null
          currency?: string | null
          metadata?: Json | null
        }
        Update: {
          id?: number
          created_at?: string
          user_id?: string
          order_id?: number | null
          integration_id?: number
          provider?: string
          external_id?: string | null
          status?: string
          tracking_url?: string | null
          pickup_address?: string
          pickup_lat?: number | null
          pickup_lng?: number | null
          dropoff_address?: string
          dropoff_lat?: number | null
          dropoff_lng?: number | null
          current_lat?: number | null
          current_lng?: number | null
          pickup_eta?: string | null
          dropoff_eta?: string | null
          driver_name?: string | null
          driver_phone?: string | null
          vehicle_type?: string | null
          fee?: number | null
          currency?: string | null
          metadata?: Json | null
        }
      }
      social_media_accounts: {
        Row: {
          id: number
          created_at: string
          user_id: string
          platform: string
          username: string
          display_name: string | null
          access_token: string | null
          refresh_token: string | null
          token_expires_at: string | null
          profile_url: string | null
          status: string
          settings: Json | null
        }
        Insert: {
          id?: number
          created_at?: string
          user_id: string
          platform: string
          username: string
          display_name?: string | null
          access_token?: string | null
          refresh_token?: string | null
          token_expires_at?: string | null
          profile_url?: string | null
          status?: string
          settings?: Json | null
        }
        Update: {
          id?: number
          created_at?: string
          user_id?: string
          platform?: string
          username?: string
          display_name?: string | null
          access_token?: string | null
          refresh_token?: string | null
          token_expires_at?: string | null
          profile_url?: string | null
          status?: string
          settings?: Json | null
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}