import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, Key } from 'lucide-react'
import { authApi } from '../services/api'
import toast from 'react-hot-toast'

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(0) // 0=email, 1=otp, 2=reset
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const sendOtp = async (e) => {
    e.preventDefault(); setLoading(true)
    try { await authApi.forgotPassword(email); toast.success('OTP sent to your email!'); setStep(1) }
    catch { } finally { setLoading(false) }
  }

  const verifyOtp = async (e) => {
    e.preventDefault(); setLoading(true)
    try { await authApi.verifyOtp({ email, otp }); setStep(2) }
    catch { } finally { setLoading(false) }
  }

  const resetPassword = async (e) => {
    e.preventDefault(); setLoading(true)
    try {
      await authApi.resetPassword({ email, otp, newPassword: password })
      toast.success('Password reset successfully!')
      navigate('/login')
    } catch { } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 bg-[#e91e63] rounded-full flex items-center justify-center text-white font-display font-bold text-xl">S</div>
            <span className="font-display font-bold text-2xl">Suman</span>
          </Link>
        </div>
        <div className="bg-white rounded-3xl shadow-xl p-8">
          <h1 className="font-display text-2xl font-bold mb-1">Reset Password</h1>
          <p className="text-gray-500 text-sm mb-6">
            {step === 0 ? 'Enter your email to receive an OTP' : step === 1 ? 'Enter the OTP sent to your email' : 'Create your new password'}
          </p>

          {/* Progress */}
          <div className="flex gap-2 mb-6">
            {['Email', 'Verify OTP', 'New Password'].map((s, i) => (
              <div key={s} className={`flex-1 h-1 rounded-full transition-colors ${i <= step ? 'bg-[#e91e63]' : 'bg-gray-200'}`} />
            ))}
          </div>

          {step === 0 && (
            <form onSubmit={sendOtp} className="space-y-4">
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="email" placeholder="Your email address" value={email}
                  onChange={e => setEmail(e.target.value)} required className="input-field pl-10" />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full py-3">
                {loading ? 'Sending...' : 'Send OTP'}
              </button>
            </form>
          )}

          {step === 1 && (
            <form onSubmit={verifyOtp} className="space-y-4">
              <div className="relative">
                <Key size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" placeholder="6-digit OTP" value={otp}
                  onChange={e => setOtp(e.target.value)} required maxLength={6} className="input-field pl-10 tracking-[0.3em] font-bold text-center" />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full py-3">
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>
              <button type="button" onClick={() => setStep(0)} className="w-full text-sm text-gray-500 hover:text-[#e91e63]">
                ← Back to email
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={resetPassword} className="space-y-4">
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="password" placeholder="New password (min 6 chars)" value={password}
                  onChange={e => setPassword(e.target.value)} required minLength={6} className="input-field pl-10" />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full py-3">
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          )}

          <p className="text-center text-sm text-gray-500 mt-4">
            <Link to="/login" className="text-[#e91e63] hover:underline">← Back to login</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
