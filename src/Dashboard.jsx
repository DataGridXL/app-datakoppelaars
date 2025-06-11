import { useEffect, useState, useMemo } from 'react'
import { supabase } from './supabaseClient'
import { Link } from 'react-router-dom'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js'
import { Line, Pie } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
)
export default function Dashboard() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [startDate, setStartDate] = useState(null)
  const [endDate, setEndDate] = useState(null)
  const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' })

  const fetchOrders = async () => {
    setLoading(true)
    const { data, error } = await supabase.from('orders').select('*')
    if (error) {
      console.error('Error fetching orders:', error)
    } else {
      setOrders(data)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  const clearFilters = () => {
    setStartDate(null)
    setEndDate(null)
  }

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const orderDate = new Date(order.created_at)
      if (startDate && orderDate < startDate) return false
      if (endDate) {
        const filterEnd = new Date(endDate)
        filterEnd.setHours(23, 59, 59, 999)
        if (orderDate > filterEnd) return false
      }
      return true
    })
  }, [orders, startDate, endDate])

  const sortedOrders = useMemo(() => {
    const sortable = [...filteredOrders]
    if (sortConfig.key) {
      sortable.sort((a, b) => {
        let aValue = a[sortConfig.key]
        let bValue = b[sortConfig.key]
        if (sortConfig.key === 'created_at') {
          aValue = new Date(aValue)
          bValue = new Date(bValue)
        }
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1
        return 0
      })
    }
    return sortable
  }, [filteredOrders, sortConfig])

  const requestSort = key => {
    let direction = 'asc'
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }

  const revenueData = useMemo(() => {
    const grouping = {}
    filteredOrders.forEach(order => {
      const dateKey = new Date(order.created_at).toLocaleDateString()
      grouping[dateKey] = (grouping[dateKey] || 0) + parseFloat(order.amount)
    })
    const labels = Object.keys(grouping).sort((a, b) => new Date(a) - new Date(b))
    const data = labels.map(label => grouping[label])
    return {
      labels,
      datasets: [
        {
          label: 'Omzet',
          data,
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
        },
      ],
    }
  }, [filteredOrders])

  const topProductsData = useMemo(() => {
    const grouping = {}
    filteredOrders.forEach(order => {
      grouping[order.product] = (grouping[order.product] || 0) + order.quantity
    })
    const sorted = Object.entries(grouping)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
    const labels = sorted.map(([product]) => product)
    const data = sorted.map(([, qty]) => qty)
    const backgroundColors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF']
    return { labels, datasets: [{ data, backgroundColor: backgroundColors }] }
  }, [filteredOrders])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <div className="space-x-2">
          <Link
            to="/new-order"
            className="bg-slate-900 px-4 py-2 rounded hover:bg-slate-800"
          >
            Nieuwe Order
          </Link>
          <button
            className="bg-slate-900 px-4 py-2 rounded hover:bg-slate-800"
            onClick={handleSignOut}
          >
            Sign Out
          </button>
        </div>
      </div>
      <div className="mb-4 flex items-center space-x-2">
        <DatePicker
          selected={startDate}
          onChange={date => setStartDate(date)}
          dateFormat="yyyy-MM-dd"
          placeholderText="Van datum"
          className="border border-gray-300 rounded px-2 py-1"
        />
        <DatePicker
          selected={endDate}
          onChange={date => setEndDate(date)}
          dateFormat="yyyy-MM-dd"
          placeholderText="Tot datum"
          className="border border-gray-300 rounded px-2 py-1"
        />
        <button
          onClick={clearFilters}
          className="bg-slate-700 px-3 py-1 rounded hover:bg-slate-600"
        >
          Alle
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div>
          <h3 className="text-xl font-semibold mb-2">Omzet per dag</h3>
          <Line data={revenueData} />
        </div>
        <div>
          <h3 className="text-xl font-semibold mb-2">Top 5 producten</h3>
          <Pie data={topProductsData} />
        </div>
      </div>

      {loading ? (
        <p>Loading orders...</p>
      ) : (
        <table className="min-w-full bg-white border">
          <thead>
            <tr>
              <th onClick={() => requestSort('order_id')} className="py-2 px-4 border cursor-pointer">
                Order ID{sortConfig.key === 'order_id' ? (sortConfig.direction === 'asc' ? ' ▲' : ' ▼') : ''}
              </th>
              <th onClick={() => requestSort('created_at')} className="py-2 px-4 border cursor-pointer">
                Aangemaakt{sortConfig.key === 'created_at' ? (sortConfig.direction === 'asc' ? ' ▲' : ' ▼') : ''}
              </th>
              <th onClick={() => requestSort('product')} className="py-2 px-4 border cursor-pointer">
                Product{sortConfig.key === 'product' ? (sortConfig.direction === 'asc' ? ' ▲' : ' ▼') : ''}
              </th>
              <th onClick={() => requestSort('quantity')} className="py-2 px-4 border cursor-pointer">
                Aantal{sortConfig.key === 'quantity' ? (sortConfig.direction === 'asc' ? ' ▲' : ' ▼') : ''}
              </th>
              <th onClick={() => requestSort('amount')} className="py-2 px-4 border cursor-pointer">
                Bedrag{sortConfig.key === 'amount' ? (sortConfig.direction === 'asc' ? ' ▲' : ' ▼') : ''}
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedOrders.map(order => (
              <tr key={order.id}>
                <td className="py-2 px-4 border">{order.order_id}</td>
                <td className="py-2 px-4 border">
                  {new Date(order.created_at).toLocaleString()}
                </td>
                <td className="py-2 px-4 border">{order.product}</td>
                <td className="py-2 px-4 border">{order.quantity}</td>
                <td className="py-2 px-4 border">{order.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}