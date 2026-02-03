import React, { useState, useEffect } from 'react'
import { Plus, Search, Edit, Trash2, Eye } from 'lucide-react'
import DataTable from '../components/DataTable'
import Modal from '../components/Modal'
import { adminUsers } from '../services/api'
import toast from 'react-hot-toast'

export default function Users() {
  const [users, setUsers] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({ name: '', email: '', role: 'user' })
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [selectedUser, setSelectedUser] = useState(null)

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true)
        const response = await adminUsers.getAll(page, 10, searchTerm)
        setUsers(response.data.users)
      } catch (error) {
        console.error('Failed to fetch users:', error)
        toast.error('Failed to load users')
      } finally {
        setLoading(false)
      }
    }

    const debounceTimer = setTimeout(() => {
      fetchUsers()
    }, 500)

    return () => clearTimeout(debounceTimer)
  }, [page, searchTerm])

  const columns = [
    { key: 'username', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Role' },
    {
      key: 'createdAt',
      label: 'Join Date',
      render: (row) => new Date(row.createdAt).toLocaleDateString(),
    },
    {
      key: 'status',
      label: 'Status',
      render: () => (
        <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Active
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex space-x-2">
          <button
            className="p-2 hover:bg-blue-50 rounded transition-colors"
            title="View details"
          >
            <Eye size={18} className="text-blue-600" />
          </button>
          <button
            onClick={() => handleEditUser(row)}
            className="p-2 hover:bg-yellow-50 rounded transition-colors"
            title="Edit user"
          >
            <Edit size={18} className="text-yellow-600" />
          </button>
          <button
            onClick={() => handleDeleteUser(row._id)}
            className="p-2 hover:bg-red-50 rounded transition-colors"
            title="Delete user"
          >
            <Trash2 size={18} className="text-red-600" />
          </button>
        </div>
      ),
    },
  ]

  const handleAddUser = () => {
    setSelectedUser(null)
    setFormData({ name: '', email: '', role: 'user' })
    setIsModalOpen(true)
  }

  const handleEditUser = (user) => {
    setSelectedUser(user)
    setFormData({
      name: user.username,
      email: user.email,
      role: user.role,
    })
    setIsModalOpen(true)
  }

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return

    try {
      await adminUsers.deleteUser(userId)
      setUsers(users.filter((u) => u._id !== userId))
      toast.success('User deleted successfully')
    } catch (error) {
      console.error('Failed to delete user:', error)
      toast.error('Failed to delete user')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      if (selectedUser) {
        // Update existing user
        await adminUsers.updateUser(selectedUser._id, {
          username: formData.name,
          email: formData.email,
          role: formData.role,
        })
        toast.success('User updated successfully')
      }
      setIsModalOpen(false)
      // Refresh users list
      const response = await adminUsers.getAll(page, 10, searchTerm)
      setUsers(response.data.users)
    } catch (error) {
      console.error('Failed to save user:', error)
      toast.error('Failed to save user')
    }
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading users...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Users Management</h1>
          <p className="text-slate-600 mt-2">Manage and monitor all platform users</p>
        </div>
        <button
          onClick={handleAddUser}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          <span>Add User</span>
        </button>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
        <div className="flex space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setPage(1)
              }}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option>All Roles</option>
            <option>user</option>
            <option>moderator</option>
            <option>admin</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <DataTable columns={columns} data={users} title={`Total Users: ${users.length}`} />

      {/* Add/Edit User Modal */}
      <Modal
        isOpen={isModalOpen}
        title={selectedUser ? 'Edit User' : 'Add New User'}
        onClose={() => setIsModalOpen(false)}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter name"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter email"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="user">User</option>
              <option value="moderator">Moderator</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              {selectedUser ? 'Update User' : 'Add User'}
            </button>
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="flex-1 px-4 py-2 bg-slate-200 text-slate-900 rounded-lg hover:bg-slate-300 transition-colors font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
