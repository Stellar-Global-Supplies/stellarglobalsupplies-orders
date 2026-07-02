export interface Order {
  id: string
  customer_name: string
  phone: string
  email: string
  delivery_timeline: string
  status: OrderStatus
  payment_status: PaymentStatus
  total_amount: number
  created_at: string
  updated_at: string
  created_by: string
  items?: OrderItem[]
}

export type OrderStatus = 'Order Received' | 'Processing' | 'Ready to Dispatch' | 'Delivered'
export type PaymentStatus = 'Pending' | 'Partial' | 'Paid'

export interface OrderItem {
  id: string
  order_id: string
  sku_id: string
  material_id: string
  quantity: number
  unit: 'Pieces' | 'Kgs'
  sale_cost: number
  subtotal: number
  created_at: string
  sku?: { sku: string }
  material?: { material: string }
}

export interface SKU {
  id: string
  sku: string
  created_at: string
}

export interface Material {
  id: string
  material: string
  created_at: string
}

export interface User {
  id: string
  email: string
  user_metadata?: Record<string, any>
}
