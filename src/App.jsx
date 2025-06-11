import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Auth from './Auth'
import Dashboard from './Dashboard'
import NewOrder from './NewOrder'
import { supabase } from './supabaseClient'
import './App.css'

function App() {
  const [session, setSession] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={!session ? <Auth /> : <Navigate to="/dashboard" />}
        />
        <Route
          path="/dashboard"
          element={session ? <Dashboard /> : <Navigate to="/login" />}
        />
        <Route
          path="/new-order"
          element={session ? <NewOrder /> : <Navigate to="/login" />}
        />
        <Route
          path="*"
          element={<Navigate to={session ? '/dashboard' : '/login'} />}
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App
