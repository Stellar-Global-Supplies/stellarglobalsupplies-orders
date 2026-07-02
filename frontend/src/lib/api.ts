import axios from 'axios'

const API_BASE_URL = import.meta.env.REACT_APP_API_ENDPOINT || 'http://localhost:3001'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use(async (config) => {
  const token = localStorage.getItem('auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const orderAPI = {
  create: (data: any) => api.post('/orders', data),
  getById: (id: string) => api.get(`/orders/${id}`),
  list: () => api.get('/orders'),
  updateStatus: (id: string, status: string) => api.patch(`/orders/${id}/status`, { status }),
  delete: (id: string) => api.delete(`/orders/${id}`),
  generateWhatsAppMessage: (id: string) => api.get(`/orders/${id}/whatsapp-message`),
}

export const skuAPI = {
  list: () => api.get('/skus'),
}

export const materialAPI = {
  list: () => api.get('/materials'),
}

export default api
