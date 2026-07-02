import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL || ''
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error('Missing Supabase credentials')
}

export const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

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
          metadata: Record<string, any>
        }
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
      order_status_history: {
        Row: {
          id: string
          order_id: string
          previous_status: string | null
          new_status: string
          changed_at: string
          changed_by: string | null
          notes: string | null
        }
      }
    }
  }
}
