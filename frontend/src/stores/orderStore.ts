import { create } from 'zustand'
import { Order, OrderItem } from '../types'

interface OrderFormData {
  customer_name: string
  phone: string
  email: string
  delivery_timeline: string
  payment_status: 'Pending' | 'Partial' | 'Paid'
  items: Omit<OrderItem, 'id' | 'order_id' | 'created_at' | 'subtotal'>[]
}

interface OrderStore {
  formData: OrderFormData
  setFormData: (data: Partial<OrderFormData>) => void
  addItem: (item: Omit<OrderItem, 'id' | 'order_id' | 'created_at' | 'subtotal'>) => void
  removeItem: (index: number) => void
  updateItem: (index: number, item: Partial<OrderItem>) => void
  resetForm: () => void
}

const initialFormData: OrderFormData = {
  customer_name: '',
  phone: '',
  email: '',
  delivery_timeline: '',
  payment_status: 'Pending',
  items: [],
}

export const useOrderStore = create<OrderStore>((set) => ({
  formData: initialFormData,
  setFormData: (data) =>
    set((state) => ({
      formData: { ...state.formData, ...data },
    })),
  addItem: (item) =>
    set((state) => ({
      formData: {
        ...state.formData,
        items: [...state.formData.items, item],
      },
    })),
  removeItem: (index) =>
    set((state) => ({
      formData: {
        ...state.formData,
        items: state.formData.items.filter((_, i) => i !== index),
      },
    })),
  updateItem: (index, item) =>
    set((state) => ({
      formData: {
        ...state.formData,
        items: state.formData.items.map((i, idx) =>
          idx === index ? { ...i, ...item } : i
        ),
      },
    })),
  resetForm: () => set({ formData: initialFormData }),
}))
