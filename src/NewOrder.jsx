import { useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from './supabaseClient'

export default function NewOrder() {
  const [product, setProduct] = useState('')
  const [quantity, setQuantity] = useState('')
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')
    setSuccessMsg('')
    const newOrder = {
      order_id: uuidv4(),
      created_at: new Date().toISOString(),
      product,
      quantity: Number(quantity),
      amount: parseFloat(amount),
      source: 'app',
    }
    const { error } = await supabase
      .from('orders')
      .insert([newOrder])
    if (error) {
      setErrorMsg(error.message)
    } else {
      setSuccessMsg('Order succesvol toegevoegd!')
      setProduct('')
      setQuantity('')
      setAmount('')
      setTimeout(() => navigate('/dashboard'), 1000)
    }
    setLoading(false)
  }

  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">Nieuwe Order</h2>
      <Link to="/dashboard" className="inline-block text-sm text-slate-900 hover:underline mb-4">
        Terug naar dashboard
      </Link>
      {errorMsg && (
        <div className="bg-red-200 text-red-800 p-2 rounded mb-4">
          {errorMsg}
        </div>
      )}
      {successMsg && (
        <div className="bg-green-200 text-green-800 p-2 rounded mb-4">
          {successMsg}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Product</label>
          <input
            type="text"
            className="border rounded px-3 py-2 w-full"
            value={product}
            onChange={(e) => setProduct(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Aantal</label>
          <input
            type="number"
            className="border rounded px-3 py-2 w-full"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Bedrag</label>
          <input
            type="number"
            step="0.01"
            className="border rounded px-3 py-2 w-full"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-slate-900 px-4 py-2 rounded hover:bg-slate-800"
        >
          {loading ? 'Verzenden...' : 'Verstuur Order'}
        </button>
      </form>
    </div>
  )
}