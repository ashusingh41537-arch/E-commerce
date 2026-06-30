import axios from 'axios'
import toast from 'react-hot-toast'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('suman_token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  },
  (error) => Promise.reject(error)
)

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const status = error.response?.status
    const message = error.response?.data?.message || 'Something went wrong'

    if (status === 401) {
      localStorage.removeItem('suman_token')
      localStorage.removeItem('suman_user')
      window.location.href = '/login'
      toast.error('Session expired. Please login again.')
    } else if (status === 403) {
      // Silent - user not logged in or no permission
      // Don't show toast for 403
    } else if (status !== 404) {
      toast.error(message)
    }
    return Promise.reject(error.response?.data || error)
  }
)

export const authApi = {
  signup: (data) => api.post('/auth/signup', data),
  login: (data) => api.post('/auth/login', data),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  verifyOtp: (data) => api.post('/auth/verify-otp', data),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  googleLogin: (token) => api.post('/auth/google', { token }),
}

export const productApi = {
  getAll: (params) => api.get('/products', { params }),
  getBySlug: (slug) => api.get(`/products/${slug}`),
  getFeatured: () => api.get('/products/featured'),
  getTrending: () => api.get('/products/trending'),
  getRelated: (id) => api.get(`/products/${id}/related`),
  getRecommendations: (userId) => api.get('/products/recommendations', { params: { userId } }),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
  uploadImages: (id, formData) => api.post(`/products/${id}/images`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
}

export const categoryApi = {
  getAll: () => api.get('/categories'),
}

export const cartApi = {
  get: () => api.get('/cart'),
  add: (data) => api.post('/cart/add', data),
  update: (itemId, quantity) => api.put(`/cart/update/${itemId}`, { quantity }),
  remove: (itemId) => api.delete(`/cart/remove/${itemId}`),
  clear: () => api.delete('/cart/clear'),
}

export const wishlistApi = {
  get: () => api.get('/wishlist'),
  add: (productId) => api.post(`/wishlist/add/${productId}`),
  remove: (productId) => api.delete(`/wishlist/remove/${productId}`),
  moveToCart: (productId) => api.post(`/wishlist/move-to-cart/${productId}`),
}

export const orderApi = {
  place: (data) => api.post('/orders/place', data),
  getAll: () => api.get('/orders'),
  getDetail: (orderNumber) => api.get(`/orders/${orderNumber}`),
  cancel: (id, reason) => api.post(`/orders/${id}/cancel`, { reason }),
  return: (id, reason) => api.post(`/orders/${id}/return`, { reason }),
  downloadInvoice: (id) => api.get(`/orders/${id}/invoice`, { responseType: 'blob' }),
}

export const reviewApi = {
  getByProduct: (productId) => api.get(`/reviews/product/${productId}`),
  add: (data) => api.post('/reviews', data),
  markHelpful: (reviewId) => api.put(`/reviews/${reviewId}/helpful`),
}

export const searchApi = {
  search: (params) => api.get('/search', { params }),
  suggestions: (q) => api.get('/search/suggestions', { params: { q } }),
  trending: () => api.get('/search/trending'),
}

export const paymentApi = {
  createOrder: (orderId) => api.post('/payments/create-order', { orderId }),
  verify: (data) => api.post('/payments/verify', data),
}

export const couponApi = {
  validate: (code, amount) => api.post('/coupons/validate', { code, amount }),
}

export const notificationApi = {
  getAll: () => api.get('/notifications'),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markRead: (id) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
}

export const userApi = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  getAddresses: () => api.get('/users/addresses'),
  addAddress: (data) => api.post('/users/addresses', data),
  getRecentlyViewed: () => api.get('/users/recently-viewed'),
}

export const adminApi = {
  getDashboard: () => api.get('/admin/dashboard'),
  getAnalytics: (days) => api.get('/admin/analytics', { params: { days } }),
  getAllOrders: (status) => api.get('/admin/orders', { params: { status } }),
  updateOrderStatus: (orderId, status, message) =>
    api.put(`/admin/orders/${orderId}/status`, { status, message }),
  getAllUsers: () => api.get('/admin/users'),
  toggleUserStatus: (userId) => api.put(`/admin/users/${userId}/status`),
  getAllProducts: () => api.get('/admin/products'),
  getRevenue: (type) => api.get('/admin/revenue', { params: { type } }),
  createCoupon: (data) => api.post('/admin/coupons', data),
}

export default api
