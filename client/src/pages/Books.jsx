import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  Plus,
  MapPin,
  Calendar,
  User,
  Phone,
  Mail,
  BookOpen,
  Star,
  X,
  Eye,
  Edit,
  Trash2,
  Upload,
  Camera,
  Heart,
  MessageCircle
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationsContext';
import { booksAPI, chatAPI, favoritesAPI } from '../services/api';
import Navbar from '../components/Navbar';
import { toast } from 'react-toastify';

const Books = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const { isAuthenticated, user } = useAuth();
  const { markAsRead } = useNotifications();

  // State management
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [showBookModal, setShowBookModal] = useState(false);
  const [favorites, setFavorites] = useState(new Set());

  // Filters and search
  const [filters, setFilters] = useState({
    subject: 'all',
    condition: 'all',
    minPrice: '',
    maxPrice: '',
    search: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    subject: 'computer-science',
    course: '',
    description: '',
    price: '',
    condition: 'good',
    location: '',
    contactMethod: 'email',
    tags: []
  });

  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const fileInputRef = useRef(null);
  const [isFavorited, setIsFavorited] = useState(false);

  // Subjects for books
  const subjects = [
    'computer-science', 'mathematics', 'physics', 'chemistry', 'biology',
    'engineering', 'business', 'economics', 'literature', 'history',
    'psychology', 'sociology', 'philosophy', 'art', 'music', 'other'
  ];

  // Book conditions
  const conditions = [
    { value: 'new', label: 'New', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
    { value: 'excellent', label: 'Excellent', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
    { value: 'good', label: 'Good', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
    { value: 'fair', label: 'Fair', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' },
    { value: 'poor', label: 'Poor', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' }
  ];

  // Load books on component mount and when filters change
  useEffect(() => {
    fetchBooks();
  }, [filters]);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const params = {
        ...filters,
        subject: filters.subject === 'all' ? undefined : filters.subject,
        condition: filters.condition === 'all' ? undefined : filters.condition,
        minPrice: filters.minPrice || undefined,
        maxPrice: filters.maxPrice || undefined,
        search: filters.search || undefined,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder
      };

      const response = await booksAPI.getBooks(params);
      setBooks(response.data.data);
    } catch (error) {
      console.error('Failed to fetch books:', error);
      toast.error('Failed to load books');
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = (event) => {
    const files = Array.from(event.target.files);

    if (files.length + selectedImages.length > 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }

    const newImages = [...selectedImages, ...files];
    setSelectedImages(newImages);

    // Create previews
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(prev => [...prev, ...newPreviews]);
  };

  const removeImage = (index) => {
    const newImages = selectedImages.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);

    // Revoke object URLs to prevent memory leaks
    URL.revokeObjectURL(imagePreviews[index]);

    setSelectedImages(newImages);
    setImagePreviews(newPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error('Please login to list a book');
      return;
    }

    // Validation
    if (!formData.title.trim()) {
      toast.error('Please enter a book title');
      return;
    }
    if (!formData.author.trim()) {
      toast.error('Please enter the author name');
      return;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      toast.error('Please enter a valid price');
      return;
    }
    if (!formData.location.trim()) {
      toast.error('Please enter a location');
      return;
    }

    try {
      setSubmitting(true);

      const submitData = new FormData();
      submitData.append('title', formData.title.trim());
      submitData.append('author', formData.author.trim());
      submitData.append('isbn', formData.isbn.trim());
      submitData.append('subject', formData.subject);
      submitData.append('course', formData.course.trim());
      submitData.append('description', formData.description.trim());
      submitData.append('price', parseFloat(formData.price));
      submitData.append('condition', formData.condition);
      submitData.append('location', formData.location.trim());
      submitData.append('contactMethod', formData.contactMethod);
      submitData.append('tags', formData.tags ? JSON.stringify(formData.tags) : JSON.stringify([]));

      // Add images
      if (selectedImages.length > 0) {
        selectedImages.forEach((image) => {
          submitData.append('images', image);
        });
      }

      const response = await booksAPI.createBook(submitData);
      
      if (response.data.success) {
        toast.success('Book listed successfully!');
        setShowForm(false);
        resetForm();
        fetchBooks();
      }
    } catch (error) {
      console.error('Failed to create book:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Failed to list book';
      toast.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      author: '',
      isbn: '',
      subject: 'computer-science',
      course: '',
      description: '',
      price: '',
      condition: 'good',
      location: '',
      contactMethod: 'email',
      tags: []
    });
    setSelectedImages([]);
    setImagePreviews([]);
  };

  const handleContactSeller = (book) => {
    if (!isAuthenticated) {
      toast.error('Please login to contact seller');
      return;
    }

    const subject = `Inquiry about "${book.title}"`;
    const body = `Hi ${book.seller.username},\n\nI'm interested in your book "${book.title}" listed for ${formatPrice(book.price)}.\n\nPlease let me know if it's still available.\n\nBest regards,\n${user.username}`;

    window.open(`mailto:${book.seller.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
  };

  const handleMessageSeller = async (sellerId) => {
    if (!isAuthenticated) {
      toast.error('Please login to message');
      navigate('/login');
      return;
    }

    try {
      // Create or get conversation with seller
      const response = await chatAPI.getOrCreateConversation(sellerId);
      setShowBookModal(false);
      navigate('/chat');
      toast.success('Chat opened!');
    } catch (error) {
      console.error('Failed to start chat:', error);
      toast.error('Failed to start conversation');
    }
  };

  const toggleFavorite = async (bookId) => {
    if (!isAuthenticated) {
      toast.error('Please login to add favorites');
      navigate('/login');
      return;
    }

    try {
      if (isFavorited) {
        await favoritesAPI.removeFromFavorites(bookId, 'book');
        setIsFavorited(false);
        toast.success('Removed from favorites');
      } else {
        await favoritesAPI.addToFavorites(bookId, 'book');
        setIsFavorited(true);
        toast.success('Added to favorites');
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
      toast.error('Failed to toggle favorite');
    }
  };

  const checkIfFavorited = async (bookId) => {
    if (!isAuthenticated) {
      setIsFavorited(false);
      return;
    }

    try {
      const response = await favoritesAPI.checkFavorite(bookId, 'book');
      setIsFavorited(response.data.isFavorited);
    } catch (error) {
      console.error('Failed to check favorite status:', error);
    }
  };

  const getConditionColor = (condition) => {
    return conditions.find(c => c.value === condition)?.color || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(price);
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className={`text-4xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Book Marketplace
          </h1>
          <p className={`text-lg max-w-2xl mx-auto ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Buy and sell textbooks with fellow students. Find great deals on required reading
            and earn money from books you no longer need.
          </p>
        </motion.div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`p-6 rounded-xl mb-8 backdrop-blur-sm border ${
            isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white/50 border-gray-200'
          }`}
        >
          <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4 mb-4">
            {/* Subject Filter */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Subject
              </label>
              <select
                value={filters.subject}
                onChange={(e) => setFilters(prev => ({ ...prev, subject: e.target.value }))}
                className={`w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="all">All Subjects</option>
                {subjects.map(subject => (
                  <option key={subject} value={subject}>
                    {subject.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </option>
                ))}
              </select>
            </div>

            {/* Condition Filter */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Condition
              </label>
              <select
                value={filters.condition}
                onChange={(e) => setFilters(prev => ({ ...prev, condition: e.target.value }))}
                className={`w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="all">All Conditions</option>
                {conditions.map(condition => (
                  <option key={condition.value} value={condition.value}>
                    {condition.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Min Price */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Min Price
              </label>
              <input
                type="number"
                placeholder="0"
                value={filters.minPrice}
                onChange={(e) => setFilters(prev => ({ ...prev, minPrice: e.target.value }))}
                className={`w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
              />
            </div>

            {/* Max Price */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Max Price
              </label>
              <input
                type="number"
                placeholder="500"
                value={filters.maxPrice}
                onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: e.target.value }))}
                className={`w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
              />
            </div>

            {/* Sort By */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Sort By
              </label>
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                className={`w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="createdAt">Date Listed</option>
                <option value="price">Price</option>
                <option value="views">Popularity</option>
              </select>
            </div>

            {/* Search */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Title, author..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className={`w-full pl-10 pr-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* List New Book Button */}
          <div className="flex justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-300 transform hover:shadow-lg flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              List a Book for Sale
            </motion.button>
          </div>
        </motion.div>

        {/* Books Grid */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(6).fill(0).map((_, index) => (
              <div key={index} className={`rounded-xl border p-6 ${
                isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <div className="animate-pulse">
                  <div className="h-48 bg-gray-300 dark:bg-gray-600 rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-4"></div>
                  <div className="flex gap-2">
                    <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
                    <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : books.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <BookOpen className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
            <h3 className={`text-xl font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              No books found
            </h3>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Try adjusting your filters or be the first to list a book!
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {books.map((book, index) => (
              <motion.div
                key={book._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02, y: -5 }}
                className={`rounded-xl border overflow-hidden cursor-pointer transition-all duration-300 ${
                  isDarkMode ? 'bg-gray-800 border-gray-700 hover:bg-gray-800/80' : 'bg-white border-gray-200 hover:bg-white/80'
                }`}
                onClick={() => {
                  setSelectedBook(book);
                  checkIfFavorited(book._id);
                  setShowBookModal(true);
                }}
              >
                {/* Book Image */}
                <div className="aspect-w-16 aspect-h-12 bg-gray-200 dark:bg-gray-700 relative">
                  {book.images && book.images.length > 0 ? (
                    <img
                      src={book.images[0]}
                      alt={book.title}
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <div className="w-full h-48 flex items-center justify-center">
                      <BookOpen className="w-12 h-12 text-gray-400" />
                    </div>
                  )}

                  {/* Favorite Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(book._id);
                    }}
                    className={`absolute top-3 right-3 p-2 rounded-full ${
                      favorites.has(book._id)
                        ? 'bg-red-500 text-white'
                        : 'bg-white/80 text-gray-600 hover:bg-white'
                    } transition-colors`}
                  >
                    <Heart className={`w-4 h-4 ${favorites.has(book._id) ? 'fill-current' : ''}`} />
                  </button>

                  {/* Condition Badge */}
                  <div className="absolute top-3 left-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getConditionColor(book.condition)}`}>
                      {conditions.find(c => c.value === book.condition)?.label || book.condition.toUpperCase()}
                    </span>
                  </div>

                  {/* Price Badge */}
                  <div className="absolute bottom-3 right-3">
                    <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                      {formatPrice(book.price)}
                    </span>
                  </div>
                </div>

                {/* Book Details */}
                <div className="p-4">
                  <h3 className={`font-semibold text-lg mb-1 line-clamp-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {book.title}
                  </h3>

                  <p className={`text-sm mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    by {book.author}
                  </p>

                  <p className={`text-sm mb-3 line-clamp-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {book.description}
                  </p>

                  <div className="flex items-center justify-between text-sm mb-3">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                        {book.location}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4 text-gray-500" />
                      <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                        {book.views} views
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-medium px-2 py-1 rounded ${getConditionColor(book.subject)}`}>
                      {book.subject.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleContactSeller(book);
                        }}
                        className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium flex items-center gap-1"
                      >
                        <MessageCircle className="w-4 h-4" />
                        Contact
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* List Book Modal */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
              onClick={() => setShowForm(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl ${
                  isDarkMode ? 'bg-gray-800' : 'bg-white'
                }`}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      List a Book for Sale
                    </h2>
                    <button
                      onClick={() => setShowForm(false)}
                      className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                  {/* Basic Information */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Title *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        className={`w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 ${
                          isDarkMode
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                        }`}
                        placeholder="e.g., Introduction to Algorithms"
                      />
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Author *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.author}
                        onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))}
                        className={`w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 ${
                          isDarkMode
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                        }`}
                        placeholder="e.g., Cormen, Leiserson, Rivest"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Subject *
                      </label>
                      <select
                        required
                        value={formData.subject}
                        onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                        className={`w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 ${
                          isDarkMode
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      >
                        {subjects.map(subject => (
                          <option key={subject} value={subject}>
                            {subject.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Condition *
                      </label>
                      <select
                        required
                        value={formData.condition}
                        onChange={(e) => setFormData(prev => ({ ...prev, condition: e.target.value }))}
                        className={`w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 ${
                          isDarkMode
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      >
                        {conditions.map(condition => (
                          <option key={condition.value} value={condition.value}>
                            {condition.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Price (₹) *
                      </label>
                      <input
                        type="number"
                        required
                        min="0"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                        className={`w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 ${
                          isDarkMode
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                        }`}
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        ISBN (Optional)
                      </label>
                      <input
                        type="text"
                        value={formData.isbn}
                        onChange={(e) => setFormData(prev => ({ ...prev, isbn: e.target.value }))}
                        className={`w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 ${
                          isDarkMode
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                        }`}
                        placeholder="ISBN-10 or ISBN-13"
                      />
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Course (Optional)
                      </label>
                      <input
                        type="text"
                        value={formData.course}
                        onChange={(e) => setFormData(prev => ({ ...prev, course: e.target.value }))}
                        className={`w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 ${
                          isDarkMode
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                        }`}
                        placeholder="e.g., CS 101, MATH 201"
                      />
                    </div>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Description
                    </label>
                    <textarea
                      rows={3}
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      className={`w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 ${
                        isDarkMode
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      }`}
                      placeholder="Additional details about the book's condition, highlights, notes, etc."
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Location *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.location}
                        onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                        className={`w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 ${
                          isDarkMode
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                        }`}
                        placeholder="e.g., Library, Room 201, Dorm"
                      />
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Contact Method
                      </label>
                      <select
                        value={formData.contactMethod}
                        onChange={(e) => setFormData(prev => ({ ...prev, contactMethod: e.target.value }))}
                        className={`w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 ${
                          isDarkMode
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      >
                        <option value="email">Email Only</option>
                        <option value="phone">Phone Only</option>
                        <option value="both">Email or Phone</option>
                      </select>
                    </div>
                  </div>

                  {/* Image Upload */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Book Images (Max 5)
                    </label>
                    <div className="border-2 border-dashed rounded-lg p-4">
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="hidden"
                      />

                      {imagePreviews.length === 0 ? (
                        <div
                          onClick={() => fileInputRef.current?.click()}
                          className={`text-center cursor-pointer py-8 ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-600'
                          }`}
                        >
                          <Camera className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p>Click to upload book images</p>
                          <p className="text-sm opacity-75">PNG, JPG, GIF up to 5MB each</p>
                        </div>
                      ) : (
                        <div>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                            {imagePreviews.map((preview, index) => (
                              <div key={index} className="relative">
                                <img
                                  src={preview}
                                  alt={`Preview ${index + 1}`}
                                  className="w-full h-24 object-cover rounded-lg"
                                />
                                <button
                                  type="button"
                                  onClick={() => removeImage(index)}
                                  className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                          {imagePreviews.length < 5 && (
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="w-full py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 transition-colors"
                            >
                              Add More Images
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="flex gap-4 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className={`flex-1 py-3 px-6 rounded-lg border transition-colors ${
                        isDarkMode
                          ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                          : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? 'Listing Book...' : 'List Book for Sale'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Book Detail Modal */}
        <AnimatePresence>
          {showBookModal && selectedBook && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
              onClick={() => setShowBookModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className={`w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl ${
                  isDarkMode ? 'bg-gray-800' : 'bg-white'
                }`}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {selectedBook.title}
                    </h2>
                    <button
                      onClick={() => setShowBookModal(false)}
                      className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  {/* Images */}
                  {selectedBook.images && selectedBook.images.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      {selectedBook.images.map((image, index) => (
                        <img
                          key={index}
                          src={image}
                          alt={`${selectedBook.title} ${index + 1}`}
                          className="w-full h-64 object-cover rounded-lg"
                        />
                      ))}
                    </div>
                  )}

                  {/* Book Details */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        Book Details
                      </h3>

                      <div className="space-y-3">
                        <div>
                          <span className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Author:
                          </span>
                          <span className={`ml-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {selectedBook.author}
                          </span>
                        </div>

                        <div>
                          <span className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Subject:
                          </span>
                          <span className={`ml-2 px-2 py-1 rounded text-sm ${getConditionColor(selectedBook.subject)}`}>
                            {selectedBook.subject.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                          </span>
                        </div>

                        {selectedBook.course && (
                          <div>
                            <span className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              Course:
                            </span>
                            <span className={`ml-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              {selectedBook.course}
                            </span>
                          </div>
                        )}

                        {selectedBook.isbn && (
                          <div>
                            <span className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              ISBN:
                            </span>
                            <span className={`ml-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              {selectedBook.isbn}
                            </span>
                          </div>
                        )}

                        <div>
                          <span className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Condition:
                          </span>
                          <span className={`ml-2 px-2 py-1 rounded-full text-sm ${getConditionColor(selectedBook.condition)}`}>
                            {conditions.find(c => c.value === selectedBook.condition)?.label || selectedBook.condition}
                          </span>
                        </div>

                        <div>
                          <span className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Price:
                          </span>
                          <span className="ml-2 text-2xl font-bold text-blue-600">
                            {formatPrice(selectedBook.price)}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-gray-500" />
                          <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                            {selectedBook.location}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Eye className="w-4 h-4 text-gray-500" />
                          <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                            {selectedBook.views} views
                          </span>
                        </div>

                        <div>
                          <span className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Listed:
                          </span>
                          <span className={`ml-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {new Date(selectedBook.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                        {selectedBook.description && (
                          <div>
                            <span className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              Description:
                            </span>
                            <p className={`mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              {selectedBook.description}
                            </p>
                          </div>
                        )}

                        {selectedBook.tags && selectedBook.tags.length > 0 && (
                          <div>
                            <span className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              Tags:
                            </span>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {selectedBook.tags.map((tag, index) => (
                                <span
                                  key={index}
                                  className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full text-xs"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        Seller Information
                      </h3>

                      <div className="space-y-3 mb-6">
                        <div className="flex items-center gap-3">
                          <User className="w-5 h-5 text-gray-500" />
                          <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                            {selectedBook.seller.username}
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          <Mail className="w-5 h-5 text-gray-500" />
                          <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                            {selectedBook.seller.email}
                          </span>
                        </div>

                        {selectedBook.contactMethod !== 'email' && (
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            Contact method: {selectedBook.contactMethod}
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            onClick={() => handleContactSeller(selectedBook)}
                            className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
                          >
                            <Mail className="w-4 h-4" />
                            Email
                          </button>

                          {isAuthenticated && selectedBook.seller._id !== user?._id && (
                            <button
                              onClick={() => handleMessageSeller(selectedBook.seller._id)}
                              className="bg-purple-600 hover:bg-purple-700 text-white py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
                            >
                              <MessageCircle className="w-4 h-4" />
                              Message
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <button
                            onClick={() => {
                              navigator.share?.({
                                title: selectedBook.title,
                                text: `Check out this book for sale: ${selectedBook.title} by ${selectedBook.author} - ${formatPrice(selectedBook.price)}`,
                                url: window.location.href
                              });
                            }}
                            className={`py-2 px-4 rounded-lg transition-colors text-sm ${
                              isDarkMode
                                ? 'bg-gray-700 hover:bg-gray-600 text-white'
                                : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                            }`}
                          >
                            Share
                          </button>

                          <button
                            onClick={() => toggleFavorite(selectedBook._id)}
                            className={`py-2 px-4 rounded-lg transition-colors text-sm flex items-center justify-center gap-2 ${
                              isFavorited
                                ? 'bg-red-600 hover:bg-red-700 text-white'
                                : isDarkMode
                                  ? 'bg-gray-700 hover:bg-gray-600 text-white'
                                  : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                            }`}
                          >
                            <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
                            {isFavorited ? 'Saved' : 'Save'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Books;