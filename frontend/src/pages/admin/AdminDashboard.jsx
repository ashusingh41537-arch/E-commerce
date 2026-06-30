import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts'
import { TrendingUp, Users, Package, ShoppingBag, IndianRupee, ArrowUpRight } from 'lucide-react'
import { adminApi } from '../../services/api'

const COLORS = ['#e91e63', '#9c27b0', '#2196f3', '#4caf50', '#ff9800', '#00bcd4']

export default function AdminDashboard() {
  const [dashboard, setDashboard] = useState(null)
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([adminApi.getDashboard(), adminApi.getAnalytics(30)])
      .then(([d, a]) => { setDashboard(d.data); setAnalytics(a.data) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const STAT_CARDS = dashboard ? [
    { label: 'Total Revenue', value: `₹${dashboard.totalRevenue?.toLocaleString() || 0}`, icon: IndianRupee, color: 'text-green-600', bg: 'bg-green-50', sub: `₹${dashboard.todayRevenue?.toLocaleString() || 0} today` },
    { label: 'Total Orders', value: dashboard.totalOrders?.toLocaleString() || 0, icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-50', sub: `${dashboard.pendingOrders} pending` },
    { label: 'Total Users', value: dashboard.totalUsers?.toLocaleString() || 0, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50', sub: 'Registered users' },
    { label: 'Total Products', value: dashboard.totalProducts?.toLocaleString() || 0, icon: Package, color: 'text-orange-600', bg: 'bg-orange-50', sub: 'Active listings' },
  ] : []

  const orderStatusData = dashboard ? [
    { name: 'Pending', value: dashboard.pendingOrders || 0 },
    { name: 'Delivered', value: dashboard.deliveredOrders || 0 },
    { name: 'Other', value: (dashboard.totalOrders || 0) - (dashboard.pendingOrders || 0) - (dashboard.deliveredOrders || 0) },
  ] : []

  if (loading) return (
    <div className="p-8 space-y-4">
      <div className="skeleton h-8 w-48 rounded" />
      <div className="grid grid-cols-4 gap-4">{[...Array(4)].map((_, i) => <div key={i} className="skeleton h-28 rounded-2xl" />)}</div>
      <div className="skeleton h-64 rounded-2xl" />
    </div>
  )

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-0.5">Welcome back, Admin! Here's your store overview.</p>
        </div>
        <Link to="/admin/analytics" className="btn-primary text-sm py-2 flex items-center gap-1">
          <TrendingUp size={16} /> View Analytics
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {STAT_CARDS.map(({ label, value, icon: Icon, color, bg, sub }) => (
          <div key={label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">{label}</p>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
                <p className="text-xs text-gray-400 mt-1">{sub}</p>
              </div>
              <div className={`w-11 h-11 ${bg} rounded-xl flex items-center justify-center shrink-0`}>
                <Icon size={20} className={color} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-4">Revenue (Last 30 Days)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={analytics?.revenueChart || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={v => [`₹${v?.toLocaleString()}`, 'Revenue']} />
              <Bar dataKey="revenue" fill="#e91e63" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Order Status Pie */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-4">Order Status</h3>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={orderStatusData} cx="50%" cy="50%" outerRadius={65} dataKey="value" label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} style={{ fontSize: 10 }}>
                {orderStatusData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1 mt-2">
            {orderStatusData.map((d, i) => (
              <div key={d.name} className="flex items-center gap-2 text-xs text-gray-600">
                <div className="w-3 h-3 rounded-full shrink-0" style={{ background: COLORS[i] }} />
                <span>{d.name}: <strong>{d.value}</strong></span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-4">Top Selling Products</h3>
          <div className="space-y-3">
            {(dashboard?.topSellingProducts || []).slice(0, 5).map((p, i) => (
              <div key={p.id} className="flex items-center gap-3">
                <span className="text-lg font-bold text-gray-200">#{i + 1}</span>
                <img src={p.primaryImage || 'https://via.placeholder.com/40'} alt={p.name}
                  className="w-10 h-10 object-cover rounded-lg shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{p.name}</p>
                  <p className="text-xs text-gray-400">{p.soldCount} sold</p>
                </div>
                <span className="text-sm font-bold text-gray-900">₹{p.price?.toLocaleString()}</span>
              </div>
            ))}
            {!dashboard?.topSellingProducts?.length && <p className="text-sm text-gray-400 text-center py-4">No data available</p>}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-800">Recent Orders</h3>
            <Link to="/admin/orders" className="text-xs text-[#e91e63] hover:underline flex items-center gap-1">
              View all <ArrowUpRight size={12} />
            </Link>
          </div>
          <div className="space-y-3">
            {(dashboard?.recentOrders || []).slice(0, 5).map(order => (
              <div key={order.id} className="flex items-center justify-between py-1.5">
                <div>
                  <p className="text-sm font-medium text-gray-800">#{order.orderNumber}</p>
                  <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString('en-IN')}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">₹{order.totalAmount?.toLocaleString()}</p>
                  <span className={`text-xs badge ${order.orderStatus === 'DELIVERED' ? 'bg-green-100 text-green-700' : order.orderStatus === 'CANCELLED' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {order.orderStatus}
                  </span>
                </div>
              </div>
            ))}
            {!dashboard?.recentOrders?.length && <p className="text-sm text-gray-400 text-center py-4">No recent orders</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
