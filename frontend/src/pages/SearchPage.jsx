import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, TrendingUp } from 'lucide-react'
import { searchApi } from '../services/api'
import ProductCard from '../components/product/ProductCard'

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const q = searchParams.get('q') || ''
  const [results, setResults] = useState([])
  const [trending, setTrending] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    searchApi.trending().then(r => setTrending(r.data || [])).catch(() => {})
  }, [])

  useEffect(() => {
    if (q) { setLoading(true); searchApi.search({ q }).then(r => setResults(r.data?.products || [])).catch(() => {}).finally(() => setLoading(false)) }
    else setResults([])
  }, [q])

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto mb-8">
        <form onSubmit={e => { e.preventDefault(); const val = e.target.q.value.trim(); if (val) setSearchParams({ q: val }) }}>
          <div className="relative">
            <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input name="q" defaultValue={q} placeholder="Search products, brands, categories..." className="w-full pl-12 pr-4 py-4 text-base border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-[#e91e63] bg-white shadow-sm" />
            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 btn-primary py-2 px-5">Search</button>
          </div>
        </form>
      </div>

      {!q && (
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={18} className="text-orange-500" />
            <h3 className="font-semibold text-gray-700">Trending Searches</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {trending.map(term => (
              <button key={term} onClick={() => setSearchParams({ q: term })}
                className="px-4 py-2 bg-gray-100 hover:bg-pink-100 hover:text-[#e91e63] rounded-full text-sm text-gray-600 transition-colors font-medium">
                {term}
              </button>
            ))}
            {trending.length === 0 && ['lipstick', 'serum', 'handbag', 'kurta', 'heels', 'moisturizer'].map(t => (
              <button key={t} onClick={() => setSearchParams({ q: t })}
                className="px-4 py-2 bg-gray-100 hover:bg-pink-100 hover:text-[#e91e63] rounded-full text-sm text-gray-600 transition-colors">
                {t}
              </button>
            ))}
          </div>
        </div>
      )}

      {q && (
        <div>
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => <div key={i} className="skeleton aspect-square rounded-2xl" />)}
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-20">
              <Search size={48} className="mx-auto mb-4 text-gray-200" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No results for "{q}"</h3>
              <p className="text-gray-500">Try different keywords or browse our categories</p>
            </div>
          ) : (
            <>
              <p className="text-gray-500 text-sm mb-4">{results.length} results for "<strong className="text-gray-800">{q}</strong>"</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {results.map(p => <ProductCard key={p.id} product={p} />)}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
