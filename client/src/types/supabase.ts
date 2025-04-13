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
      customers: {
        Row: {
          address: string | null
          created_at: string
          email: string
          id: number
          name: string
          phone: string | null
          updated_at: string | null
          user_id: number | null
        }
        Insert: {
          address?: string | null
          created_at?: string
          email: string
          id?: number
          name: string
          phone?: string | null
          updated_at?: string | null
          user_id?: number | null
        }
        Update: {
          address?: string | null
          created_at?: string
          email?: string
          id?: number
          name?: string
          phone?: string | null
          updated_at?: string | null
          user_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "customers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      deliveries: {
        Row: {
          created_at: string
          currency: string | null
          customer_id: number | null
          delivery_fee: number | null
          delivery_id: string
          dropoff_address: string
          dropoff_eta: string | null
          dropoff_latitude: number | null
          dropoff_longitude: number | null
          dropoff_name: string
          dropoff_phone: string
          id: number
          integration_id: number
          order_id: number | null
          pickup_address: string
          pickup_eta: string | null
          pickup_latitude: number | null
          pickup_longitude: number | null
          pickup_name: string
          pickup_phone: string
          provider: string
          status: string
          tracking_url: string | null
          updated_at: string | null
          user_id: number
        }
        Insert: {
          created_at?: string
          currency?: string | null
          customer_id?: number | null
          delivery_fee?: number | null
          delivery_id: string
          dropoff_address: string
          dropoff_eta?: string | null
          dropoff_latitude?: number | null
          dropoff_longitude?: number | null
          dropoff_name: string
          dropoff_phone: string
          id?: number
          integration_id: number
          order_id?: number | null
          pickup_address: string
          pickup_eta?: string | null
          pickup_latitude?: number | null
          pickup_longitude?: number | null
          pickup_name: string
          pickup_phone: string
          provider: string
          status: string
          tracking_url?: string | null
          updated_at?: string | null
          user_id: number
        }
        Update: {
          created_at?: string
          currency?: string | null
          customer_id?: number | null
          delivery_fee?: number | null
          delivery_id?: string
          dropoff_address?: string
          dropoff_eta?: string | null
          dropoff_latitude?: number | null
          dropoff_longitude?: number | null
          dropoff_name?: string
          dropoff_phone?: string
          id?: number
          integration_id?: number
          order_id?: number | null
          pickup_address?: string
          pickup_eta?: string | null
          pickup_latitude?: number | null
          pickup_longitude?: number | null
          pickup_name?: string
          pickup_phone?: string
          provider?: string
          status?: string
          tracking_url?: string | null
          updated_at?: string | null
          user_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "deliveries_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deliveries_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "integrations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deliveries_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deliveries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      integrations: {
        Row: {
          api_key: string | null
          api_secret: string | null
          config: Json | null
          created_at: string
          id: number
          name: string
          status: string
          type: string
          updated_at: string | null
          url: string | null
          user_id: number
        }
        Insert: {
          api_key?: string | null
          api_secret?: string | null
          config?: Json | null
          created_at?: string
          id?: number
          name: string
          status?: string
          type: string
          updated_at?: string | null
          url?: string | null
          user_id: number
        }
        Update: {
          api_key?: string | null
          api_secret?: string | null
          config?: Json | null
          created_at?: string
          id?: number
          name?: string
          status?: string
          type?: string
          updated_at?: string | null
          url?: string | null
          user_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "integrations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      orders: {
        Row: {
          created_at: string
          customer_id: number | null
          id: number
          order_number: string
          status: string
          total_amount: number
          updated_at: string | null
          user_id: number
        }
        Insert: {
          created_at?: string
          customer_id?: number | null
          id?: number
          order_number: string
          status?: string
          total_amount: number
          updated_at?: string | null
          user_id: number
        }
        Update: {
          created_at?: string
          customer_id?: number | null
          id?: number
          order_number?: string
          status?: string
          total_amount?: number
          updated_at?: string | null
          user_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      social_media_accounts: {
        Row: {
          access_token: string | null
          created_at: string
          id: number
          platform: string
          refresh_token: string | null
          status: string
          updated_at: string | null
          user_id: number
          username: string
        }
        Insert: {
          access_token?: string | null
          created_at?: string
          id?: number
          platform: string
          refresh_token?: string | null
          status?: string
          updated_at?: string | null
          user_id: number
          username: string
        }
        Update: {
          access_token?: string | null
          created_at?: string
          id?: number
          platform?: string
          refresh_token?: string | null
          status?: string
          updated_at?: string | null
          user_id?: number
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "social_media_accounts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      users: {
        Row: {
          business_name: string | null
          created_at: string
          email: string
          id: number
          password: string
          role: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscription_plan: string | null
          updated_at: string | null
          username: string
        }
        Insert: {
          business_name?: string | null
          created_at?: string
          email: string
          id?: number
          password: string
          role?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_plan?: string | null
          updated_at?: string | null
          username: string
        }
        Update: {
          business_name?: string | null
          created_at?: string
          email?: string
          id?: number
          password?: string
          role?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_plan?: string | null
          updated_at?: string | null
          username?: string
        }
        Relationships: []
      }
      webhook_logs: {
        Row: {
          created_at: string
          id: number
          payload: Json | null
          response: Json | null
          status: string
          webhook_id: number
        }
        Insert: {
          created_at?: string
          id?: number
          payload?: Json | null
          response?: Json | null
          status: string
          webhook_id: number
        }
        Update: {
          created_at?: string
          id?: number
          payload?: Json | null
          response?: Json | null
          status?: string
          webhook_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "webhook_logs_webhook_id_fkey"
            columns: ["webhook_id"]
            isOneToOne: false
            referencedRelation: "webhooks"
            referencedColumns: ["id"]
          }
        ]
      }
      webhooks: {
        Row: {
          created_at: string
          description: string | null
          endpoint_url: string
          event_types: string[] | null
          id: number
          name: string
          secret_key: string
          status: string
          updated_at: string | null
          user_id: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          endpoint_url: string
          event_types?: string[] | null
          id?: number
          name: string
          secret_key: string
          status?: string
          updated_at?: string | null
          user_id: number
        }
        Update: {
          created_at?: string
          description?: string | null
          endpoint_url?: string
          event_types?: string[] | null
          id?: number
          name?: string
          secret_key?: string
          status?: string
          updated_at?: string | null
          user_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "webhooks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
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