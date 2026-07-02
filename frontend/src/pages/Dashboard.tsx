import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { orderAPI } from '../lib/api'
import { Order } from '../types'
import { formatDistanceToNow } from 'date-fns'

export default function Dashboard() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const { data } = await orderAPI.list()
      setOrders(data || [])
    } catch (err) {
      console.error('Failed to fetch orders:', err)
    } finally {
      setLoading(false)
    }
  }

  const filteredOrders = filter === 'all'
    ? orders
    : orders.filter((o) => o.status === filter)

  const statusColors = {
    'Order Received': 'bg-blue-100 text-blue-800',
    'Processing': 'bg-yellow-100 text-yellow-800',
    'Ready to Dispatch': 'bg-green-100 text-green-800',
    'Delivered': 'bg-gray-100 text-gray-800',
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold text-gray-800">Dashboard</h1>
        <Link to="/create-order" className="btn btn-primary">
          New Order
        </Link>
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Quick Stats</h2>
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Total Orders</p>
            <p className="text-2xl font-bold text-blue-600">{orders.length}</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Processing</p>
            <p className="text-2xl font-bold text-yellow-600">{orders.filter(o => o.status === 'Processing').length}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Ready to Dispatch</p>
            <p className="text-2xl font-bold text-green-600">{orders.filter(o => o.status === 'Ready to Dispatch').length}</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Pending Payment</p>
            <p className="text-2xl font-bold text-purple-600">{orders.filter(o => o.payment_status === 'Pending').length}</p>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Recent Orders</h2>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="form-input max-w-xs"
          >
            <option value="all">All Orders</option>
            <option value="Order Received">Order Received</option>
            <option value="Processing">Processing</option>
            <option value="Ready to Dispatch">Ready to Dispatch</option>
            <option value="Delivered">Delivered</option>
          </select>
        </div>

        {loading ? (
          <p>Loading orders...</p>
        ) : filteredOrders.length === 0 ? (
          <p className="text-gray-500">No orders found</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-semibold">Customer</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold">Status</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold">Amount</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold">Payment</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold">Created</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3">{order.customer_name}</td>
                    <td className="px-4 py-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[order.status as keyof typeof statusColors]}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">₹{order.total_amount?.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`text-sm ${order.payment_status === 'Paid' ? 'text-green-600' : 'text-red-600'}`}>
                        {order.payment_status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {formatDistanceToNow(new Date(order.created_at), { addSuffix: true })}
                    </td>
                    <td className="px-4 py-3">
                      <Link to={`/orders/${order.id}`} className="text-blue-600 hover:underline">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
