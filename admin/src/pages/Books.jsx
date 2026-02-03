import React, { useState, useEffect } from 'react'
import { Plus, Search, Edit, Trash2, Check, X } from 'lucide-react'
import DataTable from '../components/DataTable'
import Modal from '../components/Modal'
import { adminBooks } from '../services/api'
import toast from 'react-hot-toast'

export default function Books() {
  const [books, setBooks] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [filterStatus, setFilterStatus] = useState('all')
  const [formData, setFormData] = useState({ title: '', author: '', isbn: '', status: 'pending' })
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)

  // Fetch books
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true)
        const response = await adminBooks.getAll(page, 10, searchTerm)
        setBooks(response.data.books)
      } catch (error) {
        console.error('Failed to fetch books:', error)
        toast.error('Failed to load books')
      } finally {
        setLoading(false)
      }
    }

    const debounceTimer = setTimeout(() => {
      fetchBooks()
    }, 500)

    return () => clearTimeout(debounceTimer)
  }, [page, searchTerm])

  const columns = [
    { key: 'title', label: 'Title' },
    { key: 'author', label: 'Author' },
    {
      key: 'seller',
      label: 'Seller',
      render: (row) => row.seller?.username || 'N/A',
    },
    { key: 'price', label: 'Price' },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            row.status === 'approved'
              ? 'bg-green-100 text-green-800'
              : row.status === 'pending'
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {row.status || 'pending'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex space-x-2">
          {row.status === 'pending' && (
            <>
              <button
                onClick={() => handleApproveBook(row._id)}
                className="p-2 hover:bg-green-50 rounded transition-colors"
                title="Approve"
              >
                <Check size={18} className="text-green-600" />
              </button>
              <button
                onClick={() => handleRejectBook(row._id)}
                className="p-2 hover:bg-red-50 rounded transition-colors"
                title="Reject"
              >
                <X size={18} className="text-red-600" />
              </button>
            </>
          )}
          <button className="p-2 hover:bg-yellow-50 rounded transition-colors" title="Edit">
            <Edit size={18} className="text-yellow-600" />
          </button>
          <button
            onClick={() => handleDeleteBook(row._id)}
            className="p-2 hover:bg-red-50 rounded transition-colors"
            title="Delete"
          >
            <Trash2 size={18} className="text-red-600" />
          </button>
        </div>
      ),
    },
  ]

  const handleApproveBook = async (bookId) => {
    try {
      await adminBooks.approvePending(bookId)
      setBooks(books.map((b) => (b._id === bookId ? { ...b, status: 'approved' } : b)))
      toast.success('Book approved')
    } catch (error) {
      console.error('Failed to approve book:', error)
      toast.error('Failed to approve book')
    }
  }

  const handleRejectBook = async (bookId) => {
    try {
      await adminBooks.rejectPending(bookId)
      setBooks(books.map((b) => (b._id === bookId ? { ...b, status: 'rejected' } : b)))
      toast.success('Book rejected')
    } catch (error) {
      console.error('Failed to reject book:', error)
      toast.error('Failed to reject book')
    }
  }

  const handleDeleteBook = async (bookId) => {
    if (!window.confirm('Are you sure you want to delete this book?')) return

    try {
      await adminBooks.deleteBook(bookId)
      setBooks(books.filter((b) => b._id !== bookId))
      toast.success('Book deleted successfully')
    } catch (error) {
      console.error('Failed to delete book:', error)
      toast.error('Failed to delete book')
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
          <p className="text-slate-600">Loading books...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Books Management</h1>
          <p className="text-slate-600 mt-2">Manage and verify book listings</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          <span>Add Book</span>
        </button>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
        <div className="flex space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Search books..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setPage(1)
              }}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Books Table */}
      <DataTable columns={columns} data={books} title={`Total Books: ${books.length}`} />

      {/* Add Book Modal */}
      <Modal isOpen={isModalOpen} title="Add New Book" onClose={() => setIsModalOpen(false)}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Book title"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Author</label>
            <input
              type="text"
              value={formData.author}
              onChange={(e) => setFormData({ ...formData, author: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Author name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">ISBN</label>
            <input
              type="text"
              value={formData.isbn}
              onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="ISBN number"
            />
          </div>
          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Add Book
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
