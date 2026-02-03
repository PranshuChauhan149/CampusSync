import React, { useState, useEffect } from 'react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { adminDashboard } from '../services/api'
import toast from 'react-hot-toast'

export default function Chart({ type = 'line', title }) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        setLoading(true)
        const response = await adminDashboard.getActivityChart()
        setData(response.data.data || [])
      } catch (error) {
        console.error('Failed to fetch chart data:', error)
        toast.error('Failed to load chart data')
        // Fallback to empty data
        setData([])
      } finally {
        setLoading(false)
      }
    }

    fetchChartData()
  }, [])

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        {title && <h3 className="text-lg font-semibold text-slate-900 mb-4">{title}</h3>}
        <div className="flex items-center justify-center h-300">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
      {title && <h3 className="text-lg font-semibold text-slate-900 mb-4">{title}</h3>}
      <ResponsiveContainer width="100%" height={300}>
        {type === 'line' ? (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="users" stroke="#3b82f6" strokeWidth={2} name="Users" />
            <Line type="monotone" dataKey="books" stroke="#10b981" strokeWidth={2} name="Books" />
            <Line type="monotone" dataKey="items" stroke="#f59e0b" strokeWidth={2} name="Items" />
          </LineChart>
        ) : (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="users" fill="#3b82f6" name="Users" />
            <Bar dataKey="books" fill="#10b981" name="Books" />
            <Bar dataKey="items" fill="#f59e0b" name="Items" />
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  )
}
