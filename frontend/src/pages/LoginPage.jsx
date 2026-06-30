import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Mail, Lock, User, Phone } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 bg-[#e91e63] rounded-full flex items-center justify-center text-white font-display font-bold text-xl">S</div>
            <span className="font-display font-bold text-2xl text-gray-900">Suman</span>
          </Link>
          <p className="text-gray-500 text-sm mt-1">Beauty & Fashion</p>
        </div>
        <div className="bg-white rounded-3xl shadow-xl p-8">
          <h1 className="font-display text-2xl font-bold text-gray-900 mb-1">{title}</h1>
          <p className="text-gray-500 text-sm mb-6">{subtitle}</p>
          {children}
        </div>
      </div>
    </div>
  )
}

export function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await login(form.email, form.password)
      navigate('/')
    } catch { } finally { setLoading(false) }
  }

  return (
    <AuthLayout title="Welcome back! 👋" subtitle="Sign in to continue shopping">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="email" placeholder="Email address" value={form.email}
            onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
            required className="input-field pl-10" />
        </div>
        <div className="relative">
          <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type={showPass ? 'text' : 'password'} placeholder="Password" value={form.password}
            onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
            required className="input-field pl-10 pr-10" />
          <button type="button" onClick={() => setShowPass(!showPass)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        <div className="flex justify-end">
          <Link to="/forgot-password" className="text-xs text-[#e91e63] hover:underline">Forgot password?</Link>
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full py-3 disabled:opacity-60">
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      {/* Demo credentials */}
      <div className="mt-4 bg-pink-50 rounded-xl p-3 text-xs text-gray-600">
        <p className="font-semibold mb-1">Demo Credentials:</p>
        <p>Admin: admin@suman.com / Admin@123</p>
        <p>User: priya@example.com / Admin@123</p>
      </div>

      <p className="text-center text-sm text-gray-500 mt-4">
        Don't have an account? <Link to="/signup" className="text-[#e91e63] font-semibold hover:underline">Sign up</Link>
      </p>
    </AuthLayout>
  )
}

export function SignupPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const { signup } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await signup(form)
      navigate('/')
    } catch { } finally { setLoading(false) }
  }

  return (
    <AuthLayout title="Create account ✨" subtitle="Join thousands of beauty lovers">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Full Name" value={form.name}
            onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
            required className="input-field pl-10" />
        </div>
        <div className="relative">
          <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="email" placeholder="Email address" value={form.email}
            onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
            required className="input-field pl-10" />
        </div>
        <div className="relative">
          <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="tel" placeholder="Phone Number" value={form.phone}
            onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
            className="input-field pl-10" />
        </div>
        <div className="relative">
          <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type={showPass ? 'text' : 'password'} placeholder="Password (min 6 chars)" value={form.password}
            onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
            required minLength={6} className="input-field pl-10 pr-10" />
          <button type="button" onClick={() => setShowPass(!showPass)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full py-3 disabled:opacity-60">
          {loading ? 'Creating account...' : 'Create Account'}
        </button>
        <p className="text-xs text-gray-400 text-center">
          By signing up, you agree to our Terms of Service and Privacy Policy
        </p>
      </form>
      <p className="text-center text-sm text-gray-500 mt-4">
        Already have an account? <Link to="/login" className="text-[#e91e63] font-semibold hover:underline">Sign in</Link>
      </p>
    </AuthLayout>
  )
}

export default LoginPage
