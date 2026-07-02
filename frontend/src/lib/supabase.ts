import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase credentials in environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      orders: {
        Row: {
          id: string
          customer_name: string
          phone: string
          email: string
          delivery_timeline: string
          status: 'Order Received' | 'Processing' | 'Ready to Dispatch' | 'Delivered'
          payment_status: 'Pending' | 'Partial' | 'Paid'
          total_amount: number
          created_at: string
          updated_at: string
          created_by: string
        }
        Insert: Omit<Database['public']['Tables']['orders']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['orders']['Row']>
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          sku_id: string
          material_id: string
          quantity: number
          unit: 'Pieces' | 'Kgs'
          sale_cost: number
          subtotal: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['order_items']['Row'], 'id' | 'subtotal' | 'created_at'>
        Update: Partial<Database['public']['Tables']['order_items']['Row']>
      }
      top_sku: {
        Row: {
          id: string
          sku: string
          created_at: string
        }
      }
      material_spilt: {
        Row: {
          id: string
          material: string
          created_at: string
        }
      }
    }
  }
}
