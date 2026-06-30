import { Link } from 'react-router-dom'
import { Instagram, Youtube, Heart } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-blue-950 text-gray-300 pt-14 pb-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pb-10 border-b border-gray-800">

          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-[#e91e63] rounded-full flex items-center justify-center text-white font-display font-bold text-xl">S</div>
              <span className="font-display font-bold text-2xl text-white">Suman</span>
            </div>
            <p className="text-sm leading-relaxed text-gray-400 mb-4">
              Your go-to destination for beauty, fashion & lifestyle. Discover products curated just for you.
            </p>
            <div className="flex gap-3">
              {[
                { Icon: Instagram, url: 'https://www.instagram.com/inexhaustible_glory', label: 'Instagram' },
                { Icon: Youtube, url: 'https://www.youtube.com/@ashusingh644', label: 'YouTube' },
              ].map(({ Icon, url }, i) => (
                <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                  className="w-9 h-9 bg-gray-800 hover:bg-[#e91e63] rounded-full flex items-center justify-center transition-colors">
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="font-semibold text-white mb-4">Shop</h4>
            <ul className="space-y-2 text-sm">
              {['Makeup', 'Skincare', 'Bags', 'Shoes', 'Clothing', 'Haircare'].map(cat => (
                <li key={cat}>
                  <Link to={`/products?category=${cat.toLowerCase()}`}
                    className="hover:text-[#e91e63] transition-colors">
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div>
            <h4 className="font-semibold text-white mb-4">Help</h4>
            <ul className="space-y-2 text-sm">
              {[
                ['My Orders', '/orders'],
                ['Track Order', '/orders'],
                ['Returns & Exchanges', '#'],
                ['Shipping Policy', '#'],
                ['FAQs', '#'],
                ['Contact Us', '#'],
              ].map(([label, href]) => (
                <li key={label}>
                  <Link to={href} className="hover:text-[#e91e63] transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-semibold text-white mb-4">Stay Updated</h4>
            <p className="text-sm text-gray-400 mb-3">Get exclusive deals & beauty tips right to your inbox.</p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#e91e63] placeholder-gray-500"
              />
              <button className="bg-[#e91e63] hover:bg-[#c2185b] text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors shrink-0">
                Join
              </button>
            </div>
            <div className="mt-4">
              <p className="text-xs text-gray-500 mb-2">We accept</p>
              <div className="flex gap-2 flex-wrap">
                {['Visa', 'Mastercard', 'UPI', 'Net Banking', 'COD'].map(p => (
                  <span key={p} className="bg-gray-800 text-xs px-2 py-1 rounded-md">{p}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center pt-6 gap-3 text-sm text-gray-500">
          <p className="flex items-center gap-1">
            © 2026 Akshay Pratap Singh — Built with <Heart size={14} className="text-[#e91e63]" fill="#e91e63" />
          </p>
          <p>© 2024 Suman Beauty & Fashion. All rights reserved.</p>
          <div className="flex gap-4">
            <Link to="#" className="hover:text-[#e91e63]">Privacy Policy</Link>
            <Link to="#" className="hover:text-[#e91e63]">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
