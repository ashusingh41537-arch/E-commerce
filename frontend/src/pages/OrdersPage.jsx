import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { orderApi } from '../services/api'
import { Package, ChevronRight, Clock, CheckCircle, XCircle, Truck } from 'lucide-react'

export default function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    orderApi.getAll()
      .then(r => setOrders(r.data || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const STATUS_CONFIG = {
    PENDING:          { color: 'bg-yellow-100 text-yellow-700', icon: Clock,         label: 'Pending' },
    CONFIRMED:        { color: 'bg-blue-100 text-blue-700',     icon: CheckCircle,   label: 'Confirmed' },
    PROCESSING:       { color: 'bg-indigo-100 text-indigo-700', icon: Package,       label: 'Processing' },
    SHIPPED:          { color: 'bg-purple-100 text-purple-700', icon: Truck,         label: 'Shipped' },
    OUT_FOR_DELIVERY: { color: 'bg-orange-100 text-orange-700', icon: Truck,         label: 'Out for Delivery' },
    DELIVERED:        { color: 'bg-green-100 text-green-700',   icon: CheckCircle,   label: 'Delivered' },
    CANCELLED:        { color: 'bg-red-100 text-red-700',       icon: XCircle,       label: 'Cancelled' },
    RETURNED:         { color: 'bg-gray-100 text-gray-700',     icon: Package,       label: 'Returned' },
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-4 border-[#e91e63] border-t-transparent rounded-full"/>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-pink-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
          <Package className="text-[#e91e63]"/> My Orders
        </h1>

        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-sky-100">
            <Package size={56} className="mx-auto text-gray-200 mb-4"/>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No orders yet</h3>
            <p className="text-gray-400 mb-6">Start shopping to see your orders here</p>
            <Link to="/products" className="inline-block bg-[#e91e63] text-white px-8 py-3 rounded-xl font-semibold hover:bg-[#c2185b] transition-colors">
              Shop Now
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => {
              const cfg = STATUS_CONFIG[order.orderStatus] || STATUS_CONFIG.PENDING
              const Icon = cfg.icon
              // ✅ Problem 3 Fix: Safe price display with fallback
              const price = order.totalAmount != null
                ? `₹${Number(order.totalAmount).toLocaleString()}`
                : 'Price unavailable'

              return (
                <Link key={order.id} to={`/orders/${order.orderNumber}`}
                  className="block bg-white rounded-2xl p-5 shadow-sm border border-sky-100 hover:shadow-md hover:border-pink-200 transition-all group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {/* Product image */}
                      <div className="w-16 h-16 rounded-xl overflow-hidden border border-gray-100 bg-gray-50 shrink-0">
                        {order.firstItemImage ? (
                          <img src={order.firstItemImage} alt="product"
                            className="w-full h-full object-cover"
                            onError={e=>e.target.src='https://placehold.co/64x64/fdf2f8/e91e63?text=📦'}/>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-base">#{order.orderNumber}</p>
                        <p className="text-sm text-gray-500 mt-0.5">
                          {order.itemCount || 0} item{order.itemCount !== 1 ? 's' : ''} •{' '}
                          {order.paymentMethod}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN',{
                            day:'numeric', month:'long', year:'numeric'
                          }) : ''}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {/* ✅ Problem 3 Fix: Price always shown */}
                      <p className="text-xl font-bold text-gray-900">{price}</p>
                      <span className={`flex items-center gap-1 text-xs font-medium px-3 py-1 rounded-full ${cfg.color}`}>
                        <Icon size={12}/> {cfg.label}
                      </span>
                      <ChevronRight size={16} className="text-gray-300 group-hover:text-[#e91e63] transition-colors"/>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
