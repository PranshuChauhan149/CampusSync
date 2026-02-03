import React, { useState, useEffect } from 'react'
import StatCard from '../components/StatCard'
import DataTable from '../components/DataTable'
import Chart from '../components/Chart'
import { Users, BookOpen, Package, TrendingUp } from 'lucide-react'
import { adminDashboard } from '../services/api'
import toast from 'react-hot-toast'

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [recentActivity, setRecentActivity] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        const [statsRes, activityRes] = await Promise.all([
          adminDashboard.getStats(),
          adminDashboard.getRecentActivity(),
        ])

        setStats(statsRes.data)
        setRecentActivity(activityRes.data)
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
        toast.error('Failed to load dashboard')
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  const recentUsers = recentActivity?.recentUsers || []

  const userColumns = [
    { key: 'username', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'createdAt', label: 'Join Date', render: (row) => new Date(row.createdAt).toLocaleDateString() },
    {
      key: 'status',
      label: 'Status',
      render: () => (
        <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Active
        </span>
      ),
    },
  ]

  return (
    <div className="p-6 space-y-6 animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-600 mt-2">Welcome back! Here's what's happening.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Users}
          label="Total Users"
          value={stats?.totalUsers?.toLocaleString() || '0'}
          change="12"
          color="blue"
        />
        <StatCard
          icon={BookOpen}
          label="Total Books"
          value={stats?.totalBooks?.toLocaleString() || '0'}
          change="8"
          color="green"
        />
        <StatCard
          icon={Package}
          label="Lost Items"
          value={stats?.totalItems?.toLocaleString() || '0'}
          change="5"
          color="purple"
        />
        <StatCard
          icon={TrendingUp}
          label="Active Sessions"
          value={stats?.activeUsers?.toLocaleString() || '0'}
          change="15"
          color="orange"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Chart type="line" title="Monthly Activity" />
        <Chart type="bar" title="Statistics Overview" />
      </div>

      {/* Recent Users */}
      {recentUsers.length > 0 && (
        <DataTable columns={userColumns} data={recentUsers} title="Recent Users" />
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg p-6 hover:shadow-lg transition-shadow">
          <h3 className="font-semibold text-lg">Manage Users</h3>
          <p className="text-blue-100 text-sm mt-1">View and manage all users</p>
        </button>
        <button className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg p-6 hover:shadow-lg transition-shadow">
          <h3 className="font-semibold text-lg">Verify Books</h3>
          <p className="text-green-100 text-sm mt-1">Check pending book listings</p>
        </button>
        <button className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg p-6 hover:shadow-lg transition-shadow">
          <h3 className="font-semibold text-lg">Lost Items</h3>
          <p className="text-purple-100 text-sm mt-1">Review lost and found items</p>
        </button>
      </div>
    </div>
  )
}
