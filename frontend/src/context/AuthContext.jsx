import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authApi, cartApi, notificationApi } from '../services/api'
import toast from 'react-hot-toast'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('suman_user')
      return saved ? JSON.parse(saved) : null
    } catch { return null }
  })
  const [cartCount, setCartCount] = useState(0)
  const [notifCount, setNotifCount] = useState(0)
  const [loading, setLoading] = useState(false)

  // Only fetch when user is logged in
  useEffect(() => {
    if (user && localStorage.getItem('suman_token')) {
      fetchCartCount()
      fetchNotifCount()
    } else {
      setCartCount(0)
      setNotifCount(0)
    }
  }, [user])

  const fetchCartCount = async () => {
    // Guard: don't call if not logged in
    if (!localStorage.getItem('suman_token')) return
    try {
      const res = await cartApi.get()
      setCartCount(res?.data?.totalItems || 0)
    } catch (e) {
      // Silently ignore 403 - user not logged in
      if (e?.status !== 403 && e?.response?.status !== 403) {
        console.warn('Cart fetch failed:', e?.message)
      }
    }
  }

  const fetchNotifCount = async () => {
    // Guard: don't call if not logged in
    if (!localStorage.getItem('suman_token')) return
    try {
      const res = await notificationApi.getUnreadCount()
      setNotifCount(res?.data || 0)
    } catch (e) {
      if (e?.status !== 403 && e?.response?.status !== 403) {
        console.warn('Notification fetch failed:', e?.message)
      }
    }
  }

  const login = async (email, password) => {
    setLoading(true)
    try {
      const res = await authApi.login({ email, password })
      const userData = res.data
      localStorage.setItem('suman_token', userData.token)
      localStorage.setItem('suman_user', JSON.stringify(userData))
      setUser(userData)
      toast.success(`Welcome back, ${userData.name}! 👋`)
      return userData
    } finally {
      setLoading(false)
    }
  }

  const signup = async (data) => {
    setLoading(true)
    try {
      const res = await authApi.signup(data)
      const userData = res.data
      localStorage.setItem('suman_token', userData.token)
      localStorage.setItem('suman_user', JSON.stringify(userData))
      setUser(userData)
      toast.success(`Welcome to Suman, ${userData.name}! 🌸`)
      return userData
    } finally {
      setLoading(false)
    }
  }

  const logout = useCallback(() => {
    localStorage.removeItem('suman_token')
    localStorage.removeItem('suman_user')
    setUser(null)
    setCartCount(0)
    setNotifCount(0)
    toast.success('Logged out successfully')
  }, [])

  const isAdmin = () => user?.role === 'ADMIN'
  const isLoggedIn = () => !!user && !!localStorage.getItem('suman_token')

  return (
    <AuthContext.Provider value={{
      user, loading, cartCount, notifCount,
      login, signup, logout, isAdmin, isLoggedIn,
      setCartCount, setNotifCount,
      fetchCartCount, fetchNotifCount
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
