import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useTheme } from '../contexts/ThemeContext'
import { useAuth } from '../contexts/AuthContext'
import { itemsAPI, booksAPI } from '../services/api'
import { toast } from 'react-toastify'
import {
  Package,
  BookOpen,
  Edit3,
  Trash2,
  X,
  ArrowRight,
  CheckCircle2,
  Circle
} from 'lucide-react'

const AllItemDetals = () => {
  const { isDarkMode } = useTheme()
  const { isAuthenticated } = useAuth()

  const [myItems, setMyItems] = useState([])
  const [myBooks, setMyBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedItems, setSelectedItems] = useState(new Set())

  const [editingItem, setEditingItem] = useState(null)
  const [itemForm, setItemForm] = useState({
    title: '',
    description: '',
    type: 'lost',
    category: 'electronics',
    location: '',
    status: 'active',
    date: ''
  })
  const [savingItem, setSavingItem] = useState(false)
  const [deletingItemId, setDeletingItemId] = useState(null)

  const [editingBook, setEditingBook] = useState(null)
  const [bookForm, setBookForm] = useState({
    title: '',
    author: '',
    price: '',
    status: 'available'
  })
  const [savingBook, setSavingBook] = useState(false)
  const [deletingBookId, setDeletingBookId] = useState(null)

  useEffect(() => {
    if (!isAuthenticated) return
    const fetchData = async () => {
      try {
        setLoading(true)
        const [itemsRes, booksRes] = await Promise.all([
          itemsAPI.getMyItems(),
          booksAPI.getMyBooks()
        ])
        setMyItems(itemsRes.data?.data || [])
        setMyBooks(booksRes.data?.data || [])
      } catch (error) {
        console.error('Failed to load items/books:', error)
        toast.error('Failed to load your items and books')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [isAuthenticated])

  const toggleSelectItem = (itemId) => {
    const newSelected = new Set(selectedItems)
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId)
    } else {
      newSelected.add(itemId)
    }
    setSelectedItems(newSelected)
  }

  const openEditItem = (item) => {
    setEditingItem(item)
    setItemForm({
      title: item.title || '',
      description: item.description || '',
      type: item.type || 'lost',
      category: item.category || 'electronics',
      location: item.location || '',
      status: item.status || 'active',
      date: item.date ? new Date(item.date).toISOString().split('T')[0] : ''
    })
  }

  const handleItemChange = (e) => {
    setItemForm({ ...itemForm, [e.target.name]: e.target.value })
  }

  const saveItem = async () => {
    if (!editingItem) return
    try {
      setSavingItem(true)
      const response = await itemsAPI.updateItem(editingItem._id, itemForm)
      const updated = response.data?.data
      if (updated) {
        setMyItems((prev) => prev.map((i) => (i._id === updated._id ? updated : i)))
      }
      toast.success('Item updated successfully')
      setEditingItem(null)
    } catch (error) {
      console.error('Update item error:', error)
      toast.error(error.response?.data?.message || 'Failed to update item')
    } finally {
      setSavingItem(false)
    }
  }

  const deleteItem = async (itemId) => {
    try {
      setDeletingItemId(itemId)
      await itemsAPI.deleteItem(itemId)
      setMyItems((prev) => prev.filter((i) => i._id !== itemId))
      toast.success('Item deleted successfully')
    } catch (error) {
      console.error('Delete item error:', error)
      toast.error(error.response?.data?.message || 'Failed to delete item')
    } finally {
      setDeletingItemId(null)
    }
  }

  const openEditBook = (book) => {
    setEditingBook(book)
    setBookForm({
      title: book.title || '',
      author: book.author || '',
      price: book.price || '',
      status: book.status || 'available'
    })
  }

  const handleBookChange = (e) => {
    setBookForm({ ...bookForm, [e.target.name]: e.target.value })
  }

  const saveBook = async () => {
    if (!editingBook) return
    try {
      setSavingBook(true)
      const response = await booksAPI.updateBook(editingBook._id, bookForm)
      const updated = response.data?.data || response.data?.book
      if (updated) {
        setMyBooks((prev) => prev.map((b) => (b._id === updated._id ? updated : b)))
      }
      toast.success('Book updated successfully')
      setEditingBook(null)
    } catch (error) {
      console.error('Update book error:', error)
      toast.error(error.response?.data?.message || 'Failed to update book')
    } finally {
      setSavingBook(false)
    }
  }

  const deleteBook = async (bookId) => {
    try {
      setDeletingBookId(bookId)
      await booksAPI.deleteBook(bookId)
      setMyBooks((prev) => prev.filter((b) => b._id !== bookId))
      toast.success('Book deleted successfully')
    } catch (error) {
      console.error('Delete book error:', error)
      toast.error(error.response?.data?.message || 'Failed to delete book')
    } finally {
      setDeletingBookId(null)
    }
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} p-6`}>
      <div className="max-w-7xl mx-auto space-y-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              My Items & Books
            </h1>
            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
              Manage your reported items and listed books in one place.
            </p>
          </div>
          <div className="flex gap-3">
            <a
              href="/lost-found"
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium inline-flex items-center gap-2"
            >
              Report Item <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href="/books"
              className={`px-4 py-2 rounded-lg font-medium inline-flex items-center gap-2 ${
                isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'
              }`}
            >
              Sell Book <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <Package className="w-10 h-10 text-purple-500 animate-pulse mx-auto" />
            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mt-3`}>Loading...</p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-purple-500" />
                <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  My Items ({myItems.length})
                </h2>
              </div>
              {myItems.length === 0 ? (
                <div className={`rounded-xl p-8 text-center ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                  <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    No items yet. Start by reporting a lost or found item.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {myItems.map((item) => (
                    <motion.div
                      key={item._id}
                      whileHover={{ y: -4 }}
                      className={`rounded-2xl border overflow-hidden shadow-md relative ${
                        isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
                      } ${selectedItems.has(item._id) ? 'ring-2 ring-blue-500' : ''}`}
                    >
                      <button
                        onClick={() => toggleSelectItem(item._id)}
                        className="absolute top-3 left-3 z-10 text-white hover:scale-110 transition-transform"
                      >
                        {selectedItems.has(item._id) ? (
                          <CheckCircle2 className="w-6 h-6 text-blue-500" />
                        ) : (
                          <Circle className="w-6 h-6 text-gray-400" />
                        )}
                      </button>
                      <div className="relative">
                        {item.images?.[0] ? (
                          <img src={item.images[0]} alt={item.title} className="w-full h-48 object-cover" />
                        ) : (
                          <div className={`w-full h-48 flex items-center justify-center ${
                            isDarkMode ? 'bg-gray-900' : 'bg-gray-100'
                          }`}>
                            <Package className="w-10 h-10 text-gray-400" />
                          </div>
                        )}
                        <div className="absolute top-3 right-3 flex gap-2">
                          <button
                            onClick={() => openEditItem(item)}
                            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteItem(item._id)}
                            disabled={deletingItemId === item._id}
                            className="p-2 bg-red-500 text-white rounded-lg disabled:opacity-60"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {item.title}
                          </h3>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            item.status === 'active'
                              ? 'bg-blue-500/20 text-blue-400'
                              : item.status === 'resolved'
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-gray-500/20 text-gray-400'
                          }`}>
                            {item.status}
                          </span>
                        </div>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} line-clamp-2`}>
                          {item.description}
                        </p>
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>{item.location}</span>
                          <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-500" />
                <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  My Books ({myBooks.length})
                </h2>
              </div>
              {myBooks.length === 0 ? (
                <div className={`rounded-xl p-8 text-center ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                  <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    No books yet. Start by listing a book for sale.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {myBooks.map((book) => (
                    <motion.div
                      key={book._id}
                      whileHover={{ y: -4 }}
                      className={`rounded-2xl border overflow-hidden shadow-md ${
                        isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
                      }`}
                    >
                      <div className="relative">
                        {book.images?.[0] ? (
                          <img src={book.images[0]} alt={book.title} className="w-full h-48 object-cover" />
                        ) : (
                          <div className={`w-full h-48 flex items-center justify-center ${
                            isDarkMode ? 'bg-gray-900' : 'bg-gray-100'
                          }`}>
                            <BookOpen className="w-10 h-10 text-gray-400" />
                          </div>
                        )}
                        <div className="absolute top-3 right-3 flex gap-2">
                          <button
                            onClick={() => openEditBook(book)}
                            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteBook(book._id)}
                            disabled={deletingBookId === book._id}
                            className="p-2 bg-red-500 text-white rounded-lg disabled:opacity-60"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {book.title}
                          </h3>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            book.status === 'available'
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-gray-500/20 text-gray-400'
                          }`}>
                            {book.status}
                          </span>
                        </div>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          by {book.author}
                        </p>
                        <div className="text-sm font-semibold text-blue-500">₹ {book.price}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className={`w-full max-w-2xl rounded-2xl ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
            <div className="flex items-center justify-between p-5 border-b border-gray-700">
              <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Edit Item</h3>
              <button onClick={() => setEditingItem(null)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
              <input className={`px-4 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200'}`} name="title" value={itemForm.title} onChange={handleItemChange} placeholder="Title" />
              <input className={`px-4 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200'}`} name="location" value={itemForm.location} onChange={handleItemChange} placeholder="Location" />
              <select className={`px-4 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200'}`} name="type" value={itemForm.type} onChange={handleItemChange}>
                <option value="lost">Lost</option>
                <option value="found">Found</option>
              </select>
              <select className={`px-4 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200'}`} name="category" value={itemForm.category} onChange={handleItemChange}>
                <option value="electronics">Electronics</option>
                <option value="books">Books</option>
                <option value="clothing">Clothing</option>
                <option value="accessories">Accessories</option>
                <option value="documents">Documents</option>
                <option value="keys">Keys</option>
                <option value="other">Other</option>
              </select>
              <select className={`px-4 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200'}`} name="status" value={itemForm.status} onChange={handleItemChange}>
                <option value="active">Active</option>
                <option value="resolved">Resolved</option>
                <option value="expired">Expired</option>
              </select>
              <input type="date" className={`px-4 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200'}`} name="date" value={itemForm.date} onChange={handleItemChange} />
              <textarea rows="3" className={`md:col-span-2 px-4 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200'}`} name="description" value={itemForm.description} onChange={handleItemChange} placeholder="Description" />
            </div>
            <div className="p-5 border-t border-gray-700 flex justify-end gap-3">
              <button className={`px-4 py-2 rounded-lg ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-800'}`} onClick={() => setEditingItem(null)}>Cancel</button>
              <button className="px-5 py-2 rounded-lg bg-blue-600 text-white" onClick={saveItem} disabled={savingItem}>{savingItem ? 'Saving...' : 'Save Changes'}</button>
            </div>
          </div>
        </div>
      )}

      {editingBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className={`w-full max-w-xl rounded-2xl ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
            <div className="flex items-center justify-between p-5 border-b border-gray-700">
              <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Edit Book</h3>
              <button onClick={() => setEditingBook(null)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 grid grid-cols-1 gap-4">
              <input className={`px-4 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200'}`} name="title" value={bookForm.title} onChange={handleBookChange} placeholder="Title" />
              <input className={`px-4 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200'}`} name="author" value={bookForm.author} onChange={handleBookChange} placeholder="Author" />
              <input type="number" className={`px-4 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200'}`} name="price" value={bookForm.price} onChange={handleBookChange} placeholder="Price" />
              <select className={`px-4 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200'}`} name="status" value={bookForm.status} onChange={handleBookChange}>
                <option value="available">Available</option>
                <option value="sold">Sold</option>
              </select>
            </div>
            <div className="p-5 border-t border-gray-700 flex justify-end gap-3">
              <button className={`px-4 py-2 rounded-lg ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-800'}`} onClick={() => setEditingBook(null)}>Cancel</button>
              <button className="px-5 py-2 rounded-lg bg-blue-600 text-white" onClick={saveBook} disabled={savingBook}>{savingBook ? 'Saving...' : 'Save Changes'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AllItemDetals
