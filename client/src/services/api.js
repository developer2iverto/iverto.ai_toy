import axios from 'axios'

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export const api = axios.create({ baseURL })

// Attach JWT token if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export const fetchProducts = async (params = {}) => {
  const { data } = await api.get('/products', { params })
  return data
}

export const fetchProductById = async (id) => {
  const { data } = await api.get(`/products/${id}`)
  return data
}

// Auth
export const register = async (payload) => {
  const { data } = await api.post('/auth/register', payload)
  return data
}
export const login = async (payload) => {
  const { data } = await api.post('/auth/login', payload)
  return data
}
export const me = async () => {
  const { data } = await api.get('/auth/me')
  return data
}

// Cart
export const getCart = async () => {
  const { data } = await api.get('/cart')
  return data
}
export const addToCart = async ({ productId, quantity = 1 }) => {
  const { data } = await api.post('/cart/add', { productId, quantity })
  return data
}
export const updateCartItem = async ({ productId, quantity }) => {
  const { data } = await api.put('/cart/update', { productId, quantity })
  return data
}
export const removeFromCart = async ({ productId }) => {
  const { data } = await api.delete('/cart/remove', { data: { productId } })
  return data
}

// Orders
export const createOrder = async (payload) => {
  const { data } = await api.post('/orders', payload)
  return data
}
export const myOrders = async () => {
  const { data } = await api.get('/orders/my-orders')
  return data
}

// Admin: Products
export const createProduct = async (payload) => {
  const { data } = await api.post('/products', payload)
  return data
}
export const updateProduct = async (id, payload) => {
  const { data } = await api.put(`/products/${id}`, payload)
  return data
}
export const deleteProduct = async (id) => {
  const { data } = await api.delete(`/products/${id}`)
  return data
}

// Admin: Upload images
export const uploadImages = async (files) => {
  const form = new FormData()
  ;[...files].forEach(f => form.append('images', f))
  const { data } = await api.post('/upload', form, { headers: { 'Content-Type': 'multipart/form-data' } })
  return data
}

// Admin: Orders
export const listAllOrders = async () => {
  const { data } = await api.get('/orders')
  return data
}
export const updateOrderStatus = async (id, orderStatus) => {
  const { data } = await api.put(`/orders/${id}/status`, { orderStatus })
  return data
}

// Admin: Users (superadmin only)
export const fetchUsers = async () => {
  const { data } = await api.get('/users')
  return data
}
export const updateUserRole = async (id, role) => {
  const { data } = await api.put(`/users/${id}/role`, { role })
  return data
}
export const deleteUser = async (id) => {
  const { data } = await api.delete(`/users/${id}`)
  return data
}

// Payments (Razorpay)
export const createPaymentOrder = async (payload) => {
  const { data } = await api.post('/payments/create', payload)
  return data
}

export const verifyPayment = async (payload) => {
  const { data } = await api.post('/payments/verify', payload)
  return data
}

// Public: Offers
export const fetchOffers = async () => {
  const { data } = await api.get('/offers')
  return data
}

// Contact
export const sendContactMessage = async (payload) => {
  const { data } = await api.post('/contact', payload)
  return data
}

// Settings
export const getPublicSettings = async () => {
  const { data } = await api.get('/settings/public')
  return data
}
export const getAdminSettings = async () => {
  const { data } = await api.get('/settings')
  return data
}
export const updateSettings = async (payload) => {
  const { data } = await api.put('/settings', payload)
  return data
}