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
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto bg-white shadow-sm border border-gray-200 rounded-lg p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="text-3xl font-bold text-gray-900">Nieuwe Order</h2>
          <Link
            to="/dashboard"
            className="text-sm text-blue-600 hover:underline"
          >
            Terug naar dashboard
          </Link>
        </div>
        {errorMsg && (
          <div className="bg-red-100 text-red-800 px-4 py-2 rounded">
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="bg-green-100 text-green-800 px-4 py-2 rounded">
            {successMsg}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product
            </label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={product}
              onChange={(e) => setProduct(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Aantal
            </label>
            <input
              type="number"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bedrag
            </label>
            <input
              type="number"
              step="0.01"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>
          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 font-medium px-4 py-2 rounded-md shadow transition-colors"
            >
              {loading ? 'Verzenden...' : 'Verstuur Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}