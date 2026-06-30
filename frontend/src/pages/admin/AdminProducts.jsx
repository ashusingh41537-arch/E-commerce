import { useState, useEffect } from 'react'
import { adminApi, productApi, categoryApi } from '../../services/api'
import { Plus, Edit2, Trash2, Search, Upload, X, Image } from 'lucide-react'
import toast from 'react-hot-toast'

export function AdminProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editProduct, setEditProduct] = useState(null)
  const [categories, setCategories] = useState([])
  const [saving, setSaving] = useState(false)

  // Form state
  const [form, setForm] = useState({
    name: '',
    shortDescription: '',
    price: '',
    comparePrice: '',
    stockQuantity: '',
    categoryId: '',
    isFeatured: false,
    isTrending: false,
    tags: ''
  })

  // Image state
  const [imageFiles, setImageFiles] = useState([])       // File objects
  const [imagePreviews, setImagePreviews] = useState([]) // Preview URLs
  const [imageUrls, setImageUrls] = useState([])         // Existing URLs (edit mode)

  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [])

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const r = await adminApi.getAllProducts()
      setProducts(r.data || [])
    } catch { } finally { setLoading(false) }
  }

  const fetchCategories = async () => {
    try {
      const r = await categoryApi.getAll()
      setCategories(r.data || [])
    } catch { }
  }

  const resetForm = () => {
    setForm({ name: '', shortDescription: '', price: '', comparePrice: '',
      stockQuantity: '', categoryId: '', isFeatured: false, isTrending: false, tags: '' })
    setImageFiles([])
    setImagePreviews([])
    setImageUrls([])
    setEditProduct(null)
  }

  const openAdd = () => {
    resetForm()
    setShowModal(true)
  }

  const openEdit = (p) => {
    setEditProduct(p)
    setForm({
      name: p.name || '',
      shortDescription: p.shortDescription || '',
      price: p.price || '',
      comparePrice: p.comparePrice || '',
      stockQuantity: p.stockQuantity || '',
      categoryId: '',
      isFeatured: p.isFeatured || false,
      isTrending: p.isTrending || false,
      tags: p.tags || ''
    })
    // Show existing image
    if (p.primaryImage) {
      setImageUrls([p.primaryImage])
    }
    setImageFiles([])
    setImagePreviews([])
    setShowModal(true)
  }

  // Handle image file selection
  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return

    // Validate file types
    const validFiles = files.filter(f => f.type.startsWith('image/'))
    if (validFiles.length !== files.length) {
      toast.error('Sirf image files select karo (jpg, png, webp)')
      return
    }

    // Validate file size (max 5MB each)
    const validSize = validFiles.filter(f => f.size <= 5 * 1024 * 1024)
    if (validSize.length !== validFiles.length) {
      toast.error('Image size 5MB se kam honi chahiye')
      return
    }

    setImageFiles(prev => [...prev, ...validSize])

    // Create previews
    validSize.forEach(file => {
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreviews(prev => [...prev, e.target.result])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeNewImage = (index) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index))
    setImagePreviews(prev => prev.filter((_, i) => i !== index))
  }

  const removeExistingImage = (index) => {
    setImageUrls(prev => prev.filter((_, i) => i !== index))
  }

  const handleSave = async () => {
    // Validation
    if (!form.name.trim()) { toast.error('Product name required'); return }
    if (!form.price) { toast.error('Price required'); return }

    setSaving(true)
    try {
      const productData = {
        name: form.name,
        shortDescription: form.shortDescription,
        price: parseFloat(form.price),
        comparePrice: form.comparePrice ? parseFloat(form.comparePrice) : null,
        stockQuantity: parseInt(form.stockQuantity) || 0,
        categoryId: form.categoryId ? parseInt(form.categoryId) : null,
        isFeatured: form.isFeatured,
        isTrending: form.isTrending,
        tags: form.tags
      }

      let savedProduct
      if (editProduct) {
        const res = await productApi.update(editProduct.id, productData)
        savedProduct = res.data
        toast.success('Product updated!')
      } else {
        const res = await productApi.create(productData)
        savedProduct = res.data
        toast.success('Product created!')
      }

      // Upload images if any selected
      if (imageFiles.length > 0 && savedProduct?.id) {
        const formData = new FormData()
        imageFiles.forEach(file => formData.append('images', file))
        try {
          await productApi.uploadImages(savedProduct.id, formData)
          toast.success('Images uploaded!')
        } catch (e) {
          toast.error('Product saved but image upload failed. Cloudinary configure karo.')
        }
      }

      setShowModal(false)
      resetForm()
      fetchProducts()
    } catch (e) {
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Is product ko delete karna chahte ho?')) return
    try {
      await productApi.delete(id)
      toast.success('Product deleted!')
      fetchProducts()
    } catch { }
  }

  const filtered = products.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        <button onClick={openAdd}
          className="flex items-center gap-2 bg-[#e91e63] hover:bg-[#c2185b] text-white px-5 py-2.5 rounded-xl font-semibold transition-colors">
          <Plus size={18} /> Add Product
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <div className="relative max-w-xs">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input placeholder="Search products..." value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[#e91e63]" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {['Product', 'Price', 'Stock', 'Rating', 'Sold', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                [...Array(3)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(6)].map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-gray-100 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.map(p => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={p.primaryImage || 'https://placehold.co/40x40/fdf2f8/e91e63?text=P'}
                        alt={p.name}
                        className="w-10 h-10 object-cover rounded-lg border border-gray-100"
                        onError={e => e.target.src = 'https://placehold.co/40x40/fdf2f8/e91e63?text=P'}
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-800 max-w-xs truncate">{p.name}</p>
                        <p className="text-xs text-gray-400">{p.categoryName || 'No category'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-semibold text-gray-900">₹{p.price?.toLocaleString()}</p>
                    {p.comparePrice > p.price && (
                      <p className="text-xs text-gray-400 line-through">₹{p.comparePrice?.toLocaleString()}</p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      p.stockQuantity > 10 ? 'bg-green-100 text-green-700' :
                      p.stockQuantity > 0 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'}`}>
                      {p.stockQuantity > 0 ? p.stockQuantity : 'Out of Stock'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    ⭐ {Number(p.averageRating || 0).toFixed(1)} ({p.reviewCount || 0})
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{p.soldCount || 0}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(p)}
                        className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                        <Edit2 size={15} />
                      </button>
                      <button onClick={() => handleDelete(p.id)}
                        className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && filtered.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <Image size={36} className="mx-auto mb-3 opacity-30" />
              <p>No products found</p>
            </div>
          )}
        </div>
      </div>

      {/* ===================== ADD/EDIT MODAL ===================== */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">
                {editProduct ? 'Edit Product' : 'Add Product'}
              </h2>
              <button onClick={() => { setShowModal(false); resetForm() }}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Product Name */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Product Name <span className="text-red-500">*</span>
                </label>
                <input
                  placeholder="e.g. Lakme Matte Lipstick"
                  value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#e91e63]"
                />
              </div>

              {/* Short Description */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Short Description</label>
                <input
                  placeholder="Short description..."
                  value={form.shortDescription}
                  onChange={e => setForm(p => ({ ...p, shortDescription: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#e91e63]"
                />
              </div>

              {/* Price Row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Price (₹) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number" placeholder="299"
                    value={form.price}
                    onChange={e => setForm(p => ({ ...p, price: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#e91e63]"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Compare Price (₹)</label>
                  <input
                    type="number" placeholder="499"
                    value={form.comparePrice}
                    onChange={e => setForm(p => ({ ...p, comparePrice: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#e91e63]"
                  />
                </div>
              </div>

              {/* Stock + Category */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Stock Quantity</label>
                  <input
                    type="number" placeholder="100"
                    value={form.stockQuantity}
                    onChange={e => setForm(p => ({ ...p, stockQuantity: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#e91e63]"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Category</label>
                  <select
                    value={form.categoryId}
                    onChange={e => setForm(p => ({ ...p, categoryId: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#e91e63] bg-white"
                  >
                    <option value="">Select Category</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Tags</label>
                <input
                  placeholder="lipstick,makeup,matte"
                  value={form.tags}
                  onChange={e => setForm(p => ({ ...p, tags: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#e91e63]"
                />
              </div>

              {/* Checkboxes */}
              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isFeatured}
                    onChange={e => setForm(p => ({ ...p, isFeatured: e.target.checked }))}
                    className="w-4 h-4 accent-[#e91e63]"
                  />
                  <span className="text-sm text-gray-700">Featured</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isTrending}
                    onChange={e => setForm(p => ({ ...p, isTrending: e.target.checked }))}
                    className="w-4 h-4 accent-[#e91e63]"
                  />
                  <span className="text-sm text-gray-700">Trending 🔥</span>
                </label>
              </div>

              {/* ✅ IMAGE UPLOAD SECTION */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Product Images
                </label>

                {/* Upload Button */}
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-[#e91e63] hover:bg-pink-50 transition-all">
                  <Upload size={24} className="text-gray-400 mb-2" />
                  <span className="text-sm text-gray-500">Click to select images</span>
                  <span className="text-xs text-gray-400 mt-1">JPG, PNG, WEBP • Max 5MB each</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                </label>

                {/* Existing Images (edit mode) */}
                {imageUrls.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs text-gray-500 mb-2">Current Images:</p>
                    <div className="flex flex-wrap gap-2">
                      {imageUrls.map((url, i) => (
                        <div key={i} className="relative group">
                          <img src={url} alt=""
                            className="w-16 h-16 object-cover rounded-lg border border-gray-200" />
                          <button
                            onClick={() => removeExistingImage(i)}
                            className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <X size={10} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* New Image Previews */}
                {imagePreviews.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs text-gray-500 mb-2">
                      New Images ({imagePreviews.length} selected):
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {imagePreviews.map((preview, i) => (
                        <div key={i} className="relative group">
                          <img src={preview} alt=""
                            className="w-16 h-16 object-cover rounded-lg border border-[#e91e63]" />
                          <button
                            onClick={() => removeNewImage(i)}
                            className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <X size={10} />
                          </button>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-orange-500 mt-2">
                      ⚠️ Images save hongi agar Cloudinary configured hai
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex gap-3 p-6 border-t border-gray-100">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 bg-[#e91e63] hover:bg-[#c2185b] text-white py-2.5 rounded-xl font-semibold transition-colors disabled:opacity-60">
                {saving ? 'Saving...' : editProduct ? 'Update Product' : 'Save Product'}
              </button>
              <button
                onClick={() => { setShowModal(false); resetForm() }}
                className="flex-1 border-2 border-gray-200 text-gray-600 hover:bg-gray-50 py-2.5 rounded-xl font-semibold transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminProducts
