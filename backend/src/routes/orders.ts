import { Router, Request, Response } from 'express'
import { v4 as uuidv4 } from 'uuid'
import { supabase } from '../lib/supabase.js'
import { sendEmail, generateOrderEmailTemplate, generateStatusChangeEmailTemplate } from '../lib/email.js'
import { generateWhatsAppMessage, generateStatusUpdateWhatsApp } from '../lib/whatsapp.js'
import { authenticate, AuthRequest } from '../middleware/authenticate.js'

const router = Router()

// Create Order
router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { customer_name, phone, email, delivery_timeline, payment_status, total_amount, items } = req.body

    // Validate required fields
    if (!customer_name || !phone || !email || !delivery_timeline) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'At least one item is required' })
    }

    // Create order
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert({
        id: uuidv4(),
        customer_name,
        phone,
        email,
        delivery_timeline,
        status: 'Order Received',
        payment_status: payment_status || 'Pending',
        total_amount,
        created_by: req.user.id,
      })
      .select()
      .single()

    if (orderError) throw orderError

    // Create order items
    const orderItems = items.map((item: any) => ({
      id: uuidv4(),
      order_id: orderData.id,
      product_type: item.product_type,
      material: item.material,
      quantity: item.quantity,
      unit: item.unit,
      sale_cost: item.sale_cost,
    }))

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems)

    if (itemsError) throw itemsError

    // Fetch full order details with items
    const { data: fullOrder } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (*)
      `)
      .eq('id', orderData.id)
      .single()

    // Send confirmation email
    const emailHtml = generateOrderEmailTemplate({
      ...fullOrder,
      items: fullOrder.order_items.map((item: any) => ({
        ...item,
        sku: item.product_type,
        material: item.material,
      })),
    })

    await sendEmail({
      to: email,
      subject: `Order Confirmation - #${orderData.id.substring(0, 8)}`,
      html: emailHtml,
    })

    // Save notification record
    await supabase.from('order_notifications').insert({
      id: uuidv4(),
      order_id: orderData.id,
      type: 'email',
      status: 'sent',
      recipient: email,
      subject: `Order Confirmation - #${orderData.id.substring(0, 8)}`,
      message: emailHtml,
    })

    res.status(201).json({
      message: 'Order created successfully',
      order: fullOrder,
    })
  } catch (err: any) {
    console.error('Error creating order:', err)
    res.status(500).json({ error: err.message || 'Failed to create order' })
  }
})

// Get All Orders
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (*)
      `)
      .eq('created_by', req.user.id)
      .order('created_at', { ascending: false })

    if (error) throw error

    res.json(data)
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch orders' })
  }
})

// Get Order by ID
router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params

    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (*)
      `)
      .eq('id', id)
      .eq('created_by', req.user.id)
      .single()

    if (error) throw error
    if (!data) return res.status(404).json({ error: 'Order not found' })

    res.json(data)
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch order' })
  }
})

// Update Order Status
router.patch('/:id/status', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    const { status } = req.body

    const validStatuses = ['Order Received', 'Processing', 'Ready to Dispatch', 'Delivered']
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' })
    }

    // Get current order
    const { data: currentOrder, error: fetchError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .eq('created_by', req.user.id)
      .single()

    if (fetchError || !currentOrder) {
      return res.status(404).json({ error: 'Order not found' })
    }

    // Update order status
    const { data: updatedOrder, error: updateError } = await supabase
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (updateError) throw updateError

    // Log status change
    await supabase.from('order_status_history').insert({
      id: uuidv4(),
      order_id: id,
      previous_status: currentOrder.status,
      new_status: status,
      changed_by: req.user.id,
    })

    // Send status change email
    const emailHtml = generateStatusChangeEmailTemplate(currentOrder, status)
    await sendEmail({
      to: currentOrder.email,
      subject: `Order Status Updated - #${id.substring(0, 8)}`,
      html: emailHtml,
    })

    // Save notification
    await supabase.from('order_notifications').insert({
      id: uuidv4(),
      order_id: id,
      type: 'email',
      status: 'sent',
      recipient: currentOrder.email,
      subject: `Order Status Updated - #${id.substring(0, 8)}`,
      message: emailHtml,
    })

    res.json({ message: 'Order status updated', order: updatedOrder })
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update order status' })
  }
})

// Generate WhatsApp Message
router.get('/:id/whatsapp-message', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params

    const { data: order, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (*)
      `)
      .eq('id', id)
      .eq('created_by', req.user.id)
      .single()

    if (error || !order) {
      return res.status(404).json({ error: 'Order not found' })
    }

    const message = generateWhatsAppMessage({
      ...order,
      items: order.order_items.map((item: any) => ({
        ...item,
        sku: item.product_type,
        material: item.material,
      })),
    })

    res.json({ message })
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to generate message' })
  }
})

// Delete Order
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params

    // Check if order belongs to user
    const { data: order, error: checkError } = await supabase
      .from('orders')
      .select('id')
      .eq('id', id)
      .eq('created_by', req.user.id)
      .single()

    if (checkError || !order) {
      return res.status(404).json({ error: 'Order not found' })
    }

    // Delete order (cascade delete will handle items)
    const { error: deleteError } = await supabase
      .from('orders')
      .delete()
      .eq('id', id)

    if (deleteError) throw deleteError

    res.json({ message: 'Order deleted successfully' })
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to delete order' })
  }
})

export default router
