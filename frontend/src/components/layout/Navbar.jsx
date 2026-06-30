import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShoppingCart, Heart, Bell, Search, User, LogOut, Settings, Package, Menu, X } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { searchApi } from '../../services/api'

export default function Navbar() {
  const { user, logout, cartCount, notifCount, isLoggedIn, isAdmin } = useAuth()
  const navigate = useNavigate()
  const [searchQ, setSearchQ] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [mobileMenu, setMobileMenu] = useState(false)
  const searchRef = useRef(null)

  useEffect(() => {
    const h = (e) => { if (searchRef.current && !searchRef.current.contains(e.target)) setShowDropdown(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const handleSearch = async (q) => {
    setSearchQ(q)
    if (q.length < 2) { setSuggestions([]); setShowDropdown(false); return }
    try {
      const r = await searchApi.suggestions(q)
      setSuggestions(r.data || [])
      setShowDropdown(true)
    } catch { setSuggestions([]) }
  }

  const goSearch = (q) => { setShowDropdown(false); setSearchQ(q); navigate(`/search?q=${encodeURIComponent(q)}`) }

  const categories = ['Makeup','Skincare','Bags','Shoes','Clothing','Haircare']

  return (
    <>
      <div className="bg-gradient-to-r from-sky-500 to-[#e91e63] text-white text-xs text-center py-2 px-4 font-medium">
        Free shipping above ₹499 | Use <strong>WELCOME10</strong> for 10% off!
      </div>
      <nav className="bg-white border-b border-sky-100 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-4 h-16">
            <Link to="/" className="flex items-center gap-2 shrink-0">
              <div className="w-9 h-9 bg-gradient-to-br from-[#e91e63] to-[#f06292] rounded-full flex items-center justify-center text-white font-bold text-xl shadow-md">S</div>
              <span className="font-bold text-2xl bg-gradient-to-r from-[#e91e63] to-sky-500 bg-clip-text text-transparent">Suman</span>
            </Link>
            <div ref={searchRef} className="flex-1 max-w-xl relative hidden md:block">
              <div className="flex items-center bg-sky-50 border border-sky-200 rounded-xl overflow-hidden focus-within:border-[#e91e63] focus-within:ring-2 focus-within:ring-pink-100">
                <Search size={16} className="ml-3 text-sky-400"/>
                <input value={searchQ} onChange={e=>handleSearch(e.target.value)} onKeyDown={e=>e.key==='Enter'&&searchQ&&goSearch(searchQ)}
                  placeholder="Search products..." className="flex-1 px-3 py-2.5 text-sm bg-transparent focus:outline-none"/>
              </div>
              {showDropdown && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-white border border-sky-100 rounded-xl shadow-xl mt-1 z-50">
                  {suggestions.map((s,i) => (
                    <button key={i} onClick={()=>goSearch(s.name||s)}
                      className="w-full text-left px-4 py-2.5 text-sm hover:bg-sky-50 flex items-center gap-2">
                      <Search size={12} className="text-gray-400"/> {s.name||s}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="flex items-center gap-1 ml-auto">
              <Link to="/cart" className="relative p-2.5 hover:bg-pink-50 rounded-xl">
                <ShoppingCart size={20} className="text-gray-700"/>
                {cartCount > 0 && <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-[#e91e63] text-white text-xs rounded-full flex items-center justify-center font-bold">{cartCount>9?'9+':cartCount}</span>}
              </Link>
              <Link to="/wishlist" className="p-2.5 hover:bg-pink-50 rounded-xl hidden md:flex"><Heart size={20} className="text-gray-700"/></Link>
              {isLoggedIn() && (
                <Link to="/profile" className="relative p-2.5 hover:bg-sky-50 rounded-xl hidden md:flex">
                  <Bell size={20} className="text-gray-700"/>
                  {notifCount>0&&<span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-sky-500 text-white text-xs rounded-full flex items-center justify-center font-bold">{notifCount>9?'9+':notifCount}</span>}
                </Link>
              )}
              {isLoggedIn() ? (
                <div className="relative">
                  <button onClick={()=>setShowUserMenu(!showUserMenu)} className="flex items-center gap-2 px-3 py-2 hover:bg-sky-50 rounded-xl">
                    <div className="w-8 h-8 bg-gradient-to-br from-[#e91e63] to-[#f06292] rounded-full flex items-center justify-center text-white text-sm font-bold">{user?.name?.[0]?.toUpperCase()||'U'}</div>
                    <span className="text-sm font-medium hidden md:block max-w-[100px] truncate">{user?.name?.split(' ')[0]}</span>
                  </button>
                  {showUserMenu && (
                    <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-sky-100 rounded-2xl shadow-xl z-50 overflow-hidden">
                      <div className="px-4 py-3 border-b border-sky-50 bg-gradient-to-r from-sky-50 to-pink-50">
                        <p className="text-sm font-bold">{user?.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                      </div>
                      <div className="py-1">
                        {[{to:'/profile',icon:User,label:'My Profile'},{to:'/orders',icon:Package,label:'My Orders'},{to:'/wishlist',icon:Heart,label:'Wishlist'}].map(({to,icon:Icon,label})=>(
                          <Link key={to} to={to} onClick={()=>setShowUserMenu(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-sky-50">
                            <Icon size={15} className="text-sky-500"/> {label}
                          </Link>
                        ))}
                        {isAdmin() && (
                          <Link to="/admin" onClick={()=>setShowUserMenu(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-pink-50 border-t border-sky-50">
                            <Settings size={15} className="text-[#e91e63]"/> Admin Panel
                          </Link>
                        )}
                        <button onClick={()=>{logout();setShowUserMenu(false)}} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 border-t border-gray-100">
                          <LogOut size={15}/> Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link to="/login" className="bg-gradient-to-r from-[#e91e63] to-[#f06292] text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-sm">Login</Link>
              )}
              <button onClick={()=>setMobileMenu(!mobileMenu)} className="p-2 md:hidden">{mobileMenu?<X size={20}/>:<Menu size={20}/>}</button>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-6 pb-3 overflow-x-auto">
            {categories.map(cat=>(
              <Link key={cat} to={`/products?category=${cat.toLowerCase()}`} className="text-sm text-gray-600 hover:text-[#e91e63] font-medium whitespace-nowrap">{cat}</Link>
            ))}
            <Link to="/products" className="text-sm text-sky-500 font-semibold whitespace-nowrap">View All →</Link>
          </div>
        </div>
        {mobileMenu && (
          <div className="md:hidden border-t border-sky-100 bg-white px-4 py-4 space-y-3">
            <input value={searchQ} onChange={e=>handleSearch(e.target.value)} onKeyDown={e=>e.key==='Enter'&&searchQ&&goSearch(searchQ)}
              placeholder="Search..." className="w-full border border-sky-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none bg-sky-50"/>
            <div className="grid grid-cols-3 gap-2">
              {categories.map(cat=>(
                <Link key={cat} to={`/products?category=${cat.toLowerCase()}`} onClick={()=>setMobileMenu(false)} className="text-xs text-center bg-sky-50 py-2 rounded-lg">{cat}</Link>
              ))}
            </div>
          </div>
        )}
      </nav>
    </>
  )
}
