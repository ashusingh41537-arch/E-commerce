import { Outlet, Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, Package, ShoppingBag, Users, BarChart3, Settings, ChevronRight } from 'lucide-react'

const ADMIN_NAV = [
  { path: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { path: '/admin/products', label: 'Products', icon: Package },
  { path: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { path: '/admin/users', label: 'Users', icon: Users },
  { path: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
]

export default function AdminLayout() {
  const { pathname } = useLocation()
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-60 bg-gray-900 text-gray-300 flex flex-col shrink-0">
        <div className="p-5 border-b border-gray-800">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#e91e63] rounded-full flex items-center justify-center text-white font-bold text-lg">S</div>
            <span className="font-display font-bold text-white text-lg">Suman</span>
          </Link>
          <p className="text-xs text-gray-500 mt-1">Admin Panel</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {ADMIN_NAV.map(({ path, label, icon: Icon, exact }) => {
            const active = exact ? pathname === path : pathname.startsWith(path)
            return (
              <Link key={path} to={path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${active ? 'bg-[#e91e63] text-white' : 'hover:bg-gray-800 hover:text-white'}`}>
                <Icon size={18} />{label}
              </Link>
            )
          })}
        </nav>
        <div className="p-4 border-t border-gray-800">
          <Link to="/" className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-300 transition-colors">
            ← Back to Store
          </Link>
        </div>
      </aside>
      {/* Main */}
      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>
    </div>
  )
}
