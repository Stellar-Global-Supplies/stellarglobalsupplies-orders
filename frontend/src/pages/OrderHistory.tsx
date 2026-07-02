import { useEffect, useState } from 'react'
import { orderAPI } from '../lib/api'
import { Order } from '../types'
import { formatDistanceToNow } from 'date-fns'

export default function OrderHistory() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<'recent' | 'oldest'>('recent')

  useEffect(() => {
    fetchOrders()
  }, [sortBy])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const { data } = await orderAPI.list()
      let sorted = data || []
      if (sortBy === 'recent') {
        sorted = sorted.sort((a: Order, b: Order) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      } else {
        sorted = sorted.sort((a: Order, b: Order) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      }
      setOrders(sorted)
    } catch (err) {
      console.error('Failed to fetch orders:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold text-gray-800">Order History</h1>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'recent' | 'oldest')}
          className="form-input max-w-xs"
        >
          <option value="recent">Recent First</option>
          <option value="oldest">Oldest First</option>
        </select>
      </div>

      {loading ? (
        <p>Loading orders...</p>
      ) : orders.length === 0 ? (
        <p className="text-gray-500">No orders found</p>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-semibold">Order ID</th>
                <th className="px-4 py-2 text-left text-sm font-semibold">Customer</th>
                <th className="px-4 py-2 text-left text-sm font-semibold">Status</th>
                <th className="px-4 py-2 text-right text-sm font-semibold">Amount</th>
                <th className="px-4 py-2 text-left text-sm font-semibold">Created</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-mono">{order.id.slice(0, 8)}</td>
                  <td className="px-4 py-3">{order.customer_name}</td>
                  <td className="px-4 py-3">
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-stellar-100 text-stellar-800">
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold">₹{order.total_amount?.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {formatDistanceToNow(new Date(order.created_at), { addSuffix: true })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
