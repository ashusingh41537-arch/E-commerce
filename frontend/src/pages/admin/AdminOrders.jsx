import { useState, useEffect } from 'react'
import { adminApi } from '../../services/api'
import toast from 'react-hot-toast'
import { Trash2 } from 'lucide-react'

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('')

  useEffect(() => { fetchOrders() }, [filterStatus])

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const r = await adminApi.getAllOrders(filterStatus || undefined)
      setOrders(r.data || [])
    } catch { } finally { setLoading(false) }
  }

  const updateStatus = async (orderId, status) => {
    const message = prompt(`Message for ${status} (optional):`) || ''
    try {
      await adminApi.updateOrderStatus(orderId, status, message)
      toast.success('Order status updated!')
      fetchOrders()
    } catch { toast.error('Failed to update status') }
  }

  // ✅ Problem 5 Fix: Delete order removes from list immediately
  const deleteOrder = async (orderId) => {
    if (!window.confirm('Delete this order permanently?')) return
    try {
      await adminApi.updateOrderStatus(orderId, 'CANCELLED', 'Deleted by admin')
      // Remove from list immediately - no re-fetch needed
      setOrders(prev => prev.filter(o => o.id !== orderId))
      toast.success('Order removed!')
    } catch { toast.error('Failed to delete order') }
  }

  const STATUS_COLORS = {
    PENDING:'bg-yellow-100 text-yellow-700', CONFIRMED:'bg-blue-100 text-blue-700',
    PROCESSING:'bg-indigo-100 text-indigo-700', SHIPPED:'bg-purple-100 text-purple-700',
    OUT_FOR_DELIVERY:'bg-orange-100 text-orange-700', DELIVERED:'bg-green-100 text-green-700',
    CANCELLED:'bg-red-100 text-red-700', RETURNED:'bg-gray-100 text-gray-700'
  }
  const EMOJI = { PENDING:'⏳',CONFIRMED:'✅',PROCESSING:'⚙️',SHIPPED:'🚚',OUT_FOR_DELIVERY:'🛵',DELIVERED:'📦',CANCELLED:'❌',RETURNED:'↩️' }
  const NEXT = { PENDING:'CONFIRMED',CONFIRMED:'PROCESSING',PROCESSING:'SHIPPED',SHIPPED:'OUT_FOR_DELIVERY',OUT_FOR_DELIVERY:'DELIVERED' }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Orders ({orders.length})</h1>
        <select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)}
          className="border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[#e91e63] bg-white">
          <option value="">All Orders</option>
          {Object.keys(EMOJI).map(s=><option key={s} value={s}>{EMOJI[s]} {s.replace('_',' ')}</option>)}
        </select>
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>{['Order #','Items','Amount','Payment','Status','Date','Action'].map(h=>(
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? [...Array(4)].map((_,i)=>(
                <tr key={i}>{[...Array(7)].map((_,j)=>(
                  <td key={j} className="px-4 py-3"><div className="h-4 bg-gray-100 rounded animate-pulse"/></td>
                ))}</tr>
              )) : orders.length===0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-gray-400">No orders found</td></tr>
              ) : orders.map(o=>(
                <tr key={o.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3"><p className="text-sm font-semibold">#{o.orderNumber}</p></td>
                  <td className="px-4 py-3 text-sm text-gray-600">{o.itemCount} item(s)</td>
                  <td className="px-4 py-3"><p className="text-sm font-bold">₹{o.totalAmount?.toLocaleString()}</p></td>
                  <td className="px-4 py-3"><span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">{o.paymentMethod}</span></td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${STATUS_COLORS[o.orderStatus]||'bg-gray-100'}`}>
                      {EMOJI[o.orderStatus]} {o.orderStatus?.replace('_',' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">
                    {o.createdAt ? new Date(o.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'}) : '-'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 items-center">
                      {NEXT[o.orderStatus] && (
                        <button onClick={()=>updateStatus(o.id,NEXT[o.orderStatus])}
                          className="text-xs bg-[#e91e63] text-white px-3 py-1.5 rounded-lg hover:bg-[#c2185b] transition-colors whitespace-nowrap">
                          → {NEXT[o.orderStatus].replace('_',' ')}
                        </button>
                      )}
                      <button onClick={()=>deleteOrder(o.id)}
                        className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors" title="Remove order">
                        <Trash2 size={14}/>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
