'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signUp } from '@/services/auth'

export default function SignupPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signUp(email, password, name)
      router.replace('/dashboard')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Sign up failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FDF8F5] flex flex-col justify-center px-6 py-12">
      <div className="max-w-sm mx-auto w-full">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">🌸</div>
          <h1 className="text-3xl font-bold text-[#C4849B]">CherylCare</h1>
          <p className="text-gray-500 mt-2">Create your account</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          <input
            type="text"
            placeholder="Your name"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full px-4 py-3 rounded-2xl border border-[#F0E8E2] bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#C4849B]"
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-2xl border border-[#F0E8E2] bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#C4849B]"
            required
          />
          <input
            type="password"
            placeholder="Password (min 6 characters)"
            value={password}
            onChange={e => setPassword(e.target.value)}
            minLength={6}
            className="w-full px-4 py-3 rounded-2xl border border-[#F0E8E2] bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#C4849B]"
            required
          />

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-2xl bg-[#C4849B] text-white font-semibold disabled:opacity-60 transition-opacity"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-gray-500 mt-6 text-sm">
          Already have an account?{' '}
          <Link href="/login" className="text-[#C4849B] font-semibold">Sign In</Link>
        </p>
      </div>
    </div>
  )
}
