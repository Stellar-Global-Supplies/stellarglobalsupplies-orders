import { supabase } from './supabase';

const API_BASE = process.env.REACT_APP_API_BASE_URL;

async function authHeaders() {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${session?.access_token ?? ''}`,
  };
}

export async function createOrder(orderData) {
  const headers = await authHeaders();
  const res = await fetch(`${API_BASE}/orders`, {
    method: 'POST',
    headers,
    body: JSON.stringify(orderData),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(err.message || 'Failed to create order');
  }
  return res.json();
}

export async function updateOrderStatus(orderId, status) {
  const headers = await authHeaders();
  const res = await fetch(`${API_BASE}/orders/${orderId}/status`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ status }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(err.message || 'Failed to update order status');
  }
  return res.json();
}

export async function sendEmailNotification(orderId, type) {
  const headers = await authHeaders();
  const res = await fetch(`${API_BASE}/orders/${orderId}/notify`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ type }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(err.message || 'Failed to send notification');
  }
  return res.json();
}

// Fetch orders directly from Supabase for listing
export async function fetchOrders({ search = '', status = '', page = 1, pageSize = 20 } = {}) {
  let query = supabase
    .from('orders')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1);

  if (status) query = query.eq('status', status);
  if (search) {
    query = query.or(
      `customer_name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`
    );
  }

  const { data, error, count } = await query;
  if (error) throw error;
  return { orders: data ?? [], total: count ?? 0 };
}

export async function fetchOrderById(id) {
  const { data, error } = await supabase.from('orders').select('*').eq('id', id).single();
  if (error) throw error;
  return data;
}
