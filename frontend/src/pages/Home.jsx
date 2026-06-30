import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ChevronRight, Sparkles, TrendingUp, Star, Truck, Shield, RotateCcw, Headphones } from 'lucide-react'
import { productApi, categoryApi } from '../services/api'
import ProductCard from '../components/product/ProductCard'
import { useAuth } from '../context/AuthContext'

const HERO_SLIDES = [
  {
    title: 'Glow Up\nThis Season',
    subtitle: 'Discover 5000+ beauty & fashion products',
    cta: 'Shop Beauty',
    link: '/products?category=makeup',
    bg: 'from-pink-100 to-rose-50',
    accent: '#e91e63',
    emoji: '💄✨',
    image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&q=80',
  },
  {
    title: 'New Arrivals\nin Fashion',
    subtitle: 'Latest trends in bags, shoes & clothing',
    cta: 'Shop Fashion',
    link: '/products?category=clothing',
    bg: 'from-purple-100 to-pink-50',
    accent: '#9c27b0',
    emoji: '👗👜',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80',
  },
  {
    title: 'Skincare\nEssentials',
    subtitle: 'Serums, moisturizers & more for radiant skin',
    cta: 'Shop Skincare',
    link: '/products?category=skincare',
    bg: 'from-green-100 to-emerald-50',
    accent: '#4caf50',
    emoji: '🌿✨',
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&q=80',
  },
]

const BENEFITS = [
  { icon: Truck, label: 'Free Shipping', desc: 'On orders above ₹499' },
  { icon: Shield, label: '100% Authentic', desc: 'Verified genuine products' },
  { icon: RotateCcw, label: 'Easy Returns', desc: '15-day return policy' },
  { icon: Headphones, label: '24/7 Support', desc: 'Always here for you' },
]

export default function Home() {
  const [featured, setFeatured] = useState([])
  const [trending, setTrending] = useState([])
  const [recommendations, setRecommendations] = useState([])
  const [categories, setCategories] = useState([])
  const [heroIndex, setHeroIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    fetchData()
    const interval = setInterval(() => setHeroIndex(i => (i + 1) % HERO_SLIDES.length), 5000)
    return () => clearInterval(interval)
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [featRes, trendRes, catRes] = await Promise.all([
        productApi.getFeatured(),
        productApi.getTrending(),
        categoryApi.getAll(),
      ])
      setFeatured(featRes.data?.slice(0, 8) || [])
      setTrending(trendRes.data?.slice(0, 8) || [])
      setCategories(catRes.data || [])

      if (user?.id) {
        const recRes = await productApi.getRecommendations(user.id)
        setRecommendations(recRes.data?.slice(0, 4) || [])
      }
    } catch { /* silent */ } finally {
      setLoading(false)
    }
  }

  const hero = HERO_SLIDES[heroIndex]

  return (
    <div className="min-h-screen">

      {/* Hero Section */}
      <section className={`bg-gradient-to-br ${hero.bg} transition-all duration-700`}>
        <div className="max-w-7xl mx-auto px-4 py-12 md:py-20">
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16">
            <div className="flex-1 text-center md:text-left">
              <div className="text-4xl mb-3">{hero.emoji}</div>
              <h1 className="font-display text-4xl md:text-6xl font-bold text-gray-900 mb-4 leading-tight whitespace-pre-line">
                {hero.title}
              </h1>
              <p className="text-lg text-gray-600 mb-8">{hero.subtitle}</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
                <Link to={hero.link}
                  className="btn-primary inline-flex items-center gap-2 text-base py-3 px-8">
                  {hero.cta} <ChevronRight size={18} />
                </Link>
                <Link to="/products"
                  className="btn-outline inline-flex items-center gap-2 text-base py-3 px-8">
                  Browse All
                </Link>
              </div>

              {/* Slide indicators */}
              <div className="flex gap-2 mt-6 justify-center md:justify-start">
                {HERO_SLIDES.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setHeroIndex(i)}
                    className={`h-2 rounded-full transition-all duration-300 ${i === heroIndex ? 'w-8 bg-[#e91e63]' : 'w-2 bg-gray-300'}`}
                  />
                ))}
              </div>
            </div>
            <div className="flex-1 max-w-md">
              <img
                src={hero.image}
                alt="Hero"
                className="w-full h-72 md:h-96 object-cover rounded-3xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Benefits bar */}
      <section className="bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {BENEFITS.map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex items-center gap-3 py-2">
                <div className="w-10 h-10 bg-pink-50 rounded-full flex items-center justify-center shrink-0">
                  <Icon size={20} className="text-[#e91e63]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{label}</p>
                  <p className="text-xs text-gray-500">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="section-title">Shop by Category</h2>
              <p className="text-gray-500 text-sm">Find exactly what you're looking for</p>
            </div>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-3">
            {(categories.length > 0 ? categories : [
              { name: 'Makeup', slug: 'makeup', image: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=200' },
              { name: 'Skincare', slug: 'skincare', image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=200' },
              { name: 'Bags', slug: 'bags', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=200' },
              { name: 'Shoes', slug: 'shoes', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200' },
              { name: 'Clothing', slug: 'clothing', image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=200' },
              { name: 'Haircare', slug: 'haircare', image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=200' },
              { name: 'Fragrance', slug: 'fragrance', image: 'https://images.unsplash.com/photo-1541643600914-78b084683702?w=200' },
            ]).map(cat => (
              <Link
                key={cat.slug}
                to={`/products?category=${cat.slug}`}
                className="flex flex-col items-center gap-2 group"
              >
                <div className="w-full aspect-square rounded-2xl overflow-hidden border-2 border-transparent group-hover:border-[#e91e63] transition-all shadow-sm">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <span className="text-xs font-semibold text-gray-700 group-hover:text-[#e91e63] transition-colors text-center">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* AI Recommendations */}
      {user && recommendations.length > 0 && (
        <section className="py-12 bg-gradient-to-r from-pink-50 to-purple-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={22} className="text-[#e91e63]" />
              <h2 className="section-title mb-0">Recommended for You</h2>
            </div>
            <p className="text-gray-500 text-sm mb-6">Based on your browsing and purchase history</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {recommendations.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="section-title">Featured Products</h2>
              <p className="text-gray-500 text-sm">Hand-picked by our beauty experts</p>
            </div>
            <Link to="/products?featured=true" className="text-sm text-[#e91e63] font-semibold hover:underline flex items-center gap-1">
              See all <ChevronRight size={16} />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="rounded-2xl overflow-hidden">
                  <div className="skeleton aspect-square" />
                  <div className="p-3 space-y-2">
                    <div className="skeleton h-4 rounded w-3/4" />
                    <div className="skeleton h-4 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {featured.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </section>

      {/* Promo Banner */}
      <section className="py-6">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-gradient-to-r from-[#e91e63] to-[#9c27b0] rounded-3xl p-8 md:p-12 text-white relative overflow-hidden">
            <div className="absolute right-0 top-0 text-9xl opacity-20 pointer-events-none select-none">💄</div>
            <div className="relative z-10">
              <p className="text-pink-200 font-medium mb-2">Limited Time Offer</p>
              <h3 className="font-display text-3xl md:text-4xl font-bold mb-3">
                Up to 50% OFF<br />on Premium Brands
              </h3>
              <p className="text-pink-100 mb-6 max-w-md">
                Shop from MAC, Lakme, L'Oreal, Forest Essentials and more at never-before prices.
              </p>
              <Link to="/products" className="bg-white text-[#e91e63] font-bold px-6 py-3 rounded-xl hover:bg-pink-50 transition-colors inline-flex items-center gap-2">
                Shop Now <ChevronRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trending */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp size={22} className="text-orange-500" />
                <h2 className="section-title mb-0">Trending Now 🔥</h2>
              </div>
              <p className="text-gray-500 text-sm">Most loved products this week</p>
            </div>
            <Link to="/products?trending=true" className="text-sm text-[#e91e63] font-semibold hover:underline flex items-center gap-1">
              View all <ChevronRight size={16} />
            </Link>
          </div>
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="rounded-2xl overflow-hidden">
                  <div className="skeleton aspect-square" />
                  <div className="p-3 space-y-2">
                    <div className="skeleton h-4 rounded w-3/4" />
                    <div className="skeleton h-4 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {trending.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="section-title mb-2">What Our Customers Say</h2>
          <p className="text-gray-500 text-sm mb-10">Real reviews from real shoppers</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: 'Priya S.', text: 'Amazing quality products! The skincare range completely transformed my skin in just 2 weeks.', rating: 5, city: 'Mumbai' },
              { name: 'Anjali K.', text: 'Fast delivery and genuine products. The packaging is so beautiful, feels like a luxury gift!', rating: 5, city: 'Delhi' },
              { name: 'Sneha R.', text: 'Best fashion e-commerce app! The AI recommendations are super accurate. Highly recommend!', rating: 5, city: 'Bangalore' },
            ].map(({ name, text, rating, city }) => (
              <div key={name} className="card p-6 text-left">
                <div className="flex mb-3">
                  {[...Array(rating)].map((_, i) => (
                    <Star key={i} size={16} className="text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 text-sm leading-relaxed mb-4">"{text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-[#e91e63] rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {name[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-gray-800">{name}</p>
                    <p className="text-xs text-gray-400">{city}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
