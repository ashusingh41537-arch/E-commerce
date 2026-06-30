import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart, ShoppingCart, ShoppingBag } from 'lucide-react'
import { cartApi, wishlistApi } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

export default function ProductCard({ product }) {
  const { isLoggedIn, setCartCount } = useAuth()
  const [wishlisted, setWishlisted] = useState(false)
  const [addingCart, setAddingCart] = useState(false)

  if (!product) return null

  const price = Number(product.price || 0)
  const comparePrice = Number(product.comparePrice || 0)
  const discountPercent = comparePrice > price
    ? Math.round(((comparePrice - price) / comparePrice) * 100) : 0

  // ✅ Fix 1: Handle base64, URL, or missing image
  const getImageSrc = () => {
    if (!product.primaryImage) return null
    // base64 image
    if (product.primaryImage.startsWith('data:')) return product.primaryImage
    // normal URL
    if (product.primaryImage.startsWith('http')) return product.primaryImage
    return null
  }

  const imageSrc = getImageSrc()

  const handleAddToCart = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isLoggedIn()) { toast.error('Please login first'); return }
    setAddingCart(true)
    try {
      await cartApi.add({ productId: product.id, quantity: 1 })
      setCartCount(prev => prev + 1)
      toast.success('Added to cart! 🛒')
    } catch { toast.error('Failed to add to cart') }
    finally { setAddingCart(false) }
  }

  const handleWishlist = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isLoggedIn()) { toast.error('Please login first'); return }
    try {
      await wishlistApi.add(product.id)
      setWishlisted(true)
      toast.success('Added to wishlist! ❤️')
    } catch { toast.error('Failed to add to wishlist') }
  }

  return (
    <Link to={`/products/${product.slug}`} className="group block">
      <div className="bg-white rounded-2xl overflow-hidden border border-sky-100 hover:shadow-xl hover:border-pink-200 transition-all duration-300 hover:-translate-y-1">

        {/* Image Section */}
        <div className="relative aspect-square bg-gradient-to-br from-sky-50 to-pink-50 overflow-hidden">

          {/* Discount Badge */}
          {discountPercent > 0 && (
            <span className="absolute top-2 left-2 z-10 bg-[#e91e63] text-white text-xs font-bold px-2 py-1 rounded-lg shadow-sm">
              -{discountPercent}%
            </span>
          )}

          {/* Wishlist Button */}
          <button onClick={handleWishlist}
            className="absolute top-2 right-2 z-10 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:bg-pink-50 transition-colors">
            <Heart size={14} className={wishlisted ? 'fill-[#e91e63] text-[#e91e63]' : 'text-gray-400'}/>
          </button>

          {/* ✅ Fix 1: Image with fallback showing product name */}
          {imageSrc ? (
            <img
              src={imageSrc}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={e => {
                e.target.onerror = null
                e.target.style.display = 'none'
                e.target.nextSibling.style.display = 'flex'
              }}
            />
          ) : null}

          {/* Fallback - product name shown */}
          <div
            style={{ display: imageSrc ? 'none' : 'flex' }}
            className="w-full h-full flex flex-col items-center justify-center p-4 text-center">
            <div className="text-4xl mb-2">
              {product.categoryName === 'Makeup' ? '💄' :
               product.categoryName === 'Skincare' ? '✨' :
               product.categoryName === 'Bags' ? '👜' :
               product.categoryName === 'Shoes' ? '👠' :
               product.categoryName === 'Clothing' ? '👗' :
               product.categoryName === 'Haircare' ? '💇' : '🛍️'}
            </div>
            <p className="text-sm font-semibold text-[#e91e63] leading-tight line-clamp-2">{product.name}</p>
          </div>

          {/* ✅ Fix 2: Quick Buy button on hover */}
          <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button
              onClick={handleAddToCart}
              disabled={addingCart || product.stockQuantity === 0}
              className="w-full flex items-center justify-center gap-2 bg-white/95 backdrop-blur-sm text-[#e91e63] py-2 rounded-xl text-sm font-bold hover:bg-[#e91e63] hover:text-white transition-all disabled:opacity-60 shadow-md">
              {addingCart
                ? <div className="w-4 h-4 border-2 border-[#e91e63] border-t-transparent rounded-full animate-spin"/>
                : <ShoppingCart size={14}/>}
              {product.stockQuantity === 0 ? 'Out of Stock' : addingCart ? 'Adding...' : 'Add to Cart'}
            </button>
          </div>
        </div>

        {/* Info Section */}
        <div className="p-3">
          {product.brandName && (
            <p className="text-xs text-sky-500 font-medium mb-0.5">{product.brandName}</p>
          )}
          <p className="text-sm font-semibold text-gray-800 line-clamp-2 leading-tight mb-2">{product.name}</p>

          {/* Rating */}
          {product.reviewCount > 0 && (
            <div className="flex items-center gap-1 mb-2">
              <span className="text-yellow-400 text-xs">★</span>
              <span className="text-xs text-gray-600">{Number(product.averageRating||0).toFixed(1)}</span>
              <span className="text-xs text-gray-400">({product.reviewCount})</span>
            </div>
          )}

          {/* Price + Buy Button Row */}
          <div className="flex items-center justify-between gap-2">
            <div>
              <span className="text-base font-bold text-gray-900">₹{price.toLocaleString()}</span>
              {comparePrice > price && (
                <span className="text-xs text-gray-400 line-through ml-1.5">₹{comparePrice.toLocaleString()}</span>
              )}
            </div>

            {/* ✅ Fix 2: Buy Now button always visible */}
            <button
              onClick={handleAddToCart}
              disabled={addingCart || product.stockQuantity === 0}
              title="Add to Cart"
              className="w-8 h-8 bg-[#e91e63] hover:bg-[#c2185b] text-white rounded-xl flex items-center justify-center transition-colors disabled:opacity-60 shrink-0 shadow-sm">
              {addingCart
                ? <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"/>
                : <ShoppingCart size={14}/>}
            </button>
          </div>
        </div>
      </div>
    </Link>
  )
}
