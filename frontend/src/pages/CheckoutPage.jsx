import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { orderApi, cartApi, userApi, couponApi, paymentApi } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { MapPin, Plus, Navigation, Tag, CreditCard, Truck, CheckCircle, Wallet, Smartphone } from 'lucide-react'
import toast from 'react-hot-toast'

// Load Razorpay script dynamically
const loadRazorpay = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) { resolve(true); return }
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

export default function CheckoutPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [cart, setCart] = useState(null)
  const [addresses, setAddresses] = useState([])
  const [selectedAddress, setSelectedAddress] = useState(null)
  const [paymentMethod, setPaymentMethod] = useState('COD')
  const [couponCode, setCouponCode] = useState('')
  const [couponDiscount, setCouponDiscount] = useState(0)
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(true)
  const [placing, setPlacing] = useState(false)
  const [fetchingLocation, setFetchingLocation] = useState(false)
  const [showAddAddress, setShowAddAddress] = useState(false)
  const [newAddress, setNewAddress] = useState({
    name: user?.name || '', phone: '', addressLine1: '', addressLine2: '',
    city: '', state: '', pincode: '', country: 'India', addressType: 'HOME', isDefault: false
  })

  useEffect(() => {
    Promise.all([
      cartApi.get().then(r => setCart(r.data)),
      userApi.getAddresses().then(r => {
        const addrs = r.data || []
        setAddresses(addrs)
        const def = addrs.find(a => a.isDefault) || addrs[0]
        if (def) setSelectedAddress(def.id)
      })
    ]).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const fetchCurrentLocation = () => {
    if (!navigator.geolocation) { toast.error('Geolocation not supported'); return }
    setFetchingLocation(true)
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`)
          const data = await res.json()
          const a = data.address
          setNewAddress(prev => ({
            ...prev,
            addressLine1: `${a.road || a.neighbourhood || ''} ${a.suburb || ''}`.trim(),
            city: a.city || a.town || a.village || '',
            state: a.state || '',
            pincode: a.postcode || '',
            country: 'India'
          }))
          setShowAddAddress(true)
          toast.success('📍 Location fetched! Please add your name and phone.')
        } catch { toast.error('Could not get address from location') }
        finally { setFetchingLocation(false) }
      },
      () => { setFetchingLocation(false); toast.error('Location access denied') },
      { timeout: 10000 }
    )
  }

  const validateCoupon = async () => {
    if (!couponCode.trim()) return
    try {
      const res = await couponApi.validate(couponCode, cart?.subtotal || 0)
      setCouponDiscount(res.data?.discountAmount || 0)
      toast.success(`Coupon applied! ₹${res.data?.discountAmount} off`)
    } catch { toast.error('Invalid or expired coupon'); setCouponDiscount(0) }
  }

  const saveAddress = async () => {
    if (!newAddress.name || !newAddress.phone || !newAddress.addressLine1
        || !newAddress.city || !newAddress.state || !newAddress.pincode) {
      toast.error('Please fill all required fields'); return
    }
    try {
      const res = await userApi.addAddress(newAddress)
      const saved = res.data
      setAddresses(prev => [...prev, saved])
      setSelectedAddress(saved.id)
      setShowAddAddress(false)
      toast.success('Address saved!')
    } catch { toast.error('Failed to save address') }
  }

  // ✅ Fix 3: Online payment with Razorpay
  const handleOnlinePayment = async (orderId, amount) => {
    const loaded = await loadRazorpay()
    if (!loaded) {
      toast.error('Payment gateway failed to load. Please try COD.')
      return false
    }

    return new Promise((resolve) => {
      const options = {
        key: 'rzp_test_dummy', // Replace with real key from application.properties
        amount: Math.round(amount * 100), // Razorpay takes paise
        currency: 'INR',
        name: 'Suman Beauty & Fashion',
        description: `Order Payment`,
        image: 'https://via.placeholder.com/100x100/e91e63/white?text=S',
        handler: async (response) => {
          try {
            await paymentApi.verify({
              orderId,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            })
            toast.success('Payment successful! 🎉')
            resolve(true)
          } catch {
            toast.error('Payment verification failed')
            resolve(false)
          }
        },
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
        },
        theme: { color: '#e91e63' },
        modal: {
          ondismiss: () => {
            toast.error('Payment cancelled')
            resolve(false)
          }
        }
      }
      const rzp = new window.Razorpay(options)
      rzp.open()
    })
  }

  const placeOrder = async () => {
    if (!selectedAddress) { toast.error('Please select a delivery address'); return }
    if (!cart?.items?.length) { toast.error('Your cart is empty'); return }
    setPlacing(true)
    try {
      const orderRes = await orderApi.place({
        addressId: selectedAddress,
        paymentMethod,
        couponCode: couponCode || null,
        notes
      })

      const placedOrder = orderRes.data

      // ✅ Handle online payment flow
      if (paymentMethod === 'ONLINE') {
        try {
          const payRes = await paymentApi.createOrder(placedOrder.id)
          const razorpayOrderId = payRes.data?.razorpayOrderId

          if (razorpayOrderId) {
            const paid = await handleOnlinePayment(placedOrder.id, total)
            if (paid) {
              toast.success('Order placed & payment done! 🎉')
              navigate('/orders')
            } else {
              toast.error('Payment failed. Order saved as pending.')
              navigate('/orders')
            }
          } else {
            // Razorpay not configured - show demo message
            toast.success('Order placed! (Demo mode - configure Razorpay for real payments)', { duration: 5000 })
            navigate('/orders')
          }
        } catch {
          toast.success('Order placed! Payment pending.')
          navigate('/orders')
        }
      } else {
        toast.success('Order placed successfully! 🎉')
        navigate('/orders')
      }
    } catch (e) {
      toast.error(e?.message || 'Failed to place order')
    } finally { setPlacing(false) }
  }

  const subtotal = cart?.subtotal || 0
  const shipping = subtotal >= 499 ? 0 : 49
  const tax = Math.round(subtotal * 0.05)
  const total = subtotal - couponDiscount + shipping + tax

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-4 border-[#e91e63] border-t-transparent rounded-full"/>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-pink-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">

            {/* Address */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-sky-100">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <MapPin size={20} className="text-[#e91e63]"/> Delivery Address
                </h2>
                <div className="flex gap-2">
                  <button onClick={fetchCurrentLocation} disabled={fetchingLocation}
                    className="flex items-center gap-1.5 text-sm bg-sky-50 text-sky-600 border border-sky-200 px-3 py-1.5 rounded-xl hover:bg-sky-100 disabled:opacity-60">
                    <Navigation size={14}/>
                    {fetchingLocation ? 'Fetching...' : 'Use My Location'}
                  </button>
                  <button onClick={() => setShowAddAddress(!showAddAddress)}
                    className="flex items-center gap-1.5 text-sm bg-pink-50 text-[#e91e63] border border-pink-200 px-3 py-1.5 rounded-xl hover:bg-pink-100">
                    <Plus size={14}/> Add New
                  </button>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                {addresses.map(addr => (
                  <label key={addr.id} className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedAddress===addr.id?'border-[#e91e63] bg-pink-50':'border-gray-100 hover:border-pink-200'}`}>
                    <input type="radio" name="address" value={addr.id} checked={selectedAddress===addr.id} onChange={()=>setSelectedAddress(addr.id)} className="mt-1 accent-[#e91e63]"/>
                    <div>
                      <p className="font-semibold text-gray-800">{addr.name}
                        <span className="ml-2 text-xs bg-sky-100 text-sky-600 px-2 py-0.5 rounded-full">{addr.addressType}</span>
                        {addr.isDefault && <span className="ml-1 text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full">Default</span>}
                      </p>
                      <p className="text-sm text-gray-600">{addr.addressLine1}{addr.addressLine2?`, ${addr.addressLine2}`:''}</p>
                      <p className="text-sm text-gray-500">{addr.city}, {addr.state} - {addr.pincode}</p>
                      <p className="text-sm text-gray-500">{addr.phone}</p>
                    </div>
                  </label>
                ))}
                {addresses.length===0 && !showAddAddress && (
                  <p className="text-center py-6 text-gray-400 text-sm">No addresses. Add one or use GPS.</p>
                )}
              </div>

              {showAddAddress && (
                <div className="border-2 border-dashed border-sky-200 rounded-xl p-4 bg-sky-50/50">
                  <h3 className="font-semibold text-gray-800 mb-4">New Address</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {[{k:'name',l:'Full Name *',s:1},{k:'phone',l:'Phone *',s:1},{k:'addressLine1',l:'Address Line 1 *',s:2},{k:'addressLine2',l:'Landmark (optional)',s:2},{k:'city',l:'City *',s:1},{k:'state',l:'State *',s:1},{k:'pincode',l:'Pincode *',s:1}].map(({k,l,s})=>(
                      <div key={k} className={s===2?'col-span-2':''}>
                        <label className="text-xs font-medium text-gray-600 mb-1 block">{l}</label>
                        <input value={newAddress[k]} onChange={e=>setNewAddress(p=>({...p,[k]:e.target.value}))}
                          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#e91e63] bg-white"/>
                      </div>
                    ))}
                    <div>
                      <label className="text-xs font-medium text-gray-600 mb-1 block">Type</label>
                      <select value={newAddress.addressType} onChange={e=>setNewAddress(p=>({...p,addressType:e.target.value}))}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none bg-white">
                        <option value="HOME">🏠 Home</option>
                        <option value="WORK">💼 Work</option>
                        <option value="OTHER">📍 Other</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-3 mt-4">
                    <button onClick={saveAddress} className="flex-1 bg-[#e91e63] text-white py-2.5 rounded-xl font-semibold hover:bg-[#c2185b]">Save Address</button>
                    <button onClick={()=>setShowAddAddress(false)} className="flex-1 border-2 border-gray-200 text-gray-600 py-2.5 rounded-xl font-semibold">Cancel</button>
                  </div>
                </div>
              )}
            </div>

            {/* ✅ Fix 3: Payment Method with detailed options */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-sky-100">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-5">
                <CreditCard size={20} className="text-[#e91e63]"/> Payment Method
              </h2>
              <div className="space-y-3">

                {/* COD */}
                <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod==='COD'?'border-[#e91e63] bg-pink-50':'border-gray-100 hover:border-pink-200'}`}>
                  <input type="radio" name="payment" value="COD" checked={paymentMethod==='COD'} onChange={()=>setPaymentMethod('COD')} className="accent-[#e91e63]"/>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center text-xl">💵</div>
                    <div>
                      <p className="font-semibold text-gray-800">Cash on Delivery</p>
                      <p className="text-xs text-gray-500">Pay when your order arrives</p>
                    </div>
                  </div>
                  <span className="ml-auto text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">Free</span>
                </label>

                {/* Online */}
                <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod==='ONLINE'?'border-[#e91e63] bg-pink-50':'border-gray-100 hover:border-pink-200'}`}>
                  <input type="radio" name="payment" value="ONLINE" checked={paymentMethod==='ONLINE'} onChange={()=>setPaymentMethod('ONLINE')} className="accent-[#e91e63]"/>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-xl">💳</div>
                    <div>
                      <p className="font-semibold text-gray-800">Online Payment</p>
                      <p className="text-xs text-gray-500">UPI · Credit/Debit Card · NetBanking</p>
                    </div>
                  </div>
                  <span className="ml-auto text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">Secure</span>
                </label>

                {/* UPI Quick */}
                {paymentMethod === 'ONLINE' && (
                  <div className="ml-4 p-4 bg-sky-50 rounded-xl border border-sky-100">
                    <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <Smartphone size={14} className="text-sky-500"/> Accepted Payment Methods
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {['UPI', 'GPay', 'PhonePe', 'Paytm', 'Visa', 'Mastercard', 'RuPay', 'NetBanking'].map(m => (
                        <span key={m} className="text-xs bg-white border border-sky-200 text-gray-600 px-3 py-1.5 rounded-lg font-medium">{m}</span>
                      ))}
                    </div>
                    <p className="text-xs text-gray-400 mt-3 flex items-center gap-1">
                      🔒 Secured by Razorpay — 100% safe & encrypted
                    </p>
                  </div>
                )}

                {/* Wallet */}
                <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod==='WALLET'?'border-[#e91e63] bg-pink-50':'border-gray-100 hover:border-pink-200'}`}>
                  <input type="radio" name="payment" value="WALLET" checked={paymentMethod==='WALLET'} onChange={()=>setPaymentMethod('WALLET')} className="accent-[#e91e63]"/>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center text-xl">👛</div>
                    <div>
                      <p className="font-semibold text-gray-800">Suman Wallet</p>
                      <p className="text-xs text-gray-500">Use your wallet balance</p>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Coupon */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-sky-100">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
                <Tag size={20} className="text-[#e91e63]"/> Coupon & Notes
              </h2>
              <div className="flex gap-2 mb-3">
                <input value={couponCode} onChange={e=>setCouponCode(e.target.value.toUpperCase())}
                  placeholder="Enter coupon code" className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#e91e63]"/>
                <button onClick={validateCoupon} className="bg-sky-500 hover:bg-sky-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold">Apply</button>
              </div>
              {couponDiscount > 0 && <p className="text-green-600 text-sm mb-3">✅ Coupon applied! You save ₹{couponDiscount}</p>}
              <div className="flex flex-wrap gap-2 mb-3">
                {['WELCOME10','SUMAN20','FLAT200','NEWUSER'].map(c => (
                  <button key={c} onClick={()=>setCouponCode(c)} className="text-xs bg-pink-50 text-[#e91e63] border border-pink-200 px-3 py-1.5 rounded-lg hover:bg-pink-100 font-medium">{c}</button>
                ))}
              </div>
              <textarea value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Special instructions (optional)" rows={2}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#e91e63] resize-none"/>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-sky-100 sticky top-4">
              <h2 className="text-lg font-bold text-gray-900 mb-5">Order Summary</h2>
              <div className="space-y-3 mb-5 max-h-64 overflow-y-auto">
                {cart?.items?.map(item => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl border border-gray-100 overflow-hidden bg-sky-50 shrink-0">
                      {item.productImage ? (
                        <img src={item.productImage} alt={item.productName} className="w-full h-full object-cover"
                          onError={e=>e.target.src='https://placehold.co/48x48/fdf2f8/e91e63?text=P'}/>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-lg">🛍️</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{item.productName}</p>
                      <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-semibold">₹{((item.price||0)*(item.quantity||1)).toLocaleString()}</p>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-100 pt-4 space-y-2.5">
                <div className="flex justify-between text-sm text-gray-600"><span>Subtotal</span><span>₹{subtotal.toLocaleString()}</span></div>
                {couponDiscount>0 && <div className="flex justify-between text-sm text-green-600"><span>Discount</span><span>-₹{couponDiscount}</span></div>}
                <div className="flex justify-between text-sm text-gray-600">
                  <span className="flex items-center gap-1"><Truck size={13}/> Shipping</span>
                  <span className={shipping===0?'text-green-600 font-medium':''}>{shipping===0?'FREE':`₹${shipping}`}</span>
                </div>
                {shipping>0 && <p className="text-xs text-sky-500">Add ₹{(499-subtotal).toFixed(0)} more for free shipping!</p>}
                <div className="flex justify-between text-sm text-gray-600"><span>GST (5%)</span><span>₹{tax}</span></div>
                <div className="flex justify-between font-bold text-gray-900 text-lg border-t border-gray-100 pt-3">
                  <span>Total</span><span className="text-[#e91e63]">₹{total.toLocaleString()}</span>
                </div>
              </div>

              <button onClick={placeOrder} disabled={placing||!selectedAddress}
                className="w-full mt-5 bg-gradient-to-r from-[#e91e63] to-[#f06292] text-white py-4 rounded-xl font-bold text-base hover:from-[#c2185b] hover:to-[#e91e63] transition-all disabled:opacity-60 shadow-md flex items-center justify-center gap-2">
                {placing
                  ? <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"/>Processing...</>
                  : paymentMethod==='ONLINE'
                  ? <><CreditCard size={18}/> Pay ₹{total.toLocaleString()}</>
                  : <><CheckCircle size={18}/> Place Order — ₹{total.toLocaleString()}</>
                }
              </button>

              {paymentMethod==='ONLINE' && (
                <p className="text-center text-xs text-gray-400 mt-2">🔒 Secured by Razorpay</p>
              )}
              <p className="text-center text-xs text-gray-400 mt-2">Free returns · Secure checkout</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
