import { useState } from 'react'
import { supabase } from './supabaseClient'

export default function Auth() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginType, setLoginType] = useState('magic')

  const handleLogin = async () => {
    if (loginType === 'magic') {
      const { error } = await supabase.auth.signInWithOtp({ email })
      if (error) {
        alert('Error signing in: ' + error.message)
      } else {
        alert('Magic link sent! Check your email.')
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        alert('Error signing in: ' + error.message)
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white">
      <div className="bg-white p-8 rounded-lg shadow-sm w-full max-w-md text-center space-y-6">
        <h1 className="text-4xl font-bold text-gray-900">Thais Restaurant</h1>
        <h2 className="text-xl text-gray-600">Sign in</h2>
        <div className="flex justify-center space-x-2">
          <button
            onClick={() => setLoginType('magic')}
            className={`px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
              loginType === 'magic'
                ? 'bg-blue-600'
                : 'bg-white text-gray-700 border border-gray-300'
            }`}
          >
            Magic Link
          </button>
          <button
            onClick={() => setLoginType('password')}
            className={`px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
              loginType === 'password'
                ? 'bg-blue-600'
                : 'bg-white text-gray-700 border border-gray-300'
            }`}
          >
            Username + Password
          </button>
        </div>
        <div className="space-y-4">
          <input
            type="email"
            placeholder="Your email"
            className="w-full border border-gray-300 rounded-md px-3 py-2 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {loginType === 'password' && (
            <input
              type="password"
              placeholder="Your password"
              className="w-full border border-gray-300 rounded-md px-3 py-2 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          )}
        </div>
        <button
          className="w-full bg-blue-600 hover:bg-blue-700 font-medium px-4 py-2 rounded-md shadow transition-colors"
          onClick={handleLogin}
        >
          {loginType === 'magic' ? 'Send Magic Link' : 'Sign In'}
        </button>
      </div>
    </div>
  )
}