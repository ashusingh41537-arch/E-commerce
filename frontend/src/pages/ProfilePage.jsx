import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { User, Package, MapPin, Bell, Edit2, Home } from 'lucide-react'
import { userApi, notificationApi } from '../services/api'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export function ProfilePage() {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [addresses, setAddresses] = useState([])
  const [notifications, setNotifications] = useState([])
  const [recentlyViewed, setRecentlyViewed] = useState([])
  const [activeTab, setActiveTab] = useState('profile')
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ name: '', phone: '' })
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchAll() }, [])

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [profRes, addrRes, notifRes, viewedRes] = await Promise.all([
        userApi.getProfile(), userApi.getAddresses(),
        notificationApi.getAll(), userApi.getRecentlyViewed()
      ])
      setProfile(profRes.data)
      setForm({ name: profRes.data?.name || '', phone: profRes.data?.phone || '' })
      setAddresses(addrRes.data || [])
      setNotifications(notifRes.data || [])
      setRecentlyViewed(viewedRes.data || [])
    } catch { } finally { setLoading(false) }
  }

  const saveProfile = async () => {
    try { await userApi.updateProfile(form); toast.success('Profile updated!'); setEditing(false); fetchAll() } catch { }
  }

  const markAllRead = async () => {
    try { await notificationApi.markAllRead(); fetchAll() } catch { }
  }

  const TABS = [
    { key: 'profile', label: 'Profile', icon: User },
    { key: 'addresses', label: 'Addresses', icon: MapPin },
    { key: 'notifications', label: 'Notifications', icon: Bell },
    { key: 'recently_viewed', label: 'Recently Viewed', icon: Package },
  ]

  if (loading) return <div className="max-w-3xl mx-auto px-4 py-8"><div className="skeleton h-96 rounded-2xl" /></div>

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="card p-6 mb-6 flex items-center gap-4">
        <div className="w-16 h-16 bg-[#e91e63] rounded-full flex items-center justify-center text-white font-display font-bold text-2xl shrink-0">
          {profile?.name?.[0]?.toUpperCase() || 'U'}
        </div>
        <div>
          <h1 className="text-xl font-display font-bold text-gray-900">{profile?.name}</h1>
          <p className="text-gray-500 text-sm">{profile?.email}</p>
          <span className="badge bg-pink-100 text-[#e91e63] mt-1">{profile?.role}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-2xl p-1 mb-6">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setActiveTab(key)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold rounded-xl transition-all ${activeTab === key ? 'bg-white text-[#e91e63] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            <Icon size={14} /><span className="hidden sm:block">{label}</span>
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="card p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-gray-800">Personal Information</h2>
            <button onClick={() => setEditing(!editing)} className="btn-outline text-sm py-1.5 flex items-center gap-1">
              <Edit2 size={14} /> {editing ? 'Cancel' : 'Edit'}
            </button>
          </div>
          {editing ? (
            <div className="space-y-3">
              <input placeholder="Full Name" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="input-field" />
              <input placeholder="Phone" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} className="input-field" />
              <button onClick={saveProfile} className="btn-primary">Save Changes</button>
            </div>
          ) : (
            <div className="space-y-3">
              {[['Name', profile?.name], ['Email', profile?.email], ['Phone', profile?.phone || 'Not added']].map(([label, val]) => (
                <div key={label} className="flex justify-between py-2 border-b border-gray-100 last:border-0">
                  <span className="text-sm text-gray-500">{label}</span>
                  <span className="text-sm font-medium text-gray-800">{val}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Addresses Tab */}
      {activeTab === 'addresses' && (
        <div className="space-y-3">
          {addresses.length === 0 ? (
            <div className="card p-8 text-center text-gray-500">
              <MapPin size={36} className="mx-auto mb-3 text-gray-200" />
              <p>No addresses saved yet</p>
            </div>
          ) : addresses.map(addr => (
            <div key={addr.id} className="card p-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-gray-800">{addr.name} <span className="text-xs bg-gray-100 px-2 py-0.5 rounded ml-1">{addr.addressType}</span>
                    {addr.isDefault && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded ml-1">Default</span>}
                  </p>
                  <p className="text-sm text-gray-600 mt-0.5">{addr.phone}</p>
                  <p className="text-sm text-gray-600">{addr.addressLine1}, {addr.city} - {addr.pincode}</p>
                  <p className="text-sm text-gray-600">{addr.state}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-gray-500">{notifications.length} notifications</p>
            <button onClick={markAllRead} className="text-xs text-[#e91e63] hover:underline">Mark all as read</button>
          </div>
          <div className="space-y-2">
            {notifications.length === 0 ? (
              <div className="card p-8 text-center text-gray-500">
                <Bell size={36} className="mx-auto mb-3 text-gray-200" />
                <p>No notifications</p>
              </div>
            ) : notifications.map(n => (
              <div key={n.id} className={`card p-4 ${!n.isRead ? 'bg-pink-50 border-pink-100' : ''}`}>
                <div className="flex justify-between">
                  <p className={`text-sm font-semibold ${!n.isRead ? 'text-[#e91e63]' : 'text-gray-800'}`}>{n.title}</p>
                  <span className="text-xs text-gray-400">{new Date(n.createdAt).toLocaleDateString('en-IN')}</span>
                </div>
                <p className="text-sm text-gray-600 mt-0.5">{n.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recently Viewed Tab */}
      {activeTab === 'recently_viewed' && (
        <div>
          {recentlyViewed.length === 0 ? (
            <div className="card p-8 text-center text-gray-500">
              <Package size={36} className="mx-auto mb-3 text-gray-200" />
              <p>No recently viewed products</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {recentlyViewed.map(product => (
                <Link key={product.id} to={`/products/${product.slug}`} className="card overflow-hidden hover:shadow-md transition-shadow">
                  <img src={product.primaryImage || 'https://via.placeholder.com/200'} alt={product.name}
                    className="w-full aspect-square object-cover" />
                  <div className="p-3">
                    <p className="text-sm font-semibold text-gray-800 line-clamp-1">{product.name}</p>
                    <p className="text-sm font-bold text-gray-900">₹{product.price?.toLocaleString()}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <div className="text-8xl mb-4">🔍</div>
      <h1 className="font-display text-4xl font-bold text-gray-900 mb-2">Page Not Found</h1>
      <p className="text-gray-500 mb-8">The page you're looking for doesn't exist.</p>
      <Link to="/" className="btn-primary inline-flex items-center gap-2">
        <Home size={18} /> Go Home
      </Link>
    </div>
  )
}

export default ProfilePage
