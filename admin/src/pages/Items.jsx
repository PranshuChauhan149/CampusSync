import React, { useState, useEffect } from 'react'
import { Plus, Search, Edit, Trash2, CheckCircle } from 'lucide-react'
import DataTable from '../components/DataTable'
import Modal from '../components/Modal'
import { adminItems } from '../services/api'
import toast from 'react-hot-toast'

export default function Items() {
  const [items, setItems] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({ name: '', category: '', location: '' })
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)

  // Fetch items
  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true)
        const response = await adminItems.getAll(page, 10, searchTerm)
        setItems(response.data.items)
      } catch (error) {
        console.error('Failed to fetch items:', error)
        toast.error('Failed to load items')
      } finally {
        setLoading(false)
      }
    }

    const debounceTimer = setTimeout(() => {
      fetchItems()
    }, 500)

    return () => clearTimeout(debounceTimer)
  }, [page, searchTerm])

  const columns = [
    { key: 'title', label: 'Item Name' },
    { key: 'category', label: 'Category' },
    { key: 'location', label: 'Location' },
    {
      key: 'createdAt',
      label: 'Reported Date',
      render: (row) => new Date(row.createdAt).toLocaleDateString(),
    },
    {
      key: 'type',
      label: 'Status',
      render: (row) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            row.type === 'found'
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {row.type || 'lost'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex space-x-2">
          {row.type === 'lost' && (
            <button
              onClick={() => handleMarkAsFound(row._id)}
              className="p-2 hover:bg-green-50 rounded transition-colors"
              title="Mark as found"
            >
              <CheckCircle size={18} className="text-green-600" />
            </button>
          )}
          <button className="p-2 hover:bg-yellow-50 rounded transition-colors" title="Edit">
            <Edit size={18} className="text-yellow-600" />
          </button>
          <button
            onClick={() => handleDeleteItem(row._id)}
            className="p-2 hover:bg-red-50 rounded transition-colors"
            title="Delete"
          >
            <Trash2 size={18} className="text-red-600" />
          </button>
        </div>
      ),
    },
  ]

  const handleMarkAsFound = async (itemId) => {
    try {
      await adminItems.updateItem(itemId, { type: 'found' })
      setItems(
        items.map((item) =>
          item._id === itemId ? { ...item, type: 'found' } : item
        )
      )
      toast.success('Item marked as found')
    } catch (error) {
      console.error('Failed to update item:', error)
      toast.error('Failed to update item')
    }
  }

  const handleDeleteItem = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return

    try {
      await adminItems.deleteItem(itemId)
      setItems(items.filter((item) => item._id !== itemId))
      toast.success('Item deleted successfully')
    } catch (error) {
      console.error('Failed to delete item:', error)
      toast.error('Failed to delete item')
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setIsModalOpen(false)
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading items...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Lost & Found</h1>
          <p className="text-slate-600 mt-2">Manage lost and found items</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          <span>Add Item</span>
        </button>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
        <div className="flex space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setPage(1)
              }}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option>All Categories</option>
            <option>Bags</option>
            <option>Accessories</option>
            <option>Clothing</option>
            <option>Wallets</option>
          </select>
          <select className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option>All Status</option>
            <option value="lost">Lost</option>
            <option value="found">Found</option>
          </select>
        </div>
      </div>

      {/* Items Table */}
      <DataTable columns={columns} data={items} title={`Total Items: ${items.length}`} />

      {/* Add Item Modal */}
      <Modal isOpen={isModalOpen} title="Add New Item" onClose={() => setIsModalOpen(false)}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Item Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Item name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option>Select Category</option>
              <option>Bags</option>
              <option>Accessories</option>
              <option>Clothing</option>
              <option>Wallets</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Location"
            />
          </div>
          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Add Item
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
