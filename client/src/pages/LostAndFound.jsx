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
  Image as ImageIcon,
  X,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  AlertCircle,
  Upload,
  Camera,
  MessageCircle,
  Heart
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationsContext';
import { itemsAPI, chatAPI, favoritesAPI } from '../services/api';
import Navbar from '../components/Navbar';
import { toast } from 'react-toastify';

const LostAndFound = () => {
  const { isDarkMode } = useTheme();
  const { isAuthenticated, user } = useAuth();
  const { markAsRead } = useNotifications();
  const navigate = useNavigate();

  // State management
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showItemModal, setShowItemModal] = useState(false);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [claimSubmitting, setClaimSubmitting] = useState(false);
  const [claimItem, setClaimItem] = useState(null);

  // Filters and search
  const [filters, setFilters] = useState({
    type: 'all', // 'all', 'lost', 'found'
    category: 'all',
    status: 'active',
    search: '',
    location: ''
  });

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'electronics',
    type: 'lost',
    location: '',
    date: '',
    contactInfo: {
      name: '',
      email: '',
      phone: ''
    },
    tags: [],
    features: {
      color: '',
      brand: '',
      size: '',
      model: ''
    }
  });

  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const fileInputRef = useRef(null);
  const [isFavorited, setIsFavorited] = useState(false);
  const [claimForm, setClaimForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    location: '',
    date: '',
    description: '',
    distinguishingFeatures: '',
    message: ''
  });
  const [claimImages, setClaimImages] = useState([]);
  const [claimImagePreviews, setClaimImagePreviews] = useState([]);
  const claimFileInputRef = useRef(null);

  // Categories for items
  const categories = [
    'electronics', 'books', 'clothing', 'accessories',
    'documents', 'keys', 'other'
  ];

  // Load items on component mount and when filters change
  useEffect(() => {
    fetchItems();
  }, [filters]);

  // Auto-fill contact info for authenticated users
  useEffect(() => {
    if (isAuthenticated && user) {
      setFormData(prev => ({
        ...prev,
        contactInfo: {
          name: user.username,
          email: user.email,
          phone: prev.contactInfo.phone
        }
      }));
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (isAuthenticated && user) {
      setClaimForm(prev => ({
        ...prev,
        fullName: user.username || prev.fullName,
        email: user.email || prev.email
      }));
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    return () => {
      if (claimImagePreviews.length > 0) {
        claimImagePreviews.forEach((url) => URL.revokeObjectURL(url));
      }
    };
  }, [claimImagePreviews]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const params = {
        ...filters,
        type: filters.type === 'all' ? undefined : filters.type,
        category: filters.category === 'all' ? undefined : filters.category,
        search: filters.search || undefined,
        location: filters.location || undefined
      };

      const response = await itemsAPI.getItems(params);
      setItems(response.data.data);
    } catch (error) {
      console.error('Failed to fetch items:', error);
      toast.error('Failed to load items');
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
      toast.error('Please login to report an item');
      return;
    }

    // Validation
    if (!formData.title.trim()) {
      toast.error('Please enter a title');
      return;
    }
    if (!formData.description.trim()) {
      toast.error('Please enter a description');
      return;
    }
    if (!formData.location.trim()) {
      toast.error('Please enter a location');
      return;
    }
    if (!formData.date) {
      toast.error('Please select a date');
      return;
    }
    if (!formData.contactInfo.name.trim()) {
      toast.error('Please enter your name');
      return;
    }
    if (!formData.contactInfo.email.trim()) {
      toast.error('Please enter your email');
      return;
    }

    try {
      setSubmitting(true);

      const submitData = new FormData();
      submitData.append('title', formData.title.trim());
      submitData.append('description', formData.description.trim());
      submitData.append('category', formData.category);
      submitData.append('type', formData.type);
      submitData.append('location', formData.location.trim());
      submitData.append('date', formData.date);
      submitData.append('contactInfo', JSON.stringify(formData.contactInfo));
      submitData.append('tags', JSON.stringify(formData.tags || []));
      submitData.append('features', JSON.stringify(formData.features || {}));

      // Add images
      if (selectedImages.length > 0) {
        selectedImages.forEach((image) => {
          submitData.append('images', image);
        });
      }

      const response = await itemsAPI.createItem(submitData);
      
      if (response.data.success) {
        toast.success(`${formData.type === 'lost' ? 'Lost' : 'Found'} item reported successfully!`);
        setShowForm(false);
        resetForm();
        fetchItems();
      }
    } catch (error) {
      console.error('Failed to create item:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Failed to report item';
      toast.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: 'electronics',
      type: 'lost',
      location: '',
      date: '',
      contactInfo: {
        name: user?.username || '',
        email: user?.email || '',
        phone: ''
      },
      tags: [],
      features: {
        color: '',
        brand: '',
        size: '',
        model: ''
      }
    });
    setSelectedImages([]);
    setImagePreviews([]);
  };

  const resetClaimForm = () => {
    setClaimForm({
      fullName: user?.username || '',
      email: user?.email || '',
      phone: '',
      location: '',
      date: '',
      description: '',
      distinguishingFeatures: '',
      message: ''
    });
    if (claimImagePreviews.length > 0) {
      claimImagePreviews.forEach((url) => URL.revokeObjectURL(url));
    }
    setClaimImages([]);
    setClaimImagePreviews([]);
  };

  const openClaimModal = (item) => {
    if (!isAuthenticated) {
      toast.error('Please login to claim an item');
      navigate('/login');
      return;
    }
    setClaimItem(item);
    setShowClaimModal(true);
  };

  const closeClaimModal = () => {
    setShowClaimModal(false);
    setClaimItem(null);
    resetClaimForm();
  };

  const handleClaimChange = (e) => {
    const { name, value } = e.target;
    setClaimForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleClaimImages = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (claimImagePreviews.length > 0) {
      claimImagePreviews.forEach((url) => URL.revokeObjectURL(url));
    }

    const previews = files.map((file) => URL.createObjectURL(file));
    setClaimImages(files);
    setClaimImagePreviews(previews);
  };

  const handleClaimSubmit = async (e) => {
    e.preventDefault();
    if (!claimItem) return;

    if (!claimForm.fullName || !claimForm.email || !claimForm.location || !claimForm.date || !claimForm.description) {
      toast.error('Please fill all required claim details');
      return;
    }

    try {
      setClaimSubmitting(true);
      const submitData = new FormData();
      submitData.append('fullName', claimForm.fullName.trim());
      submitData.append('email', claimForm.email.trim());
      submitData.append('phone', claimForm.phone.trim());
      submitData.append('location', claimForm.location.trim());
      submitData.append('date', claimForm.date);
      submitData.append('description', claimForm.description.trim());
      submitData.append('distinguishingFeatures', claimForm.distinguishingFeatures.trim());
      submitData.append('message', claimForm.message.trim());

      if (claimImages.length > 0) {
        claimImages.forEach((file) => submitData.append('claimImages', file));
      }

      await itemsAPI.claimItem(claimItem._id, submitData);
      toast.success('Claim request submitted! The owner will review your details.');
      setShowItemModal(false);
      closeClaimModal();
    } catch (error) {
      console.error('Failed to submit claim:', error);
      toast.error(error.response?.data?.message || 'Failed to submit claim');
    } finally {
      setClaimSubmitting(false);
    }
  };

  const handleMessageOwner = async (ownerId) => {
    if (!isAuthenticated) {
      toast.error('Please login to message');
      navigate('/login');
      return;
    }

    try {
      // Create or get conversation with owner
      const response = await chatAPI.getOrCreateConversation(ownerId);
      setShowItemModal(false);
      navigate('/chat');
      toast.success('Chat opened!');
    } catch (error) {
      console.error('Failed to start chat:', error);
      toast.error('Failed to start conversation');
    }
  };

  const toggleFavorite = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to add favorites');
      navigate('/login');
      return;
    }

    try {
      if (isFavorited) {
        await favoritesAPI.removeFromFavorites(selectedItem._id, 'item');
        setIsFavorited(false);
        toast.success('Removed from favorites');
      } else {
        await favoritesAPI.addToFavorites(selectedItem._id, 'item');
        setIsFavorited(true);
        toast.success('Added to favorites');
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
      toast.error('Failed to toggle favorite');
    }
  };

  const checkIfFavorited = async (itemId) => {
    if (!isAuthenticated) {
      setIsFavorited(false);
      return;
    }

    try {
      const response = await favoritesAPI.checkFavorite(itemId, 'item');
      setIsFavorited(response.data.isFavorited);
    } catch (error) {
      console.error('Failed to check favorite status:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'resolved': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'expired': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getTypeColor = (type) => {
    return type === 'lost'
      ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
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
            Lost & Found
          </h1>
          <p className={`text-lg max-w-2xl mx-auto ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Help reunite lost items with their owners or report items you've found.
            Together, we can make our campus community better.
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
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
            {/* Type Filter */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Type
              </label>
              <select
                value={filters.type}
                onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                className={`w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="all">All Items</option>
                <option value="lost">Lost Items</option>
                <option value="found">Found Items</option>
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Category
              </label>
              <select
                value={filters.category}
                onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                className={`w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="all">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                ))}
              </select>
            </div>

            {/* Location Search */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Location
              </label>
              <input
                type="text"
                placeholder="Search location..."
                value={filters.location}
                onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                className={`w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
              />
            </div>

            {/* General Search */}
            <div className="md:col-span-2">
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Search Items
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by title, description, or tags..."
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

          {/* Report New Item Button */}
          <div className="flex justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-300 transform hover:shadow-lg flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Report {filters.type === 'lost' ? 'Lost' : filters.type === 'found' ? 'Found' : 'New'} Item
            </motion.button>
          </div>
        </motion.div>

        {/* Items Grid */}
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
        ) : items.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <AlertCircle className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
            <h3 className={`text-xl font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              No items found
            </h3>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Try adjusting your filters or be the first to report an item!
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {items.map((item, index) => (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02, y: -5 }}
                className={`rounded-xl border overflow-hidden cursor-pointer transition-all duration-300 ${
                  isDarkMode ? 'bg-gray-800 border-gray-700 hover:bg-gray-800/80' : 'bg-white border-gray-200 hover:bg-white/80'
                }`}
                onClick={() => {
                  setSelectedItem(item);
                  checkIfFavorited(item._id);
                  setShowItemModal(true);
                }}
              >
                {/* Item Image */}
                <div className="aspect-w-16 aspect-h-12 bg-gray-200 dark:bg-gray-700 relative">
                  {item.images && item.images.length > 0 ? (
                    <img
                      src={item.images[0]}
                      alt={item.title}
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <div className="w-full h-48 flex items-center justify-center">
                      <ImageIcon className="w-12 h-12 text-gray-400" />
                    </div>
                  )}

                  {/* Status Badge */}
                  <div className="absolute top-3 left-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(item.type)}`}>
                      {item.type.toUpperCase()}
                    </span>
                  </div>

                  {/* Status Badge */}
                  <div className="absolute top-3 right-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(item.status)}`}>
                      {item.status.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Item Details */}
                <div className="p-4">
                  <h3 className={`font-semibold text-lg mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {item.title}
                  </h3>

                  <p className={`text-sm mb-3 line-clamp-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {item.description}
                  </p>

                  <div className="flex items-center justify-between text-sm mb-3">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                        {item.location}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                        {new Date(item.date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-medium px-2 py-1 rounded ${getTypeColor(item.category)}`}>
                      {item.category}
                    </span>

                    {item.status === 'active' && isAuthenticated && item.reportedBy?._id !== user?._id && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          openClaimModal(item);
                        }}
                        className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
                      >
                        Claim Item
                      </motion.button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Report Item Modal */}
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
                      Report {formData.type === 'lost' ? 'Lost' : 'Found'} Item
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
                  {/* Type Toggle */}
                  <div>
                    <label className={`block text-sm font-medium mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Item Type
                    </label>
                    <div className="flex gap-4">
                      {['lost', 'found'].map((type) => (
                        <label key={type} className="flex items-center">
                          <input
                            type="radio"
                            name="type"
                            value={type}
                            checked={formData.type === type}
                            onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                            className="sr-only"
                          />
                          <span className={`px-4 py-2 rounded-lg cursor-pointer transition-all ${
                            formData.type === type
                              ? type === 'lost'
                                ? 'bg-red-600 text-white'
                                : 'bg-green-600 text-white'
                              : isDarkMode
                                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}>
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

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
                        placeholder="e.g., Black iPhone 12"
                      />
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Category *
                      </label>
                      <select
                        required
                        value={formData.category}
                        onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                        className={`w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 ${
                          isDarkMode
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      >
                        {categories.map(cat => (
                          <option key={cat} value={cat}>
                            {cat.charAt(0).toUpperCase() + cat.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Description *
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      className={`w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 ${
                        isDarkMode
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      }`}
                      placeholder="Provide detailed description including color, brand, distinctive features..."
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
                        placeholder="e.g., Library, Room 201, Cafeteria"
                      />
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Date {formData.type === 'lost' ? 'Lost' : 'Found'} *
                      </label>
                      <input
                        type="date"
                        required
                        value={formData.date}
                        onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                        className={`w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 ${
                          isDarkMode
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div>
                    <h3 className={`text-lg font-medium mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Contact Information
                    </h3>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.contactInfo.name}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            contactInfo: { ...prev.contactInfo, name: e.target.value }
                          }))}
                          className={`w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 ${
                            isDarkMode
                              ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                          }`}
                        />
                      </div>

                      <div>
                        <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Email *
                        </label>
                        <input
                          type="email"
                          required
                          value={formData.contactInfo.email}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            contactInfo: { ...prev.contactInfo, email: e.target.value }
                          }))}
                          className={`w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 ${
                            isDarkMode
                              ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                          }`}
                        />
                      </div>

                      <div>
                        <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Phone
                        </label>
                        <input
                          type="tel"
                          value={formData.contactInfo.phone}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            contactInfo: { ...prev.contactInfo, phone: e.target.value }
                          }))}
                          className={`w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 ${
                            isDarkMode
                              ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                          }`}
                          placeholder="Optional"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Image Upload */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Images (Max 5)
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
                          <Upload className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p>Click to upload images</p>
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
                      {submitting ? 'Reporting...' : `Report ${formData.type === 'lost' ? 'Lost' : 'Found'} Item`}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Claim Request Modal */}
        <AnimatePresence>
          {showClaimModal && claimItem && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
              onClick={closeClaimModal}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className={`w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-xl ${
                  isDarkMode ? 'bg-gray-800' : 'bg-white'
                }`}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        Claim Item
                      </h2>
                      <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Provide proof and details to verify your claim.
                      </p>
                    </div>
                    <button
                      onClick={closeClaimModal}
                      className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  <div className={`rounded-lg border p-4 ${isDarkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-gray-50'}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {claimItem.title}
                        </h3>
                        <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {claimItem.category} • {new Date(claimItem.date).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`text-xs font-medium px-2 py-1 rounded ${getTypeColor(claimItem.type)}`}>
                        {claimItem.type.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <form onSubmit={handleClaimSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Full Name *
                        </label>
                        <input
                          type="text"
                          name="fullName"
                          value={claimForm.fullName}
                          onChange={handleClaimChange}
                          className={`w-full px-4 py-2 rounded-lg border ${
                            isDarkMode
                              ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                          } focus:outline-none focus:border-blue-500`}
                          placeholder="Your full name"
                          required
                        />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Email *
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={claimForm.email}
                          onChange={handleClaimChange}
                          className={`w-full px-4 py-2 rounded-lg border ${
                            isDarkMode
                              ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                          } focus:outline-none focus:border-blue-500`}
                          placeholder="you@example.com"
                          required
                        />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Phone
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={claimForm.phone}
                          onChange={handleClaimChange}
                          className={`w-full px-4 py-2 rounded-lg border ${
                            isDarkMode
                              ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                          } focus:outline-none focus:border-blue-500`}
                          placeholder="Optional"
                        />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Location *
                        </label>
                        <input
                          type="text"
                          name="location"
                          value={claimForm.location}
                          onChange={handleClaimChange}
                          className={`w-full px-4 py-2 rounded-lg border ${
                            isDarkMode
                              ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                          } focus:outline-none focus:border-blue-500`}
                          placeholder="Where did you lose/find it?"
                          required
                        />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Date *
                        </label>
                        <input
                          type="date"
                          name="date"
                          value={claimForm.date}
                          onChange={handleClaimChange}
                          className={`w-full px-4 py-2 rounded-lg border ${
                            isDarkMode
                              ? 'bg-gray-700 border-gray-600 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                          } focus:outline-none focus:border-blue-500`}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Description *
                      </label>
                      <textarea
                        name="description"
                        value={claimForm.description}
                        onChange={handleClaimChange}
                        rows={4}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          isDarkMode
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                        } focus:outline-none focus:border-blue-500`}
                        placeholder="Describe the item and why you believe it is yours."
                        required
                      />
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Distinguishing Features
                      </label>
                      <textarea
                        name="distinguishingFeatures"
                        value={claimForm.distinguishingFeatures}
                        onChange={handleClaimChange}
                        rows={3}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          isDarkMode
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                        } focus:outline-none focus:border-blue-500`}
                        placeholder="Unique marks, serial numbers, stickers, etc."
                      />
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Message to Owner
                      </label>
                      <textarea
                        name="message"
                        value={claimForm.message}
                        onChange={handleClaimChange}
                        rows={3}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          isDarkMode
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                        } focus:outline-none focus:border-blue-500`}
                        placeholder="Optional note for the person who posted this item."
                      />
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Upload Proof Images
                      </label>
                      <div className="space-y-3">
                        <input
                          ref={claimFileInputRef}
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          onChange={handleClaimImages}
                        />
                        <button
                          type="button"
                          onClick={() => claimFileInputRef.current?.click()}
                          className={`w-full py-3 px-4 rounded-lg border-2 border-dashed transition-colors ${
                            isDarkMode
                              ? 'border-gray-600 text-gray-300 hover:border-blue-500'
                              : 'border-gray-300 text-gray-700 hover:border-blue-500'
                          }`}
                        >
                          <div className="flex items-center justify-center gap-2">
                            <Upload className="w-4 h-4" />
                            Add Images
                          </div>
                        </button>
                        {claimImagePreviews.length > 0 && (
                          <div className="grid grid-cols-3 gap-3">
                            {claimImagePreviews.map((preview, index) => (
                              <div key={preview} className="relative">
                                <img
                                  src={preview}
                                  alt={`claim-${index}`}
                                  className="w-full h-24 object-cover rounded-lg"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updatedImages = claimImages.filter((_, i) => i !== index);
                                    const updatedPreviews = claimImagePreviews.filter((_, i) => i !== index);
                                    URL.revokeObjectURL(claimImagePreviews[index]);
                                    setClaimImages(updatedImages);
                                    setClaimImagePreviews(updatedPreviews);
                                  }}
                                  className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-4 pt-2">
                      <button
                        type="button"
                        onClick={closeClaimModal}
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
                        disabled={claimSubmitting}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {claimSubmitting ? 'Submitting...' : 'Submit Claim'}
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Item Detail Modal */}
        <AnimatePresence>
          {showItemModal && selectedItem && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
              onClick={() => setShowItemModal(false)}
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
                      {selectedItem.title}
                    </h2>
                    <button
                      onClick={() => setShowItemModal(false)}
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
                  {selectedItem.images && selectedItem.images.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      {selectedItem.images?.map((image, index) => (
                        <img
                          key={index}
                          src={image}
                          alt={`${selectedItem.title} ${index + 1}`}
                          className="w-full h-64 object-cover rounded-lg"
                        />
                      ))}
                    </div>
                  )}

                  {/* Item Details */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        Item Details
                      </h3>

                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-sm ${getTypeColor(selectedItem.type)}`}>
                            {selectedItem.type.toUpperCase()}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-sm ${getStatusColor(selectedItem.status)}`}>
                            {selectedItem.status.toUpperCase()}
                          </span>
                        </div>

                        <div>
                          <span className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Category:
                          </span>
                          <span className={`ml-2 px-2 py-1 rounded text-sm ${getTypeColor(selectedItem.category)}`}>
                            {selectedItem.category}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-gray-500" />
                          <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                            {selectedItem.location}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                            {new Date(selectedItem.date).toLocaleDateString()}
                          </span>
                        </div>

                        <div>
                          <span className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Description:
                          </span>
                          <p className={`mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {selectedItem.description}
                          </p>
                        </div>

                        {selectedItem.tags && selectedItem.tags.length > 0 && (
                          <div>
                            <span className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              Tags:
                            </span>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {selectedItem.tags?.map((tag, index) => (
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
                        Contact Information
                      </h3>

                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <User className="w-5 h-5 text-gray-500" />
                          <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                            {selectedItem.contactInfo.name}
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          <Mail className="w-5 h-5 text-gray-500" />
                          <a
                            href={`mailto:${selectedItem.contactInfo.email}`}
                            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            {selectedItem.contactInfo.email}
                          </a>
                        </div>

                        {selectedItem.contactInfo.phone && (
                          <div className="flex items-center gap-3">
                            <Phone className="w-5 h-5 text-gray-500" />
                            <a
                              href={`tel:${selectedItem.contactInfo.phone}`}
                              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                            >
                              {selectedItem.contactInfo.phone}
                            </a>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="mt-6 space-y-3">
                        {selectedItem.status === 'active' && isAuthenticated && selectedItem.reportedBy?._id !== user?._id && (
                          <button
                            onClick={() => {
                              openClaimModal(selectedItem);
                              setShowItemModal(false);
                            }}
                            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
                          >
                            <CheckCircle className="w-5 h-5" />
                            Claim This Item
                          </button>
                        )}

                        <div className="grid grid-cols-4 gap-3">
                          <button
                            onClick={() => window.open(`mailto:${selectedItem.contactInfo.email}?subject=Regarding: ${selectedItem.title}`)}
                            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors text-sm"
                          >
                            Email
                          </button>

                          {isAuthenticated && selectedItem.reportedBy?._id !== user?._id && (
                            <button
                              onClick={() => handleMessageOwner(selectedItem.reportedBy?._id)}
                              className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg transition-colors text-sm flex items-center justify-center gap-1"
                            >
                              <MessageCircle className="w-4 h-4" />
                              Message
                            </button>
                          )}

                          {isAuthenticated && (
                            <motion.button
                              onClick={toggleFavorite}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className={`py-2 px-4 rounded-lg transition-colors text-sm flex items-center justify-center gap-1 ${
                                isFavorited
                                  ? 'bg-red-600 hover:bg-red-700 text-white'
                                  : 'bg-gray-600 hover:bg-gray-700 text-white'
                              }`}
                            >
                              <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
                            </motion.button>
                          )}

                          <button
                            onClick={() => {
                              navigator.share?.({
                                title: selectedItem.title,
                                text: `Check out this ${selectedItem.type} item: ${selectedItem.title}`,
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

export default LostAndFound;