import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SlidersHorizontal, X, ChevronDown } from 'lucide-react'
import { productApi, categoryApi } from '../services/api'
import ProductCard from '../components/product/ProductCard'

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'popularity', label: 'Most Popular' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
]

const BRANDS = ['Lakme', 'MAC', "L'Oreal", 'Nykaa', 'Sugar', 'Mamaearth', 'WOW']

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [showFilters, setShowFilters] = useState(false)

  // Filters state
  const [category, setCategory] = useState(searchParams.get('category') || '')
  const [brand, setBrand] = useState(searchParams.get('brand') || '')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [minRating, setMinRating] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const [page, setPage] = useState(0)

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const params = {
        page, size: 12, sortBy,
        ...(category && { category }),
        ...(brand && { brand }),
        ...(minPrice && { minPrice }),
        ...(maxPrice && { maxPrice }),
        ...(minRating && { minRating }),
        ...(searchParams.get('featured') && { isFeatured: true }),
        ...(searchParams.get('trending') && { isTrending: true }),
      }
      const res = await productApi.getAll(params)
      setProducts(res.data?.content || [])
      setTotalPages(res.data?.totalPages || 0)
      setTotalElements(res.data?.totalElements || 0)
    } catch { /* silent */ } finally {
      setLoading(false)
    }
  }, [category, brand, minPrice, maxPrice, minRating, sortBy, page, searchParams])

  useEffect(() => { fetchProducts() }, [fetchProducts])
  useEffect(() => {
    const cat = searchParams.get('category')
    if (cat) setCategory(cat)
  }, [searchParams])

  const clearFilters = () => {
    setCategory(''); setBrand(''); setMinPrice(''); setMaxPrice(''); setMinRating(''); setPage(0)
  }
  const hasFilters = category || brand || minPrice || maxPrice || minRating

  const CATEGORIES_LIST = ['makeup', 'skincare', 'bags', 'shoes', 'clothing', 'haircare', 'fragrance']

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900">
            {category ? category.charAt(0).toUpperCase() + category.slice(1) : 'All Products'}
          </h1>
          {!loading && <p className="text-sm text-gray-500 mt-1">{totalElements} products found</p>}
        </div>
        <div className="flex items-center gap-3">
          {/* Sort */}
          <select
            value={sortBy}
            onChange={e => { setSortBy(e.target.value); setPage(0) }}
            className="text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-[#e91e63] bg-white"
          >
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          {/* Filter toggle (mobile) */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 border border-gray-200 rounded-xl px-4 py-2 text-sm font-medium hover:border-[#e91e63] hover:text-[#e91e63] transition-colors lg:hidden"
          >
            <SlidersHorizontal size={16} /> Filters
          </button>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Sidebar Filters */}
        <aside className={`w-64 shrink-0 ${showFilters ? 'block' : 'hidden'} lg:block`}>
          <div className="card p-4 sticky top-24 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-800">Filters</h3>
              {hasFilters && (
                <button onClick={clearFilters} className="text-xs text-[#e91e63] hover:underline">Clear all</button>
              )}
            </div>

            {/* Categories */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Category</h4>
              <div className="space-y-2">
                {CATEGORIES_LIST.map(cat => (
                  <label key={cat} className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="radio"
                      name="category"
                      value={cat}
                      checked={category === cat}
                      onChange={() => { setCategory(cat); setPage(0) }}
                      className="accent-[#e91e63]"
                    />
                    <span className="text-sm text-gray-600 group-hover:text-[#e91e63] capitalize">{cat}</span>
                  </label>
                ))}
                {category && (
                  <button onClick={() => setCategory('')} className="text-xs text-gray-400 hover:text-[#e91e63]">
                    Clear category
                  </button>
                )}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Price Range</h4>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={e => { setMinPrice(e.target.value); setPage(0) }}
                  className="w-1/2 border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:border-[#e91e63]"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={e => { setMaxPrice(e.target.value); setPage(0) }}
                  className="w-1/2 border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:border-[#e91e63]"
                />
              </div>
            </div>

            {/* Rating */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Minimum Rating</h4>
              <div className="space-y-2">
                {[4, 3, 2].map(r => (
                  <label key={r} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="rating"
                      value={r}
                      checked={Number(minRating) === r}
                      onChange={() => { setMinRating(r.toString()); setPage(0) }}
                      className="accent-[#e91e63]"
                    />
                    <span className="text-sm text-gray-600">{r}+ ⭐</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Brands */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Brand</h4>
              <div className="space-y-2">
                {BRANDS.map(b => (
                  <label key={b} className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="radio"
                      name="brand"
                      value={b.toLowerCase()}
                      checked={brand === b.toLowerCase()}
                      onChange={() => { setBrand(b.toLowerCase()); setPage(0) }}
                      className="accent-[#e91e63]"
                    />
                    <span className="text-sm text-gray-600 group-hover:text-[#e91e63]">{b}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Products Grid */}
        <div className="flex-1">
          {/* Active filters */}
          {hasFilters && (
            <div className="flex flex-wrap gap-2 mb-4">
              {category && (
                <span className="flex items-center gap-1 bg-pink-100 text-[#e91e63] text-xs font-medium px-3 py-1 rounded-full">
                  {category} <button onClick={() => setCategory('')}><X size={12} /></button>
                </span>
              )}
              {brand && (
                <span className="flex items-center gap-1 bg-pink-100 text-[#e91e63] text-xs font-medium px-3 py-1 rounded-full">
                  {brand} <button onClick={() => setBrand('')}><X size={12} /></button>
                </span>
              )}
              {(minPrice || maxPrice) && (
                <span className="flex items-center gap-1 bg-pink-100 text-[#e91e63] text-xs font-medium px-3 py-1 rounded-full">
                  ₹{minPrice || 0} - ₹{maxPrice || '∞'} <button onClick={() => { setMinPrice(''); setMaxPrice('') }}><X size={12} /></button>
                </span>
              )}
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="rounded-2xl overflow-hidden">
                  <div className="skeleton aspect-square" />
                  <div className="p-3 space-y-2">
                    <div className="skeleton h-4 rounded w-3/4" />
                    <div className="skeleton h-4 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No products found</h3>
              <p className="text-gray-500 mb-4">Try adjusting your filters</p>
              <button onClick={clearFilters} className="btn-primary">Clear Filters</button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {products.map(p => <ProductCard key={p.id} product={p} />)}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                  <button
                    onClick={() => setPage(p => Math.max(0, p - 1))}
                    disabled={page === 0}
                    className="px-4 py-2 border rounded-xl text-sm disabled:opacity-40 hover:border-[#e91e63] hover:text-[#e91e63] transition-colors"
                  >
                    Previous
                  </button>
                  {[...Array(Math.min(5, totalPages))].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setPage(i)}
                      className={`w-10 h-10 rounded-xl text-sm font-medium transition-colors ${
                        page === i ? 'bg-[#e91e63] text-white' : 'border hover:border-[#e91e63] hover:text-[#e91e63]'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                    disabled={page >= totalPages - 1}
                    className="px-4 py-2 border rounded-xl text-sm disabled:opacity-40 hover:border-[#e91e63] hover:text-[#e91e63] transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
