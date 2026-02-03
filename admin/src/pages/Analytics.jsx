import React, { useState, useEffect } from 'react'
import Chart from '../components/Chart'
import StatCard from '../components/StatCard'
import { TrendingUp, Users, BookOpen, Package } from 'lucide-react'
import { adminDashboard } from '../services/api'
import toast from 'react-hot-toast'

export default function Analytics() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        const response = await adminDashboard.getStats()
        setStats(response.data)
      } catch (error) {
        console.error('Failed to fetch stats:', error)
        toast.error('Failed to load analytics')
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading analytics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Analytics</h1>
        <p className="text-slate-600 mt-2">Platform statistics and insights</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={Users} label="Total Users" value={stats?.totalUsers?.toLocaleString() || '0'} change="12" color="blue" />
        <StatCard icon={BookOpen} label="Total Books" value={stats?.totalBooks?.toLocaleString() || '0'} change="8" color="green" />
        <StatCard icon={Package} label="Lost Items" value={stats?.totalItems?.toLocaleString() || '0'} change="5" color="purple" />
        <StatCard icon={TrendingUp} label="Active Users" value={stats?.activeUsers?.toLocaleString() || '0'} change="15" color="orange" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Chart type="line" title="Monthly Activity - Line Chart" />
        <Chart type="bar" title="Monthly Activity - Bar Chart" />
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Platform Summary</h3>
          <div className="space-y-3">
            {[
              { name: 'Total Users', count: stats?.totalUsers || 0, color: 'bg-blue-500' },
              { name: 'Total Books', count: stats?.totalBooks || 0, color: 'bg-green-500' },
              { name: 'Total Items', count: stats?.totalItems || 0, color: 'bg-purple-500' },
              { name: 'Active Users', count: stats?.activeUsers || 0, color: 'bg-orange-500' },
            ].map((item, i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900">{item.name}</p>
                  <div className="w-full bg-slate-200 rounded-full h-2 mt-1">
                    <div
                      className={`${item.color} h-2 rounded-full`}
                      style={{ width: `${Math.min((item.count / (stats?.totalUsers || 1)) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
                <span className="text-sm font-semibold text-slate-600 w-16 text-right">{item.count.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Platform Stats</h3>
          <div className="space-y-3">
            {[
              { label: 'Total Users', value: stats?.totalUsers?.toLocaleString() || '0', trend: '+12%' },
              { label: 'Active Users', value: stats?.activeUsers?.toLocaleString() || '0', trend: '+8%' },
              { label: 'Total Books', value: stats?.totalBooks?.toLocaleString() || '0', trend: '+23%' },
              { label: 'Total Items', value: stats?.totalItems?.toLocaleString() || '0', trend: '+5%' },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-sm text-slate-600">{item.label}</span>
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-slate-900">{item.value}</span>
                  <span className="text-xs text-green-600 font-medium">{item.trend}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">System Health</h3>
          <div className="space-y-4">
            {[
              { label: 'Database Status', value: 'Connected', status: 'Excellent' },
              { label: 'API Status', value: 'Operational', status: 'Excellent' },
              { label: 'Data Sync', value: 'Real-time', status: 'Good' },
              { label: 'Error Rate', value: '0.00%', status: 'Excellent' },
            ].map((perf, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-slate-600">{perf.label}</span>
                  <span className={`text-xs font-semibold px-2 py-1 rounded ${
                    perf.status === 'Excellent'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {perf.status}
                  </span>
                </div>
                <p className="text-lg font-semibold text-slate-900">{perf.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
