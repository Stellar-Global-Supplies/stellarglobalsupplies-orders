import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useOrderStore } from '../stores/orderStore'
import { orderAPI, skuAPI, materialAPI } from '../lib/api'
import { SKU, Material } from '../types'

export default function CreateOrder() {
  const navigate = useNavigate()
  const { formData, setFormData, addItem, removeItem, updateItem, resetForm } = useOrderStore()

  const [skus, setSkus] = useState<SKU[]>([])
  const [materials, setMaterials] = useState<Material[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [newItem, setNewItem] = useState({
    product_type: '',
    material: '',
    quantity: '',
    unit: 'Pieces' as 'Pieces' | 'Kgs',
    sale_cost: '',
})

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [skuRes, matRes] = await Promise.all([skuAPI.list(), materialAPI.list()])
      setSkus(skuRes.data || [])
      setMaterials(matRes.data || [])
    } catch (err) {
      console.error('Failed to fetch data:', err)
      setError('Failed to load products and materials')
    }
  }

  const handleAddItem = () => {
    if (!newItem.sku.id || !newItem.material.id || !newItem.quantity || !newItem.sale_cost) {
      setError('Please fill all item fields')
      return
    }

    addItem({
      sku.id: newItem.sku.id,
      material.id: newItem.material.id,
      quantity: parseFloat(newItem.quantity),
      unit: newItem.unit,
      sale_cost: parseFloat(newItem.sale_cost),
    })

    setNewItem({
      sku.id: '',
      material.id: '',
      quantity: '',
      unit: 'Pieces',
      sale_cost: '',
    })
    setError('')
  }

  const calculateTotal = () => {
    return formData.items.reduce((total, item) => total + (item.quantity * item.sale_cost), 0)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.customer_name || !formData.phone || !formData.email || !formData.delivery_timeline) {
      setError('Please fill all customer fields')
      return
    }

    if (formData.items.length === 0) {
      setError('Please add at least one item')
      return
    }

    try {
      setLoading(true)
      await orderAPI.create({
        customer_name: formData.customer_name,
        phone: formData.phone,
        email: formData.email,
        delivery_timeline: formData.delivery_timeline,
        payment_status: formData.payment_status,
        total_amount: calculateTotal(),
        items: formData.items,
      })

      resetForm()
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create order')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-bold text-gray-800">Create New Order</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* Customer Details */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Customer Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name *</label>
              <input
                type="text"
                value={formData.customer_name}
                onChange={(e) => setFormData({ customer_name: e.target.value })}
                className="form-input"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ phone: e.target.value })}
                className="form-input"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ email: e.target.value })}
                className="form-input"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Timeline *</label>
              <input
                type="date"
                value={formData.delivery_timeline}
                onChange={(e) => setFormData({ delivery_timeline: e.target.value })}
                className="form-input"
                required
              />
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Order Items</h2>

          {/* Add Item Form */}
          <div className="bg-gray-50 p-4 rounded-lg mb-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product SKU *</label>
                <select
                  value={newItem.sku.id}
                  onChange={(e) => setNewItem({ ...newItem, sku.id: e.target.value })}
                  className="form-input"
                >
                  <option value="">Select SKU</option>
                  {skus.map((sku) => (
                    <option key={sku.id} value={sku.id}>{sku.sku}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Material *</label>
                <select
                  value={newItem.material.id}
                  onChange={(e) => setNewItem({ ...newItem, material.id: e.target.value })}
                  className="form-input"
                >
                  <option value="">Select Material</option>
                  {materials.map((mat) => (
                    <option key={mat.id} value={mat.id}>{mat.material}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
                <input
                  type="number"
                  step="0.01"
                  value={newItem.quantity}
                  onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
                  className="form-input"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Unit *</label>
                <select
                  value={newItem.unit}
                  onChange={(e) => setNewItem({ ...newItem, unit: e.target.value as 'Pieces' | 'Kgs' })}
                  className="form-input"
                >
                  <option value="Pieces">Pieces</option>
                  <option value="Kgs">Kgs</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sale Cost *</label>
                <input
                  type="number"
                  step="0.01"
                  value={newItem.sale_cost}
                  onChange={(e) => setNewItem({ ...newItem, sale_cost: e.target.value })}
                  className="form-input"
                  placeholder="0"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={handleAddItem}
              className="btn btn-secondary w-full"
            >
              Add Item
            </button>
          </div>

          {/* Items List */}
          {formData.items.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left">SKU</th>
                    <th className="px-4 py-2 text-left">Material</th>
                    <th className="px-4 py-2 text-right">Quantity</th>
                    <th className="px-4 py-2 text-left">Unit</th>
                    <th className="px-4 py-2 text-right">Cost</th>
                    <th className="px-4 py-2 text-right">Subtotal</th>
                    <th className="px-4 py-2 text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.items.map((item, idx) => {
                    const sku = skus.find(s => s.id === item.sku.id)
                    const material = materials.find(m => m.id === item.material.id)
                    const subtotal = item.quantity * item.sale_cost
                    return (
                      <tr key={idx} className="border-b">
                        <td className="px-4 py-2">{sku?.sku}</td>
                        <td className="px-4 py-2">{material?.material}</td>
                        <td className="px-4 py-2 text-right">{item.quantity}</td>
                        <td className="px-4 py-2">{item.unit}</td>
                        <td className="px-4 py-2 text-right">₹{item.sale_cost}</td>
                        <td className="px-4 py-2 text-right font-semibold">₹{subtotal.toLocaleString()}</td>
                        <td className="px-4 py-2 text-center">
                          <button
                            type="button"
                            onClick={() => removeItem(idx)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                  <tr className="bg-gray-50 font-semibold">
                    <td colSpan={5} className="px-4 py-2 text-right">Total Amount:</td>
                    <td className="px-4 py-2 text-right">₹{calculateTotal().toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Payment Status */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Payment Details</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Status</label>
            <select
              value={formData.payment_status}
              onChange={(e) => setFormData({ payment_status: e.target.value as any })}
              className="form-input"
            >
              <option value="Pending">Pending</option>
              <option value="Partial">Partial</option>
              <option value="Paid">Paid</option>
            </select>
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary flex-1"
          >
            {loading ? 'Creating Order...' : 'Create Order'}
          </button>
          <button
            type="button"
            onClick={() => {
              resetForm()
              navigate('/dashboard')
            }}
            className="btn bg-gray-400 text-white hover:bg-gray-500 flex-1"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
