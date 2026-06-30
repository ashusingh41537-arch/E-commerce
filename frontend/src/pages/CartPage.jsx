import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Tag, Heart, MoveRight } from 'lucide-react'
import { cartApi, wishlistApi, couponApi } from '../services/api'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

// ======================== CART PAGE ========================
export function CartPage() {
  const [cart, setCart] = useState(null)
  const [loading, setLoading] = useState(true)
  const [couponCode, setCouponCode] = useState('')
  const [coupon, setCoupon] = useState(null)
  const [applyingCoupon, setApplyingCoupon] = useState(false)
  const { isLoggedIn, fetchCartCount } = useAuth()
  const navigate = useNavigate()

  useEffect(() => { 
  if (isLoggedIn()) { fetchCart() } 
  else { setLoading(false) } 
}, [])

  const fetchCart = async () => {
    setLoading(true)
    try {
      const res = await cartApi.get()
      setCart(res.data)
    } catch { } finally { setLoading(false) }
  }

  const updateQuantity = async (itemId, qty) => {
    if (qty < 1) return removeItem(itemId)
    try {
      const res = await cartApi.update(itemId, qty)
      setCart(res.data)
      await fetchCartCount()
    } catch { }
  }

  const removeItem = async (itemId) => {
    try {
      const res = await cartApi.remove(itemId)
      setCart(res.data)
      await fetchCartCount()
      toast.success('Item removed from cart')
    } catch { }
  }

  const applyCoupon = async () => {
    if (!couponCode.trim()) return
    setApplyingCoupon(true)
    try {
      const res = await couponApi.validate(couponCode, cart?.subtotal || 0)
      setCoupon(res.data)
      toast.success(`Coupon applied! You saved ₹${res.data.discountAmount}`)
    } catch { } finally { setApplyingCoupon(false) }
  }

  const subtotal = cart?.subtotal || 0
  const discountAmount = coupon?.discountAmount || 0
  const shipping = subtotal - discountAmount >= 499 ? 0 : 49
  const gst = ((subtotal - discountAmount + shipping) * 0.05).toFixed(2)
  const total = (subtotal - discountAmount + shipping + parseFloat(gst)).toFixed(2)

  if (!isLoggedIn()) return (
    <div className="max-w-xl mx-auto px-4 py-24 text-center">
      <ShoppingBag size={56} className="mx-auto mb-4 text-gray-200" />
      <h2 className="text-2xl font-display font-bold mb-2">Your Cart</h2>
      <p className="text-gray-500 mb-6">Please login to view your cart</p>
      <Link to="/login" className="btn-primary">Login to Continue</Link>
    </div>
  )

  if (loading) return <div className="max-w-7xl mx-auto px-4 py-8"><div className="skeleton h-96 rounded-2xl" /></div>

  if (!cart?.items?.length) return (
    <div className="max-w-xl mx-auto px-4 py-24 text-center">
      <ShoppingBag size={56} className="mx-auto mb-4 text-gray-200" />
      <h2 className="text-2xl font-display font-bold mb-2">Your cart is empty</h2>
      <p className="text-gray-500 mb-6">Add some beautiful products to get started!</p>
      <Link to="/products" className="btn-primary">Start Shopping</Link>
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-display font-bold mb-6">Shopping Cart ({cart.totalItems} items)</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map(item => (
            <div key={item.id} className="card p-4 flex gap-4">
              <img src={item.productImage || 'https://via.placeholder.com/80'} alt={item.productName}
                className="w-20 h-20 object-cover rounded-xl shrink-0" />
              <div className="flex-1 min-w-0">
                <Link to={`/products/${item.productSlug}`} className="font-semibold text-gray-800 hover:text-[#e91e63] transition-colors line-clamp-2 text-sm">
                  {item.productName}
                </Link>
                {item.variant && (
                  <p className="text-xs text-gray-400 mt-0.5">{item.variant.shade || item.variant.color || item.variant.size}</p>
                )}
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-8 h-8 flex items-center justify-center hover:bg-gray-50">
                      <Minus size={14} />
                    </button>
                    <span className="w-10 text-center text-sm font-semibold">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-8 h-8 flex items-center justify-center hover:bg-gray-50">
                      <Plus size={14} />
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-gray-900">₹{item.total?.toLocaleString()}</span>
                    <button onClick={() => removeItem(item.id)} className="text-gray-300 hover:text-red-400 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="space-y-4">
          {/* Coupon */}
          <div className="card p-4">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Tag size={16} className="text-[#e91e63]" /> Apply Coupon
            </h3>
            <div className="flex gap-2">
              <input value={couponCode} onChange={e => setCouponCode(e.target.value.toUpperCase())}
                placeholder="Enter coupon code"
                className="flex-1 input-field py-2" />
              <button onClick={applyCoupon} disabled={applyingCoupon}
                className="btn-primary py-2 px-4 text-sm shrink-0">
                {applyingCoupon ? '...' : 'Apply'}
              </button>
            </div>
            {coupon && (
              <div className="mt-2 bg-green-50 text-green-700 text-xs px-3 py-2 rounded-lg flex justify-between">
                <span>✓ {coupon.code} applied</span>
                <button onClick={() => setCoupon(null)} className="text-red-400">✕</button>
              </div>
            )}
            <div className="mt-3 space-y-1">
              {['WELCOME10', 'SUMAN20', 'FLAT200'].map(c => (
                <button key={c} onClick={() => { setCouponCode(c) }}
                  className="text-xs text-[#e91e63] hover:underline block">{c}</button>
              ))}
            </div>
          </div>

          {/* Bill */}
          <div className="card p-5">
            <h3 className="font-semibold text-gray-800 mb-4">Order Summary</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal ({cart.totalItems} items)</span><span>₹{subtotal.toLocaleString()}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Coupon Discount</span><span>-₹{discountAmount}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span className={shipping === 0 ? 'text-green-600' : ''}>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>GST (5%)</span><span>₹{gst}</span>
              </div>
              {cart.savings > 0 && (
                <div className="flex justify-between text-green-600 font-medium">
                  <span>Total Savings</span><span>-₹{cart.savings.toLocaleString()}</span>
                </div>
              )}
              <div className="border-t pt-3 flex justify-between font-bold text-base text-gray-900">
                <span>Total</span><span>₹{Number(total).toLocaleString()}</span>
              </div>
            </div>
            <button onClick={() => navigate('/checkout', { state: { coupon, total: Number(total), subtotal, discount: discountAmount, shipping, gst: parseFloat(gst) } })}
              className="btn-primary w-full mt-4 flex items-center justify-center gap-2">
              Proceed to Checkout <ArrowRight size={18} />
            </button>
            
            <Link to="/products" className="block text-center text-sm text-gray-500 mt-3 hover:text-[#e91e63]">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

// ======================== WISHLIST PAGE ========================
export function WishlistPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const { fetchCartCount } = useAuth()

  useEffect(() => { fetchWishlist() }, [])

  const fetchWishlist = async () => {
    setLoading(true)
    try {
      const res = await wishlistApi.get()
      setItems(res.data || [])
    } catch { } finally { setLoading(false) }
  }

  const remove = async (productId) => {
    try {
      await wishlistApi.remove(productId)
      setItems(prev => prev.filter(p => p.id !== productId))
      toast.success('Removed from wishlist')
    } catch { }
  }

  const moveToCart = async (productId) => {
    try {
      await wishlistApi.moveToCart(productId)
      await fetchCartCount()
      setItems(prev => prev.filter(p => p.id !== productId))
      toast.success('Moved to cart! 🛒')
    } catch { }
  }

  if (loading) return <div className="max-w-7xl mx-auto px-4 py-8"><div className="skeleton h-96 rounded-2xl" /></div>

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-display font-bold mb-6">My Wishlist ({items.length})</h1>
      {items.length === 0 ? (
        <div className="text-center py-24">
          <Heart size={56} className="mx-auto mb-4 text-gray-200" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Your wishlist is empty</h3>
          <p className="text-gray-500 mb-6">Save your favorite products here</p>
          <Link to="/products" className="btn-primary">Discover Products</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map(product => (
            <div key={product.id} className="product-card group relative">
              <button onClick={() => remove(product.id)}
                className="absolute top-2 right-2 z-10 w-8 h-8 bg-white rounded-full shadow flex items-center justify-center text-gray-400 hover:text-red-400 transition-colors">
                <Trash2 size={14} />
              </button>
              <Link to={`/products/${product.slug}`}>
                <img src={product.primaryImage || 'https://via.placeholder.com/300'} alt={product.name}
                  className="w-full aspect-square object-cover" />
                <div className="p-3">
                  <p className="text-xs text-gray-400 mb-0.5">{product.brandName}</p>
                  <p className="text-sm font-semibold text-gray-800 line-clamp-2 mb-2">{product.name}</p>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="font-bold text-gray-900">₹{product.price?.toLocaleString()}</span>
                    {product.comparePrice > product.price && (
                      <span className="text-xs text-gray-400 line-through">₹{product.comparePrice?.toLocaleString()}</span>
                    )}
                  </div>
                </div>
              </Link>
              <button onClick={() => moveToCart(product.id)}
                className="w-full bg-[#e91e63] hover:bg-[#c2185b] text-white py-2.5 text-sm font-semibold flex items-center justify-center gap-2 transition-colors">
                <ShoppingBag size={14} /> Move to Cart
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default CartPage
