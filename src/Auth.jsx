import { useState } from 'react'
import { supabase } from './supabaseClient'

export default function Auth() {
  const [email, setEmail] = useState('')

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithOtp({ email })
    if (error) {
      alert('Error signing in: ' + error.message)
    } else {
      alert('Magic link sent! Check your email.')
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold mb-6">Thais Restaurant</h1>
      <h2 className="text-2xl font-bold mb-4">Sign in</h2>
      <input
        type="email"
        placeholder="Your email"
        className="border rounded px-3 py-2 mb-4 w-64"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button
        className="bg-slate-900 px-4 py-2 rounded hover:bg-slate-800"
        onClick={handleLogin}
      >
        Send Magic Link
      </button>
    </div>
  )
}