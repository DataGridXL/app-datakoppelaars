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

const formatOrderId = id =>
  typeof id === 'string' && id.length > 4
    ? `${id.slice(0, 2)}...${id.slice(-2)}`
    : id

const formatCreatedAt = timestamp => {
  const date = new Date(timestamp)
  const day = date.getDate()
  const month = date.getMonth() + 1
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  return (
    <>
      {`${day}-${month}`}
      <br />
      {`${hours}:${minutes}`}
    </>
  )
}

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Dashboard</h1>
          <Link
            to="/new-order"
            className="bg-grey-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg shadow-sm transition-colors"
          >
            Nieuwe Order
          </Link>
        </div>

        <div className="bg-white shadow-sm border border-gray-200 rounded p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700">Van datum</label>
                <DatePicker
                  selected={startDate}
                  onChange={date => setStartDate(date)}
                  dateFormat="yyyy-MM-dd"
                  placeholderText="Van datum"
                  className="border border-gray-300 rounded px-2 py-1 w-full sm:w-auto"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700">Tot datum</label>
                <DatePicker
                  selected={endDate}
                  onChange={date => setEndDate(date)}
                  dateFormat="yyyy-MM-dd"
                  placeholderText="Tot datum"
                  className="border border-gray-300 rounded px-2 py-1 w-full sm:w-auto"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700 opacity-0 sm:opacity-100">Reset</label>
              <button
                onClick={clearFilters}
                className="border border-gray-300 px-4 py-2 rounded hover:bg-gray-50"
              >
                Alle
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white shadow-sm border border-gray-200 rounded p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Omzet per dag</h3>
            <div className="h-[300px] w-full">
              <Line data={revenueData} />
            </div>
          </div>

          <div className="bg-white shadow-sm border border-gray-200 rounded p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Top 5 producten</h3>
            <div className="h-[300px] w-full">
              <Pie data={topProductsData} />
            </div>
          </div>
        </div>

        {loading ? (
          <p>Loading orders...</p>
        ) : (
          <div className="bg-white shadow-sm border border-gray-200 rounded p-4 overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th
                    onClick={() => requestSort('order_id')}
                    className="text-left py-2 px-3 font-medium text-gray-700 cursor-pointer"
                  >
                    Order ID{sortConfig.key === 'order_id' ? (sortConfig.direction === 'asc' ? ' ▲' : ' ▼') : ''}
                  </th>
                  <th
                    onClick={() => requestSort('created_at')}
                    className="text-left py-2 px-3 font-medium text-gray-700 cursor-pointer"
                  >
                    Aangemaakt{sortConfig.key === 'created_at' ? (sortConfig.direction === 'asc' ? ' ▲' : ' ▼') : ''}
                  </th>
                  <th
                    onClick={() => requestSort('product')}
                    className="text-left py-2 px-3 font-medium text-gray-700 cursor-pointer"
                  >
                    Product{sortConfig.key === 'product' ? (sortConfig.direction === 'asc' ? ' ▲' : ' ▼') : ''}
                  </th>
                  <th
                    onClick={() => requestSort('quantity')}
                    className="text-left py-2 px-3 font-medium text-gray-700 cursor-pointer"
                  >
                    Aantal{sortConfig.key === 'quantity' ? (sortConfig.direction === 'asc' ? ' ▲' : ' ▼') : ''}
                  </th>
                  <th
                    onClick={() => requestSort('amount')}
                    className="text-left py-2 px-3 font-medium text-gray-700 cursor-pointer"
                  >
                    Bedrag{sortConfig.key === 'amount' ? (sortConfig.direction === 'asc' ? ' ▲' : ' ▼') : ''}
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedOrders.map(order => (
                  <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-3 font-mono text-sm text-blue-600">{formatOrderId(order.order_id)}</td>
                    <td className="py-3 px-3 text-gray-600">{formatCreatedAt(order.created_at)}</td>
                    <td className="py-3 px-3 text-gray-800">{order.product}</td>
                    <td className="py-3 px-3 text-gray-800">{order.quantity}</td>
                    <td className="py-3 px-3 text-gray-800">{order.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex justify-center pt-8">
          <button
            className="bg-slate-900 px-6 py-3 rounded-lg hover:bg-slate-800 transition-colors"
            onClick={handleSignOut}
          >
            Uitloggen
          </button>
        </div>
      </div>
    </div>
  )
}