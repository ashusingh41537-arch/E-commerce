import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { orderApi } from '../services/api'
import { Package, MapPin, Clock, CheckCircle, Truck, XCircle, ArrowLeft, Download } from 'lucide-react'
import toast from 'react-hot-toast'

export default function OrderDetailPage() {
  const { orderNumber } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(false)

  useEffect(() => {
    orderApi.getDetail(orderNumber)
      .then(r => setOrder(r.data))
      .catch(() => toast.error('Order not found'))
      .finally(() => setLoading(false))
  }, [orderNumber])

  const cancelOrder = async () => {
    const reason = prompt('Cancellation reason (optional):') || 'Customer requested cancellation'
    if (!window.confirm('Are you sure you want to cancel this order?')) return
    setCancelling(true)
    try {
      await orderApi.cancel(order.id, reason)
      toast.success('Order cancelled successfully')
      navigate('/orders')
    } catch (e) {
      toast.error(e?.message || 'Cannot cancel this order')
    } finally { setCancelling(false) }
  }

  const downloadInvoice = async () => {
    try {
      const res = await orderApi.downloadInvoice(order.id)
      const url = window.URL.createObjectURL(new Blob([res], { type: 'application/pdf' }))
      const a = document.createElement('a')
      a.href = url
      a.download = `invoice-${order.orderNumber}.pdf`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch { toast.error('Invoice generation failed') }
  }

  const STATUS_CONFIG = {
    PENDING:          { color: 'bg-yellow-100 text-yellow-700', icon: Clock,        label: 'Order Placed',      step: 1 },
    CONFIRMED:        { color: 'bg-blue-100 text-blue-700',     icon: CheckCircle,  label: 'Confirmed',         step: 2 },
    PROCESSING:       { color: 'bg-indigo-100 text-indigo-700', icon: Package,      label: 'Processing',        step: 3 },
    SHIPPED:          { color: 'bg-purple-100 text-purple-700', icon: Truck,        label: 'Shipped',           step: 4 },
    OUT_FOR_DELIVERY: { color: 'bg-orange-100 text-orange-700', icon: Truck,        label: 'Out for Delivery',  step: 5 },
    DELIVERED:        { color: 'bg-green-100 text-green-700',   icon: CheckCircle,  label: 'Delivered',         step: 6 },
    CANCELLED:        { color: 'bg-red-100 text-red-700',       icon: XCircle,      label: 'Cancelled',         step: 0 },
    RETURNED:         { color: 'bg-gray-100 text-gray-700',     icon: Package,      label: 'Returned',          step: 0 },
  }

  const TRACKING_STEPS = [
    { key: 'PENDING',          label: 'Order Placed',      icon: Clock },
    { key: 'CONFIRMED',        label: 'Confirmed',          icon: CheckCircle },
    { key: 'PROCESSING',       label: 'Processing',         icon: Package },
    { key: 'SHIPPED',          label: 'Shipped',            icon: Truck },
    { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery',   icon: Truck },
    { key: 'DELIVERED',        label: 'Delivered',          icon: CheckCircle },
  ]

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin w-10 h-10 border-4 border-[#e91e63] border-t-transparent rounded-full"/>
    </div>
  )

  if (!order) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-500 text-xl mb-4">Order not found</p>
        <Link to="/orders" className="text-[#e91e63] underline">Back to Orders</Link>
      </div>
    </div>
  )

  const cfg = STATUS_CONFIG[order.orderStatus] || STATUS_CONFIG.PENDING
  const StatusIcon = cfg.icon
  const isCancellable = ['PENDING', 'CONFIRMED'].includes(order.orderStatus)

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-pink-50">
      <div className="max-w-4xl mx-auto px-4 py-8">

        {/* Back button */}
        <button onClick={() => navigate('/orders')}
          className="flex items-center gap-2 text-gray-500 hover:text-[#e91e63] mb-6 transition-colors">
          <ArrowLeft size={18}/> Back to Orders
        </button>

        {/* Header */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-sky-100 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Order #{order.orderNumber}</h1>
              <p className="text-sm text-gray-500 mt-1">
                Placed on {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN',{
                  day:'numeric', month:'long', year:'numeric'
                }) : '-'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${cfg.color}`}>
                <StatusIcon size={16}/> {cfg.label}
              </span>
              {order.orderStatus === 'DELIVERED' && (
                <button onClick={downloadInvoice}
                  className="flex items-center gap-2 bg-sky-50 text-sky-600 border border-sky-200 px-4 py-2 rounded-xl text-sm font-medium hover:bg-sky-100 transition-colors">
                  <Download size={14}/> Invoice
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Order Tracking Progress */}
        {!['CANCELLED','RETURNED'].includes(order.orderStatus) && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-sky-100 mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Order Tracking</h2>
            <div className="relative">
              {/* Progress line */}
              <div className="absolute top-5 left-5 right-5 h-0.5 bg-gray-100 z-0"/>
              <div className="absolute top-5 left-5 h-0.5 bg-gradient-to-r from-[#e91e63] to-sky-400 z-0 transition-all duration-500"
                style={{ width: `${Math.max(0, ((cfg.step - 1) / 5) * 100)}%` }}/>

              <div className="relative z-10 flex justify-between">
                {TRACKING_STEPS.map((step, idx) => {
                  const stepNum = idx + 1
                  const isCompleted = cfg.step >= stepNum
                  const isCurrent = cfg.step === stepNum
                  const StepIcon = step.icon
                  return (
                    <div key={step.key} className="flex flex-col items-center gap-2">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                        isCompleted
                          ? 'bg-gradient-to-br from-[#e91e63] to-[#f06292] border-[#e91e63] text-white shadow-md'
                          : isCurrent
                          ? 'bg-sky-500 border-sky-500 text-white'
                          : 'bg-white border-gray-200 text-gray-300'
                      }`}>
                        <StepIcon size={16}/>
                      </div>
                      <span className={`text-xs font-medium text-center max-w-[60px] leading-tight ${
                        isCompleted ? 'text-[#e91e63]' : isCurrent ? 'text-sky-500' : 'text-gray-400'
                      }`}>{step.label}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {order.estimatedDelivery && (
              <p className="text-sm text-gray-500 mt-6 text-center">
                Estimated delivery: <span className="font-semibold text-gray-700">{order.estimatedDelivery}</span>
              </p>
            )}
            {order.trackingNumber && (
              <p className="text-sm text-gray-500 mt-1 text-center">
                Tracking: <span className="font-mono font-semibold text-sky-600">{order.trackingNumber}</span>
              </p>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

          {/* Order Items */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-sky-100">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Package size={18} className="text-[#e91e63]"/> Items Ordered
            </h2>
            <div className="space-y-4">
              {order.items?.map(item => (
                <div key={item.id} className="flex items-center gap-3">
                  <img
                    src={item.productImage || 'https://placehold.co/56x56/fdf2f8/e91e63?text=P'}
                    alt={item.productName}
                    className="w-14 h-14 object-cover rounded-xl border border-gray-100"
                    onError={e => e.target.src = 'https://placehold.co/56x56/fdf2f8/e91e63?text=P'}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{item.productName}</p>
                    <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                    <p className="text-xs text-gray-500">₹{Number(item.price||0).toLocaleString()} each</p>
                  </div>
                  <p className="text-sm font-bold text-gray-900">
                    ₹{Number(item.total || (item.price * item.quantity) || 0).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Address */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-sky-100">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin size={18} className="text-[#e91e63]"/> Delivery Address
            </h2>
            {order.address ? (
              <div className="text-sm text-gray-600 space-y-1">
                <p className="font-bold text-gray-800 text-base">{order.address.name}</p>
                <p>{order.address.phone}</p>
                <p>{order.address.addressLine1}</p>
                {order.address.addressLine2 && <p>{order.address.addressLine2}</p>}
                <p>{order.address.city}, {order.address.state} - {order.address.pincode}</p>
                <p>{order.address.country || 'India'}</p>
              </div>
            ) : (
              <p className="text-gray-400 text-sm">Address not available</p>
            )}
          </div>
        </div>

        {/* Price Summary */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-sky-100 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Price Details</h2>
          <div className="space-y-3">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Subtotal</span>
              <span>₹{Number(order.subtotal||0).toLocaleString()}</span>
            </div>
            {order.discountAmount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Discount</span>
                <span>-₹{Number(order.discountAmount).toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between text-sm text-gray-600">
              <span>Shipping</span>
              <span className={order.shippingCharge === 0 ? 'text-green-600 font-medium' : ''}>
                {order.shippingCharge === 0 ? 'FREE' : `₹${order.shippingCharge}`}
              </span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>GST (5%)</span>
              <span>₹{Number(order.taxAmount||0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between font-bold text-gray-900 text-base border-t border-gray-100 pt-3">
              <span>Total Paid</span>
              <span className="text-[#e91e63]">₹{Number(order.totalAmount||0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-500">
              <span>Payment Method</span>
              <span className="font-medium">{order.paymentMethod} • {order.paymentStatus}</span>
            </div>
          </div>
        </div>

        {/* Tracking History */}
        {order.trackingHistory?.length > 0 && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-sky-100 mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Tracking History</h2>
            <div className="space-y-4">
              {order.trackingHistory.map((t, i) => (
                <div key={i} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 rounded-full bg-gradient-to-br from-[#e91e63] to-sky-400 mt-1"/>
                    {i < order.trackingHistory.length - 1 && <div className="w-0.5 h-full bg-gray-100 mt-1"/>}
                  </div>
                  <div className="pb-4">
                    <p className="text-sm font-semibold text-gray-800">{t.status?.replace('_',' ')}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{t.message}</p>
                    {t.location && <p className="text-xs text-sky-500 mt-0.5">📍 {t.location}</p>}
                    <p className="text-xs text-gray-400 mt-1">
                      {t.createdAt ? new Date(t.createdAt).toLocaleString('en-IN') : ''}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-3">
          {isCancellable && (
            <button onClick={cancelOrder} disabled={cancelling}
              className="flex items-center gap-2 bg-red-50 text-red-500 border border-red-200 px-6 py-3 rounded-xl font-semibold hover:bg-red-100 transition-colors disabled:opacity-60">
              <XCircle size={16}/>
              {cancelling ? 'Cancelling...' : 'Cancel Order'}
            </button>
          )}
          <Link to="/products"
            className="flex items-center gap-2 bg-gradient-to-r from-[#e91e63] to-[#f06292] text-white px-6 py-3 rounded-xl font-semibold hover:from-[#c2185b] transition-all shadow-md">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  )
}
