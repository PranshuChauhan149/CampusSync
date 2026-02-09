import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Mail,
  Calendar,
  MapPin,
  Edit,
  Save,
  X,
  Camera,
  Shield,
  BookOpen,
  Package,
  MessageCircle,
  TrendingUp,
  Award,
  CheckCircle,
  Clock,
  AlertCircle,
  Heart,
  ArrowRight,
  Trash2,
  Edit3
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { authAPI, itemsAPI, booksAPI, statsAPI } from '../services/api';
import { toast } from 'react-toastify';


const Profile = () => {
  const { user, setUser, isAuthenticated } = useAuth();
  const { isDarkMode } = useTheme();

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    itemsPosted: 0,
    booksListed: 0,
    itemsClaimed: 0,
    itemsRecovered: 0,
    activeConversations: 0
  });

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    location: '',
    bio: ''
  });
  const fileInputRef = useRef(null);
  const [pendingProfileImage, setPendingProfileImage] = useState(null);
  const [pendingProfilePreview, setPendingProfilePreview] = useState('');

  const [myItems, setMyItems] = useState([]);
  const [myBooks, setMyBooks] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');

  const [editingItem, setEditingItem] = useState(null);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    type: 'lost',
    category: 'electronics',
    location: '',
    status: 'active',
    date: ''
  });
  const [editingBook, setEditingBook] = useState(null);
  const [editBookForm, setEditBookForm] = useState({
    title: '',
    author: '',
    price: '',
    condition: 'good',
    status: 'available',
    description: ''
  });
  const [isSavingItem, setIsSavingItem] = useState(false);
  const [isSavingBook, setIsSavingBook] = useState(false);
  const [deletingItemId, setDeletingItemId] = useState(null);

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
        phone: user.phone || '',
        location: user.location || '',
        bio: user.bio || ''
      });
      if (user.profilePicture) {
        setPendingProfilePreview(user.profilePicture);
      }
    }
  }, [user]);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchUserData();
    }
  }, [isAuthenticated, user]);

  const fetchUserData = async () => {
    if (!isAuthenticated) {
      return;
    }

    try {
      
      setLoading(true);
      
      const [itemsRes, booksRes, statsRes] = await Promise.all([
        itemsAPI.getMyItems().catch(err => {
          console.error('❌ Error fetching items:', err);
          return { data: { success: false, data: [] } };
        }),
        booksAPI.getMyBooks().catch(err => {
          console.error('❌ Error fetching books:', err);
          return { data: { success: false, data: [] } };
        }),
        statsAPI.getUserStats().catch(err => {
          console.error('❌ Error fetching stats:', err);
          return { data: { success: false, stats: {} } };
        })
      ]);

      

      const items = itemsRes.data.data || [];
      const books = booksRes.data.data || [];
      const userStats = statsRes.data.stats || {};

      setMyItems(items);
      setMyBooks(books);

      setStats({
        itemsPosted: items.length || 0,
        booksListed: books.length || 0,
        itemsClaimed: items.filter(item => item.status === 'claimed').length || 0,
        itemsRecovered: userStats.itemsRecovered || 0,
        activeConversations: 0
      });

      
    } catch (error) {
      console.error('❌ Error fetching user data:', error);
      toast.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSaveProfile = async () => {
    try {
      
      setLoading(true);
      let response;
      if (pendingProfileImage) {
        const fd = new FormData();
        fd.append('username', formData.username);
        fd.append('phone', formData.phone);
        fd.append('location', formData.location);
        fd.append('bio', formData.bio);
        fd.append('profilePicture', pendingProfileImage);
        response = await authAPI.updateProfile(fd);
      } else {
        response = await authAPI.updateProfile(formData);
      }
      
      setUser(response.data.data);
      toast.success(response.data.message || 'Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      console.error('❌ Error updating profile:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      username: user.username || '',
      email: user.email || '',
      phone: user.phone || '',
      location: user.location || '',
      bio: user.bio || ''
    });
    setIsEditing(false);
    if (pendingProfilePreview && pendingProfilePreview.startsWith('blob:')) {
      URL.revokeObjectURL(pendingProfilePreview);
    }
    setPendingProfileImage(null);
    setPendingProfilePreview(user.profilePicture || '');
  };

  const handleProfileImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (pendingProfilePreview && pendingProfilePreview.startsWith('blob:')) {
      URL.revokeObjectURL(pendingProfilePreview);
    }
    const url = URL.createObjectURL(file);
    setPendingProfileImage(file);
    setPendingProfilePreview(url);
  };

  const openEditItem = (item) => {
    setEditingItem(item);
    setEditForm({
      title: item.title || '',
      description: item.description || '',
      type: item.type || 'lost',
      category: item.category || 'electronics',
      location: item.location || '',
      status: item.status || 'active',
      date: item.date ? new Date(item.date).toISOString().split('T')[0] : ''
    });
  };

  const openEditBook = (book) => {
    setEditingBook(book);
    setEditBookForm({
      title: book.title || '',
      author: book.author || '',
      price: book.price || '',
      condition: book.condition || 'good',
      status: book.status || 'available',
      description: book.description || ''
    });
  };

  const handleEditBookInputChange = (e) => {
    setEditBookForm({
      ...editBookForm,
      [e.target.name]: e.target.value
    });
  };

  const handleUpdateBook = async () => {
    if (!editingBook) return;
    try {
      setIsSavingBook(true);
      const payload = {
        title: editBookForm.title,
        author: editBookForm.author,
        price: editBookForm.price,
        condition: editBookForm.condition,
        status: editBookForm.status,
        description: editBookForm.description
      };
      const response = await booksAPI.updateBook(editingBook._id, payload);
      const updated = response.data?.data || response.data?.book || null;
      if (updated) {
        setMyBooks(prev => prev.map(b => b._id === updated._id ? updated : b));
      }
      toast.success(response.data?.message || 'Book updated successfully');
      setEditingBook(null);
    } catch (error) {
      console.error('❌ Error updating book:', error);
      toast.error(error.response?.data?.message || 'Failed to update book');
    } finally {
      setIsSavingBook(false);
    }
  };

  const handleDeleteBook = async (bookId) => {
    try {
      await booksAPI.deleteBook(bookId);
      setMyBooks(prev => prev.filter(b => b._id !== bookId));
      toast.success('Book deleted successfully');
    } catch (error) {
      console.error('❌ Error deleting book:', error);
      toast.error(error.response?.data?.message || 'Failed to delete book');
    }
  };

  const handleEditInputChange = (e) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value
    });
  };

  const handleUpdateItem = async () => {
    if (!editingItem) return;
    try {
      setIsSavingItem(true);
      const payload = {
        title: editForm.title,
        description: editForm.description,
        type: editForm.type,
        category: editForm.category,
        location: editForm.location,
        status: editForm.status,
        date: editForm.date
      };

      const response = await itemsAPI.updateItem(editingItem._id, payload);
      const updated = response.data?.data || null;

      if (updated) {
        setMyItems((prev) => prev.map((item) => item._id === updated._id ? updated : item));
      }
      toast.success('Item updated successfully');
      setEditingItem(null);
    } catch (error) {
      console.error('❌ Error updating item:', error);
      toast.error(error.response?.data?.message || 'Failed to update item');
    } finally {
      setIsSavingItem(false);
    }
  };

  const handleDeleteItem = async (itemId) => {
    try {
      setDeletingItemId(itemId);
      await itemsAPI.deleteItem(itemId);
      setMyItems((prev) => prev.filter((item) => item._id !== itemId));
      toast.success('Item deleted successfully');
    } catch (error) {
      console.error('❌ Error deleting item:', error);
      toast.error(error.response?.data?.message || 'Failed to delete item');
    } finally {
      setDeletingItemId(null);
    }
  };

  const StatCard = ({ icon: Icon, label, value, color }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${
        isDarkMode
          ? 'bg-gray-800 border-gray-700'
          : 'bg-white border-gray-200'
      } rounded-xl p-6 border transition-all hover:shadow-lg`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {label}
          </p>
          <p className={`text-3xl font-bold mt-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {value}
          </p>
        </div>
        <div className={`p-4 rounded-full bg-gradient-to-br ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </motion.div>
  );

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Please Login
          </h2>
          <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
            You need to be logged in to view your profile
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
     
      <div className={`min-h-screen pt-20 pb-10 ${
        isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Profile Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`${
              isDarkMode
                ? 'bg-gradient-to-r from-blue-900 via-purple-900 to-pink-900'
                : 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500'
            } rounded-2xl p-8 mb-8 shadow-2xl`}
          >
            <div className="flex flex-col md:flex-row items-center gap-6">
              {/* Profile Picture */}
              <div className="relative">
                <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center text-white text-5xl font-bold shadow-lg">
                  {pendingProfilePreview ? (
                    <img src={pendingProfilePreview} alt="profile" className="w-full h-full object-cover" />
                  ) : (
                    (user?.username?.charAt(0).toUpperCase() || 'U')
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleProfileImageChange}
                />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 bg-white dark:bg-gray-800 p-2 rounded-full shadow-lg hover:scale-110 transition-transform"
                    title="Change profile picture"
                  >
                    <Camera className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                  </button>
                {user?.isVerified && (
                  <div className="absolute -top-2 -right-2 bg-green-500 p-1 rounded-full">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                )}
              </div>

              {/* User Info */}
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-4xl font-bold text-white mb-2">
                  {user?.username}
                </h1>
                <p className="text-white/80 mb-2">{user?.email}</p>
                <div className="flex flex-wrap gap-3 items-center justify-center md:justify-start text-white/90">
                  {user?.phone && (
                    <span className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4" /> {user.phone}
                    </span>
                  )}
                  {user?.location && (
                    <span className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4" /> {user.location}
                    </span>
                  )}
                </div>
                {user?.bio && (
                  <p className="text-white/80 mt-3 max-w-2xl">{user.bio}</p>
                )}
                <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                  {user?.isVerified && (
                    <span className="px-4 py-1 bg-green-500/20 text-green-100 rounded-full text-sm font-medium backdrop-blur-sm">
                      <Shield className="w-4 h-4 inline mr-1" />
                      Verified Account
                    </span>
                  )}
                  <span className="px-4 py-1 bg-white/20 text-white rounded-full text-sm font-medium backdrop-blur-sm">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Joined {new Date(user?.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Edit Button */}
              <div>
                {!isEditing ? (
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="px-6 py-3 bg-white text-purple-600 rounded-xl font-semibold hover:scale-105 transition-all shadow-lg"
                  >
                    <Edit className="w-5 h-5 inline mr-2" />
                    Edit Profile
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleSaveProfile}
                      disabled={loading}
                      className="px-6 py-3 bg-green-500 text-white rounded-xl font-semibold hover:scale-105 transition-all shadow-lg disabled:opacity-50"
                    >
                      <Save className="w-5 h-5 inline mr-2" />
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="px-6 py-3 bg-red-500 text-white rounded-xl font-semibold hover:scale-105 transition-all shadow-lg"
                    >
                      <X className="w-5 h-5 inline mr-2" />
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <StatCard
              icon={Package}
              label="Items Posted"
              value={stats.itemsPosted}
              color="from-blue-500 to-blue-600"
            />
            <StatCard
              icon={BookOpen}
              label="Books Listed"
              value={stats.booksListed}
              color="from-purple-500 to-purple-600"
            />
            <StatCard
              icon={CheckCircle}
              label="Items Claimed"
              value={stats.itemsClaimed}
              color="from-green-500 to-green-600"
            />
            <StatCard
              icon={Award}
              label="Items Recovered"
              value={stats.itemsRecovered}
              color="from-red-500 to-red-600"
            />
            <StatCard
              icon={Award}
              label="Reputation"
              value={stats.itemsPosted + stats.booksListed}
              color="from-orange-500 to-orange-600"
            />
          </div>

          {/* Tabs */}
          <div className="mb-8">
            <div className={`flex gap-2 p-1 rounded-xl ${
              isDarkMode ? 'bg-gray-800' : 'bg-white'
            } shadow-lg`}>
              {['overview', 'favorites', 'items', 'books'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all ${
                    activeTab === tab
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                      : isDarkMode
                      ? 'text-gray-400 hover:text-white'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab === 'favorites' ? '❤️ Favorites' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                {/* Profile Information */}
                <div className={`${
                  isDarkMode ? 'bg-gray-800' : 'bg-white'
                } rounded-xl p-6 shadow-lg`}>
                  <h2 className={`text-2xl font-bold mb-6 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    Profile Information
                  </h2>

                  <div className="space-y-4">
                    <div>
                      <label className={`text-sm font-medium mb-2 block ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        <User className="w-4 h-4 inline mr-2" />
                        Username
                      </label>
                      <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className={`w-full px-4 py-3 rounded-lg border ${
                          isDarkMode
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-gray-50 border-gray-300 text-gray-900'
                        } ${isEditing ? 'focus:ring-2 focus:ring-purple-500' : 'cursor-not-allowed'}`}
                      />
                    </div>

                    <div>
                      <label className={`text-sm font-medium mb-2 block ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        <Mail className="w-4 h-4 inline mr-2" />
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        disabled={true}
                        className={`w-full px-4 py-3 rounded-lg border cursor-not-allowed ${
                          isDarkMode
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-gray-50 border-gray-300 text-gray-900'
                        }`}
                      />
                      <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Email cannot be changed
                      </p>
                    </div>

                    <div>
                      <label className={`text-sm font-medium mb-2 block ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        <MapPin className="w-4 h-4 inline mr-2" />
                        Location
                      </label>
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        placeholder="Add your location"
                        className={`w-full px-4 py-3 rounded-lg border ${
                          isDarkMode
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                            : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
                        } ${isEditing ? 'focus:ring-2 focus:ring-purple-500' : 'cursor-not-allowed'}`}
                      />
                    </div>

                    <div>
                      <label className={`text-sm font-medium mb-2 block ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Bio
                      </label>
                      <textarea
                        name="bio"
                        value={formData.bio}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        placeholder="Tell us about yourself"
                        rows={4}
                        className={`w-full px-4 py-3 rounded-lg border resize-none ${
                          isDarkMode
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                            : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
                        } ${isEditing ? 'focus:ring-2 focus:ring-purple-500' : 'cursor-not-allowed'}`}
                      />
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className={`${
                  isDarkMode ? 'bg-gray-800' : 'bg-white'
                } rounded-xl p-6 shadow-lg`}>
                  <h2 className={`text-2xl font-bold mb-6 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    Recent Activity
                  </h2>
                  <div className="space-y-4">
                    {myItems.slice(0, 3).map((item) => (
                      <div
                        key={item._id}
                        className={`p-4 rounded-lg border ${
                          isDarkMode ? 'border-gray-700' : 'border-gray-200'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Package className="w-5 h-5 text-blue-500" />
                          <div className="flex-1">
                            <p className={`font-medium ${
                              isDarkMode ? 'text-white' : 'text-gray-900'
                            }`}>
                              {item.title}
                            </p>
                            <p className={`text-sm ${
                              isDarkMode ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                              {item.type === 'lost' ? 'Lost Item' : 'Found Item'} • {new Date(item.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            item.status === 'active'
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-gray-500/20 text-gray-400'
                          }`}>
                            {item.status}
                          </span>
                        </div>
                      </div>
                    ))}
                    {myItems.length === 0 && (
                      <p className={`text-center py-8 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        No recent activity
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'favorites' && (
              <motion.div
                key="favorites"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
              >
                <div className={`${
                  isDarkMode ? 'bg-gray-800' : 'bg-white'
                } rounded-xl p-6 shadow-lg text-center`}>
                  <Heart className="w-12 h-12 text-red-500 fill-red-500 mx-auto mb-3" />
                  <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    View Your Favorites
                  </h3>
                  <p className={`mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Click the button below to manage all your favorite items and books
                  </p>
                  <button
                    onClick={() => window.location.href = '/favorites'}
                    className="px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg font-medium hover:shadow-lg transition-all inline-flex items-center gap-2"
                  >
                    Go to Favorites
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            )}

            {activeTab === 'items' && (
              <motion.div
                key="items"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className={`${
                  isDarkMode ? 'bg-gray-800' : 'bg-white'
                } rounded-xl p-6 shadow-lg`}
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                  <div>
                    <h2 className={`text-2xl font-bold ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      My Items ({myItems.length})
                    </h2>
                    <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                      Manage your reported items — edit details or remove listings.
                    </p>
                  </div>
                  <button
                    onClick={() => window.location.href = '/lost-found'}
                    className="px-5 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:shadow-lg transition-all inline-flex items-center gap-2"
                  >
                    Report New Item
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                {myItems.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {myItems.map((item) => (
                      <div
                        key={item._id}
                        className={`rounded-2xl border overflow-hidden group ${
                          isDarkMode ? 'border-gray-700 bg-gray-900/40' : 'border-gray-200 bg-white'
                        } shadow-md hover:shadow-xl transition-all`}
                      >
                        <div className="relative">
                          {item.images?.[0] ? (
                            <img
                              src={item.images[0]}
                              alt={item.title}
                              className="w-full h-48 object-cover"
                            />
                          ) : (
                            <div className={`w-full h-48 flex items-center justify-center ${
                              isDarkMode ? 'bg-gray-800' : 'bg-gray-100'
                            }`}>
                              <Package className="w-10 h-10 text-gray-400" />
                            </div>
                          )}

                          <div className="absolute top-3 left-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              item.type === 'lost'
                                ? 'bg-red-500/90 text-white'
                                : 'bg-green-500/90 text-white'
                            }`}>
                              {item.type}
                            </span>
                          </div>

                          <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => openEditItem(item)}
                              className="p-2 rounded-lg bg-white/90 text-gray-800 hover:bg-white shadow"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteItem(item._id)}
                              className="p-2 rounded-lg bg-red-500 text-white hover:bg-red-600 shadow disabled:opacity-60"
                              disabled={deletingItemId === item._id}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <div className="p-4 space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className={`font-semibold text-lg line-clamp-1 ${
                              isDarkMode ? 'text-white' : 'text-gray-900'
                            }`}>
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
                          <p className={`text-sm line-clamp-2 ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            {item.description}
                          </p>
                          <div className="flex items-center justify-between text-xs">
                            <span className={`${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                              {item.location}
                            </span>
                            <span className={`${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                              {new Date(item.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex gap-2 pt-2">
                            <button
                              onClick={() => openEditItem(item)}
                              className={`flex-1 py-2 rounded-lg text-sm font-medium ${
                                isDarkMode ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-800'
                              } hover:opacity-90`}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteItem(item._id)}
                              className="flex-1 py-2 rounded-lg text-sm font-medium bg-red-500 text-white hover:bg-red-600 disabled:opacity-60"
                              disabled={deletingItemId === item._id}
                            >
                              {deletingItemId === item._id ? 'Deleting...' : 'Delete'}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={`text-center py-12 rounded-xl ${
                    isDarkMode ? 'bg-gray-900/60' : 'bg-gray-50'
                  }`}>
                    <Package className={`w-12 h-12 mx-auto mb-3 ${
                      isDarkMode ? 'text-gray-600' : 'text-gray-400'
                    }`} />
                    <h3 className={`text-lg font-semibold ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      No items yet
                    </h3>
                    <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                      Start by reporting a lost or found item.
                    </p>
                    <button
                      onClick={() => window.location.href = '/lost-found'}
                      className="mt-4 px-5 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:shadow-lg transition-all"
                    >
                      Report Item
                    </button>
                  </div>
                )}

                {editingItem && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
                    <div className={`w-full max-w-2xl rounded-2xl shadow-2xl ${
                      isDarkMode ? 'bg-gray-900' : 'bg-white'
                    }`}>
                      <div className="flex items-center justify-between p-5 border-b border-gray-700">
                        <h3 className={`text-lg font-semibold ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          Edit Item
                        </h3>
                        <button onClick={() => setEditingItem(null)}>
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                          <label className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Title</label>
                          <input
                            name="title"
                            value={editForm.title}
                            onChange={handleEditInputChange}
                            className={`w-full mt-1 px-4 py-2 rounded-lg border ${
                              isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200'
                            }`}
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Description</label>
                          <textarea
                            name="description"
                            rows="3"
                            value={editForm.description}
                            onChange={handleEditInputChange}
                            className={`w-full mt-1 px-4 py-2 rounded-lg border ${
                              isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200'
                            }`}
                          />
                        </div>

                        <div>
                          <label className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Type</label>
                          <select
                            name="type"
                            value={editForm.type}
                            onChange={handleEditInputChange}
                            className={`w-full mt-1 px-4 py-2 rounded-lg border ${
                              isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200'
                            }`}
                          >
                            <option value="lost">Lost</option>
                            <option value="found">Found</option>
                          </select>
                        </div>

                        <div>
                          <label className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Category</label>
                          <select
                            name="category"
                            value={editForm.category}
                            onChange={handleEditInputChange}
                            className={`w-full mt-1 px-4 py-2 rounded-lg border ${
                              isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200'
                            }`}
                          >
                            <option value="electronics">Electronics</option>
                            <option value="books">Books</option>
                            <option value="clothing">Clothing</option>
                            <option value="accessories">Accessories</option>
                            <option value="documents">Documents</option>
                            <option value="keys">Keys</option>
                            <option value="other">Other</option>
                          </select>
                        </div>

                        <div>
                          <label className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Location</label>
                          <input
                            name="location"
                            value={editForm.location}
                            onChange={handleEditInputChange}
                            className={`w-full mt-1 px-4 py-2 rounded-lg border ${
                              isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200'
                            }`}
                          />
                        </div>

                        <div>
                          <label className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Status</label>
                          <select
                            name="status"
                            value={editForm.status}
                            onChange={handleEditInputChange}
                            className={`w-full mt-1 px-4 py-2 rounded-lg border ${
                              isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200'
                            }`}
                          >
                            <option value="active">Active</option>
                            <option value="resolved">Resolved</option>
                            <option value="expired">Expired</option>
                          </select>
                        </div>

                        <div>
                          <label className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Date</label>
                          <input
                            type="date"
                            name="date"
                            value={editForm.date}
                            onChange={handleEditInputChange}
                            className={`w-full mt-1 px-4 py-2 rounded-lg border ${
                              isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200'
                            }`}
                          />
                        </div>
                      </div>

                      <div className="p-5 border-t border-gray-700 flex justify-end gap-3">
                        <button
                          onClick={() => setEditingItem(null)}
                          className={`px-4 py-2 rounded-lg ${
                            isDarkMode ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleUpdateItem}
                          disabled={isSavingItem}
                          className="px-5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
                        >
                          {isSavingItem ? 'Saving...' : 'Save Changes'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                {editingBook && (
                  <div className="fixed inset-0 z-50 overflow-auto flex items-center justify-center bg-black/60 p-4">
                    <div className={`w-full max-w-full sm:max-w-2xl rounded-2xl shadow-2xl ${
                      isDarkMode ? 'bg-gray-900' : 'bg-white'
                    } mx-2`}> 
                      <div className="flex items-center justify-between p-5 border-b border-gray-700">
                        <h3 className={`text-lg font-semibold ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          Edit Book
                        </h3>
                        <button onClick={() => setEditingBook(null)}>
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                          <label className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Title</label>
                          <input
                            name="title"
                            value={editBookForm.title}
                            onChange={handleEditBookInputChange}
                            className={`w-full mt-1 px-4 py-2 rounded-lg border ${
                              isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200'
                            }`}
                          />
                        </div>

                        <div>
                          <label className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Author</label>
                          <input
                            name="author"
                            value={editBookForm.author}
                            onChange={handleEditBookInputChange}
                            className={`w-full mt-1 px-4 py-2 rounded-lg border ${
                              isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200'
                            }`}
                          />
                        </div>

                        <div>
                          <label className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Price</label>
                          <input
                            name="price"
                            value={editBookForm.price}
                            onChange={handleEditBookInputChange}
                            className={`w-full mt-1 px-4 py-2 rounded-lg border ${
                              isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200'
                            }`}
                          />
                        </div>

                        <div>
                          <label className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Condition</label>
                          <select
                            name="condition"
                            value={editBookForm.condition}
                            onChange={handleEditBookInputChange}
                            className={`w-full mt-1 px-4 py-2 rounded-lg border ${
                              isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200'
                            }`}
                          >
                            <option value="new">New</option>
                            <option value="good">Good</option>
                            <option value="fair">Fair</option>
                          </select>
                        </div>

                        <div>
                          <label className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Status</label>
                          <select
                            name="status"
                            value={editBookForm.status}
                            onChange={handleEditBookInputChange}
                            className={`w-full mt-1 px-4 py-2 rounded-lg border ${
                              isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200'
                            }`}
                          >
                            <option value="available">Available</option>
                            <option value="sold">Sold</option>
                          </select>
                        </div>

                        <div className="md:col-span-2">
                          <label className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Description</label>
                          <textarea
                            name="description"
                            rows="3"
                            value={editBookForm.description}
                            onChange={handleEditBookInputChange}
                            className={`w-full mt-1 px-4 py-2 rounded-lg border ${
                              isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200'
                            }`}
                          />
                        </div>
                      </div>

                      <div className="p-5 border-t border-gray-700 flex justify-end gap-3">
                        <button
                          onClick={() => setEditingBook(null)}
                          className={`px-4 py-2 rounded-lg ${
                            isDarkMode ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleUpdateBook}
                          disabled={isSavingBook}
                          className="px-5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
                        >
                          {isSavingBook ? 'Saving...' : 'Save Changes'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'books' && (
              <motion.div
                key="books"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className={`${
                  isDarkMode ? 'bg-gray-800' : 'bg-white'
                } rounded-xl p-6 shadow-lg`}
              >
                <h2 className={`text-2xl font-bold mb-6 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  My Books ({myBooks.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {myBooks.map((book) => (
                    <div
                      key={book._id}
                      className={`rounded-lg border p-4 ${
                        isDarkMode ? 'border-gray-700' : 'border-gray-200'
                      }`}
                    >
                      {book.images?.[0] && (
                        <img
                          src={book.images[0]}
                          alt={book.title}
                          className="w-full h-48 object-cover rounded-lg mb-4"
                        />
                      )}
                      <h3 className={`font-bold text-lg mb-1 ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {book.title}
                      </h3>
                      <p className={`text-sm mb-3 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        by {book.author}
                      </p>
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-blue-500">
                          ₹{book.price}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          book.status === 'available'
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-gray-500/20 text-gray-400'
                        }`}>
                          {book.status}
                        </span>
                      </div>
                      <div className="mt-3 flex gap-2">
                        <button
                          type="button"
                          onClick={() => openEditBook(book)}
                          className="flex-1 py-2 rounded-lg text-sm font-medium bg-blue-500 text-white hover:bg-blue-600"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteBook(book._id)}
                          className="flex-1 py-2 rounded-lg text-sm font-medium bg-red-500 text-white hover:bg-red-600"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                {myBooks.length === 0 && (
                  <p className={`text-center py-12 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    You haven't listed any books yet
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
};

export default Profile;
