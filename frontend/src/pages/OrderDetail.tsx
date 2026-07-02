import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { orderAPI } from '../lib/api'
import { Order, OrderStatus } from '../types'
import { formatDistanceToNow } from 'date-fns'

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState('')
  const [showWhatsApp, setShowWhatsApp] = useState(false)
  const [whatsAppMessage, setWhatsAppMessage] = useState('')

  const statuses: OrderStatus[] = ['Order Received', 'Processing', 'Ready to Dispatch', 'Delivered']

  useEffect(() => {
    if (id) fetchOrder()
  }, [id])

  const fetchOrder = async () => {
    try {
      setLoading(true)
      const { data } = await orderAPI.getById(id!)
      setOrder(data)
    } catch (err) {
      setError('Failed to fetch order')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (newStatus: OrderStatus) => {
    try {
      setUpdating(true)
      await orderAPI.updateStatus(id!, newStatus)
      setOrder(prev => prev ? { ...prev, status: newStatus } : null)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update status')
    } finally {
      setUpdating(false)
    }
  }

  const handleGenerateWhatsApp = async () => {
    try {
      const { data } = await orderAPI.generateWhatsAppMessage(id!)
      setWhatsAppMessage(data.message)
      setShowWhatsApp(true)
    } catch (err) {
      setError('Failed to generate WhatsApp message')
    }
  }

  const openWhatsApp = () => {
    const encodedMessage = encodeURIComponent(whatsAppMessage)
    window.open(`https://wa.me/?text=${encodedMessage}`, '_blank')
  }

  if (loading) return <div className="text-center py-8">Loading...</div>
  if (!order) return <div className="text-center py-8">Order not found</div>

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold text-gray-800">Order #{order.id.slice(0, 8)}</h1>
        <button
          onClick={() => navigate('/dashboard')}
          className="text-stellar-600 hover:underline"
        >
          Back to Dashboard
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-6">
        {/* Customer Info */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Customer Information</h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Name</p>
              <p className="font-medium">{order.customer_name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-medium">{order.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Phone</p>
              <p className="font-medium">{order.phone}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Delivery Timeline</p>
              <p className="font-medium">{order.delivery_timeline}</p>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Total Amount</p>
              <p className="text-2xl font-bold text-stellar-600">₹{order.total_amount?.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Payment Status</p>
              <p className={`font-medium ${order.payment_status === 'Paid' ? 'text-green-600' : 'text-red-600'}`}>
                {order.payment_status}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Created</p>
              <p className="font-medium">
                {formatDistanceToNow(new Date(order.created_at), { addSuffix: true })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Order Items */}
      {order.items && order.items.length > 0 && (
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Order Items</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left">Product</th>
                  <th className="px-4 py-2 text-left">Material</th>
                  <th className="px-4 py-2 text-right">Quantity</th>
                  <th className="px-4 py-2 text-left">Unit</th>
                  <th className="px-4 py-2 text-right">Cost</th>
                  <th className="px-4 py-2 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item) => (
                  <tr key={item.id} className="border-b">
                    <td className="px-4 py-2">{item.sku?.sku}</td>
                    <td className="px-4 py-2">{item.material?.material}</td>
                    <td className="px-4 py-2 text-right">{item.quantity}</td>
                    <td className="px-4 py-2">{item.unit}</td>
                    <td className="px-4 py-2 text-right">₹{item.sale_cost}</td>
                    <td className="px-4 py-2 text-right font-semibold">₹{item.subtotal.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Status Management */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Order Status</h2>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {statuses.map((status) => (
              <button
                key={status}
                onClick={() => handleStatusChange(status)}
                disabled={updating || status === order.status}
                className={`px-4 py-2 rounded font-medium transition-colors ${
                  status === order.status
                    ? 'bg-stellar-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Communication */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Send Notification</h2>
        <div className="flex gap-4">
          <button
            onClick={handleGenerateWhatsApp}
            className="btn btn-secondary"
          >
            Generate WhatsApp Message
          </button>
        </div>

        {showWhatsApp && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-gray-700 mb-3">WhatsApp Message:</p>
            <textarea
              value={whatsAppMessage}
              onChange={(e) => setWhatsAppMessage(e.target.value)}
              className="w-full h-24 p-2 border border-gray-300 rounded text-sm"
            />
            <button
              onClick={openWhatsApp}
              className="btn btn-secondary mt-3"
            >
              Open WhatsApp
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
