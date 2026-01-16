import React, { useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import { Mail, Lock, User } from 'lucide-react'

export const AuthPage: React.FC = () => {
  const [isSignup, setIsSignup] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const signup = useAuthStore((state) => state.signup)
  const login = useAuthStore((state) => state.login)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      if (isSignup) {
        if (!name) {
          setError('Name is required')
          setIsLoading(false)
          return
        }
        await signup(email, name)
      } else {
        await login(email)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-blue-50 to-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-xl bg-brand-600 flex items-center justify-center text-white font-bold text-3xl mx-auto mb-4 shadow-lg">
            T
          </div>
          <h1 className="text-3xl font-bold text-content-primary">Todone</h1>
          <p className="text-content-secondary mt-2">From to-do to todone</p>
        </div>

        {/* Card */}
        <div className="bg-surface-primary rounded-xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-content-primary mb-6 text-center">
            {isSignup ? 'Create Account' : 'Welcome Back'}
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignup && (
              <Input
                label="Full Name"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                icon={<User className="w-4 h-4" />}
                required
              />
            )}

            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail className="w-4 h-4" />}
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<Lock className="w-4 h-4" />}
              required
            />

            <Button type="submit" variant="primary" className="w-full mt-6" isLoading={isLoading}>
              {isSignup ? 'Create Account' : 'Sign In'}
            </Button>
          </form>

          {/* Toggle Auth Mode */}
          <p className="text-center text-content-secondary text-sm mt-6">
            {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              onClick={() => {
                setIsSignup(!isSignup)
                setError('')
                setEmail('')
                setPassword('')
                setName('')
              }}
              className="text-brand-600 font-medium hover:text-brand-700"
            >
              {isSignup ? 'Sign In' : 'Sign Up'}
            </button>
          </p>
        </div>

        {/* Demo Credentials */}
        <div className="mt-6 p-4 bg-white/50 backdrop-blur rounded-lg">
          <p className="text-xs text-content-secondary text-center">
            Try Demo: demo@todone.app / password
          </p>
        </div>
      </div>
    </div>
  )
}
