import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { productApi, cartApi, wishlistApi, reviewApi } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { ShoppingCart, Heart, Star, ChevronRight, Package } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ProductDetail() {
  const { slug } = useParams()
  const { isLoggedIn, setCartCount } = useAuth()
  const [product, setProduct] = useState(null)
  const [reviews, setReviews] = useState([])
  const [relatedProducts, setRelatedProducts] = useState([])
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)
  const [addingCart, setAddingCart] = useState(false)

  useEffect(() => {
    setLoading(true)
    productApi.getBySlug(slug)
      .then(r => {
        const p = r.data
        setProduct(p)
        // ✅ Problem 4 Fix: Load reviews for THIS product
        if (p?.id) {
          reviewApi.getByProduct(p.id)
            .then(rev => setReviews(rev.data || []))
            .catch(() => {})
          productApi.getRelated(p.id)
            .then(rel => setRelatedProducts(rel.data || []))
            .catch(() => {})
        }
      })
      .catch(() => toast.error('Product not found'))
      .finally(() => setLoading(false))
  }, [slug])

  const addToCart = async () => {
    if (!isLoggedIn()) { toast.error('Please login first'); return }
    setAddingCart(true)
    try {
      await cartApi.add({ productId: product.id, quantity })
      setCartCount(prev => prev + quantity)
      toast.success('Added to cart!')
    } catch { toast.error('Failed to add to cart') }
    finally { setAddingCart(false) }
  }

  const addToWishlist = async () => {
    if (!isLoggedIn()) { toast.error('Please login first'); return }
    try {
      await wishlistApi.add(product.id)
      toast.success('Added to wishlist!')
    } catch { toast.error('Failed to add to wishlist') }
  }

  const renderStars = (rating) => (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(s => (
        <Star key={s} size={14} className={s <= Math.round(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'}/>
      ))}
    </div>
  )

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin w-10 h-10 border-4 border-[#e91e63] border-t-transparent rounded-full"/>
    </div>
  )

  if (!product) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-500 text-xl mb-4">Product not found</p>
        <Link to="/products" className="text-[#e91e63] underline">Browse Products</Link>
      </div>
    </div>
  )

  const discountPercent = product.comparePrice > product.price
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100) : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-pink-50">
      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-400 mb-6">
          <Link to="/" className="hover:text-[#e91e63]">Home</Link>
          <ChevronRight size={14}/>
          <Link to="/products" className="hover:text-[#e91e63]">Products</Link>
          <ChevronRight size={14}/>
          <span className="text-gray-700 truncate max-w-xs">{product.name}</span>
        </nav>

        {/* Product Main */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-12">
          {/* Images */}
          <div>
            <div className="bg-white rounded-2xl overflow-hidden border border-sky-100 shadow-sm mb-3 aspect-square">
              {product.images?.[selectedImage] ? (
                <img src={product.images[selectedImage]} alt={product.name}
                  className="w-full h-full object-cover"
                  onError={e => e.target.src = 'https://placehold.co/500x500/fdf2f8/e91e63?text=Product'}/>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-50">
                  <Package size={80} className="text-gray-200"/>
                </div>
              )}
            </div>
            {product.images?.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {product.images.map((img, i) => (
                  <button key={i} onClick={() => setSelectedImage(i)}
                    className={`w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${i === selectedImage ? 'border-[#e91e63]' : 'border-gray-100'}`}>
                    <img src={img} alt="" className="w-full h-full object-cover"
                      onError={e => e.target.src = 'https://placehold.co/64x64/fdf2f8/e91e63?text=P'}/>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            {product.categoryName && (
              <span className="text-xs bg-sky-100 text-sky-600 px-3 py-1 rounded-full font-medium">{product.categoryName}</span>
            )}
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mt-3 mb-2">{product.name}</h1>
            {product.brandName && <p className="text-gray-500 text-sm mb-3">by {product.brandName}</p>}

            {/* Rating */}
            <div className="flex items-center gap-2 mb-4">
              {renderStars(product.averageRating || 0)}
              <span className="text-sm font-semibold text-gray-800">{Number(product.averageRating || 0).toFixed(1)}</span>
              <span className="text-sm text-gray-500">({product.reviewCount || reviews.length} reviews)</span>
              <span className="text-sm text-gray-400">• {product.soldCount || 0} sold</span>
            </div>

            {/* Price */}
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl font-bold text-gray-900">₹{Number(product.price || 0).toLocaleString()}</span>
              {product.comparePrice > product.price && (
                <>
                  <span className="text-lg text-gray-400 line-through">₹{Number(product.comparePrice).toLocaleString()}</span>
                  <span className="bg-green-100 text-green-700 text-sm font-bold px-2 py-0.5 rounded-full">{discountPercent}% OFF</span>
                </>
              )}
            </div>

            {product.shortDescription && (
              <p className="text-gray-600 mb-5 leading-relaxed">{product.shortDescription}</p>
            )}

            {/* Stock */}
            <div className="mb-5">
              {product.stockQuantity > 0 ? (
                <span className="text-green-600 text-sm font-medium">✓ In Stock ({product.stockQuantity} available)</span>
              ) : (
                <span className="text-red-500 text-sm font-medium">✗ Out of Stock</span>
              )}
            </div>

            {/* Quantity */}
            <div className="flex items-center gap-4 mb-5">
              <label className="text-sm font-medium text-gray-700">Quantity:</label>
              <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                <button onClick={() => setQuantity(q => Math.max(1, q-1))}
                  className="px-4 py-2 text-gray-500 hover:bg-gray-50 font-bold text-lg">−</button>
                <span className="px-4 py-2 text-gray-800 font-semibold min-w-[3rem] text-center">{quantity}</span>
                <button onClick={() => setQuantity(q => Math.min(product.stockQuantity || 99, q+1))}
                  className="px-4 py-2 text-gray-500 hover:bg-gray-50 font-bold text-lg">+</button>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex gap-3 mb-6">
              <button onClick={addToCart} disabled={addingCart || product.stockQuantity === 0}
                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-[#e91e63] to-[#f06292] text-white py-3.5 rounded-xl font-bold hover:from-[#c2185b] hover:to-[#e91e63] transition-all disabled:opacity-60 shadow-md">
                {addingCart ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"/> : <ShoppingCart size={18}/>}
                {addingCart ? 'Adding...' : 'Add to Cart'}
              </button>
              <button onClick={addToWishlist}
                className="p-3.5 border-2 border-pink-200 text-[#e91e63] rounded-xl hover:bg-pink-50 transition-colors">
                <Heart size={20}/>
              </button>
            </div>

            {/* Tags */}
            {product.tags && (
              <div className="flex flex-wrap gap-2">
                {product.tags.split(',').map(t => (
                  <span key={t} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">#{t.trim()}</span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        {product.description && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-sky-100 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Product Description</h2>
            <p className="text-gray-600 leading-relaxed whitespace-pre-line">{product.description}</p>
          </div>
        )}

        {/* ✅ Problem 4 Fix: Reviews shown ON product page */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-sky-100 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Customer Reviews</h2>
          <div className="flex items-center gap-3 mb-6">
            <span className="text-4xl font-bold text-gray-900">{Number(product.averageRating || 0).toFixed(1)}</span>
            <div>
              {renderStars(product.averageRating || 0)}
              <p className="text-sm text-gray-500 mt-1">{reviews.length} reviews</p>
            </div>
          </div>

          {reviews.length === 0 ? (
            <div className="text-center py-8">
              <Star size={36} className="mx-auto text-gray-200 mb-3"/>
              <p className="text-gray-400">No reviews yet. Be the first to review!</p>
            </div>
          ) : (
            <div className="space-y-5">
              {reviews.map(review => (
                <div key={review.id} className="border-b border-gray-100 pb-5 last:border-0">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-8 h-8 bg-gradient-to-br from-[#e91e63] to-[#f06292] rounded-full flex items-center justify-center text-white text-xs font-bold">
                          {review.userName?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <span className="font-semibold text-gray-800 text-sm">{review.userName || 'Customer'}</span>
                        {review.isVerifiedPurchase && (
                          <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full">✓ Verified Purchase</span>
                        )}
                      </div>
                      {renderStars(review.rating)}
                    </div>
                    <span className="text-xs text-gray-400">
                      {review.createdAt ? new Date(review.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'}) : ''}
                    </span>
                  </div>
                  {review.title && <p className="font-semibold text-gray-800 text-sm mb-1">{review.title}</p>}
                  {review.comment && <p className="text-gray-600 text-sm leading-relaxed">{review.comment}</p>}
                  {review.helpfulCount > 0 && (
                    <p className="text-xs text-gray-400 mt-2">{review.helpfulCount} people found this helpful</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-5">You May Also Like</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {relatedProducts.slice(0, 4).map(p => (
                <Link key={p.id} to={`/products/${p.slug}`}
                  className="bg-white rounded-2xl overflow-hidden border border-sky-100 hover:shadow-md hover:border-pink-200 transition-all">
                  <div className="aspect-square bg-gray-50">
                    <img src={p.primaryImage || 'https://placehold.co/200x200/fdf2f8/e91e63?text=P'} alt={p.name}
                      className="w-full h-full object-cover"
                      onError={e => e.target.src = 'https://placehold.co/200x200/fdf2f8/e91e63?text=P'}/>
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-semibold text-gray-800 truncate">{p.name}</p>
                    <p className="text-sm font-bold text-[#e91e63] mt-1">₹{Number(p.price||0).toLocaleString()}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
