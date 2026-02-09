import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import {
  Bell,
  Sun,
  Moon,
  User,
  Package,
  LogOut,
  Menu,
  X,
  Search,
  MessageCircle,
  BookOpen,
  MapPin,
  Book,
  MapPinOff,
  CheckCircle,
  Settings
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationsContext';
import { itemsAPI, booksAPI, chatAPI } from '../services/api';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const { isDarkMode, toggleTheme } = useTheme();
  const { isAuthenticated, user, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const navigate = useNavigate();

  const profileRef = useRef(null);
  const notificationsRef = useRef(null);
  const searchRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearch(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully!');
    navigate('/');
    setShowProfileDropdown(false);
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  // Debounced search function
  const handleSearch = async (query) => {
    setSearchQuery(query);

    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    try {
      // Search items and books in parallel
      const [itemsRes, booksRes] = await Promise.all([
        itemsAPI.getItems({ search: query, limit: 3 }),
        booksAPI.getBooks({ search: query, limit: 3 })
      ]);

      const results = [
        ...itemsRes.data.data.map(item => ({
          id: item._id,
          type: item.type === 'lost' ? 'Lost Item' : 'Found Item',
          title: item.title,
          location: item.location,
          image: item.images?.[0],
          category: 'items',
          path: `/lost-found`
        })),
        ...booksRes.data.data.map(book => ({
          id: book._id,
          type: 'Book',
          title: book.title,
          location: book.subject,
          image: book.image,
          category: 'books',
          path: `/books`
        }))
      ];

      setSearchResults(results.slice(0, 6)); // Limit to 6 results
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSearchResultClick = (result) => {
    setSearchQuery('');
    setSearchResults([]);
    setShowSearch(false);

    // Navigate to the appropriate page and let that page handle the filtering/selection
    if (result.category === 'items') {
      navigate(`/search?q=${encodeURIComponent(result.title)}`);
    } else if (result.category === 'books') {
      navigate(`/search?q=${encodeURIComponent(result.title)}`);
    }
  };

  const handleSearchSubmit = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      setShowSearch(false);
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setSearchResults([]);
    }
  };

  const navItems = [
    { name: 'Home', path: '/', icon: null },
    { name: 'Lost & Found', path: '/lost-found', icon: MapPin },
    { name: 'Books', path: '/books', icon: BookOpen },
    { name: 'Study Material', path: '/study-material', icon: Book },
    { name: 'Chat', path: '/chat', icon: MessageCircle },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={`sticky top-0 z-50 backdrop-blur-md border-b ${
        isDarkMode
          ? 'bg-gray-900/95 border-gray-700 shadow-lg shadow-gray-900/50'
          : 'bg-white/95 border-gray-200 shadow-lg shadow-gray-200/50'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.div
            className="flex-shrink-0"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
              CampusSync
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navItems.map((item) => (
                <motion.div
                  key={item.name}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to={item.path}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                      isDarkMode
                        ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                        : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    {item.icon && <item.icon className="w-4 h-4" />}
                    {item.name}
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            {/* Search - Desktop */}
            <div className="hidden md:flex items-center gap-2 relative" ref={searchRef}>
              <motion.button
                onClick={() => setShowSearch((prev) => !prev)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`p-2 rounded-md transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-400 hover:text-white hover:bg-gray-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
                aria-label="Open search"
              >
                <Search className="w-5 h-5" />
              </motion.button>

              {showSearch && (
                <motion.div
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  className={`flex items-center rounded-lg px-3 py-2 transition-all duration-300 ${
                    isDarkMode
                      ? 'bg-gray-700 border border-gray-600 focus-within:border-blue-500'
                      : 'bg-gray-100 border border-gray-300 focus-within:border-blue-500'
                  }`}
                >
                  <Search className="w-4 h-4 text-gray-400 mr-2" />
                  <input
                    type="text"
                    placeholder="Search items, books..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    onKeyDown={handleSearchSubmit}
                    autoFocus
                    className={`w-48 bg-transparent outline-none text-sm ${
                      isDarkMode ? 'text-white placeholder-gray-400' : 'text-gray-900 placeholder-gray-500'
                    }`}
                  />
                </motion.div>
              )}

              {/* Search Results Dropdown */}
              <AnimatePresence>
                {showSearch && (searchQuery || searchResults.length > 0) && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    className={`absolute top-full right-0 mt-2 w-96 rounded-lg shadow-xl z-40 ${
                      isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
                    }`}
                  >
                    {searchLoading ? (
                      <div className="p-4 text-center">
                        <div className="inline-block animate-spin">
                          <Search className="w-5 h-5 text-blue-500" />
                        </div>
                        <p className={`text-sm mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          Searching...
                        </p>
                      </div>
                    ) : searchResults.length > 0 ? (
                      <div className="max-h-96 overflow-y-auto">
                        {searchResults.map((result) => (
                          <motion.div
                            key={`${result.category}-${result.id}`}
                            whileHover={{ backgroundColor: isDarkMode ? '#374151' : '#f3f4f6' }}
                            onClick={() => handleSearchResultClick(result)}
                            className={`p-3 border-b cursor-pointer transition-colors ${
                              isDarkMode ? 'border-gray-700' : 'border-gray-100'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              {result.image ? (
                                <img
                                  src={result.image}
                                  alt={result.title}
                                  className="w-10 h-10 rounded object-cover flex-shrink-0"
                                />
                              ) : (
                                <div className={`w-10 h-10 rounded flex items-center justify-center flex-shrink-0 ${
                                  isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                                }`}>
                                  {result.category === 'items' ? (
                                    <MapPinOff className="w-5 h-5 text-gray-400" />
                                  ) : (
                                    <Book className="w-5 h-5 text-gray-400" />
                                  )}
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className={`text-xs font-semibold px-2 py-1 rounded ${
                                    result.category === 'items'
                                      ? 'bg-purple-500/20 text-purple-400'
                                      : 'bg-blue-500/20 text-blue-400'
                                  }`}>
                                    {result.type}
                                  </span>
                                </div>
                                <p className={`text-sm font-medium mt-1 truncate ${
                                  isDarkMode ? 'text-gray-200' : 'text-gray-900'
                                }`}>
                                  {result.title}
                                </p>
                                {result.location && (
                                  <p className={`text-xs truncate ${
                                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                  }`}>
                                    {result.location}
                                  </p>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 text-center">
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          No results found
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Search - Mobile */}
            <motion.button
              onClick={() => setShowSearch(!showSearch)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`md:hidden p-2 rounded-md transition-colors duration-300 ${
                isDarkMode ? 'text-gray-400 hover:text-white hover:bg-gray-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Search className="w-5 h-5" />
            </motion.button>

            {/* Theme Toggle */}
            <motion.button
              onClick={toggleTheme}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`p-2 rounded-md transition-colors duration-300 ${
                isDarkMode ? 'text-gray-400 hover:text-white hover:bg-gray-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </motion.button>

            {/* Notifications */}
            {isAuthenticated && (
              <div className="relative" ref={notificationsRef}>
                <motion.button
                  onClick={() => setShowNotifications(!showNotifications)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`relative p-2 rounded-md transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-400 hover:text-white hover:bg-gray-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
                    >
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </motion.span>
                  )}
                </motion.button>

                {/* Notifications Dropdown */}
                <AnimatePresence>
                  {showNotifications && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      className={`absolute right-0 mt-2 w-80 rounded-md shadow-lg ${
                        isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
                      }`}
                    >
                      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                          <h3 className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            Notifications
                          </h3>
                          {unreadCount > 0 && (
                            <button
                              onClick={markAllAsRead}
                              className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                            >
                              Mark all read
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                            No notifications
                          </div>
                        ) : (
                          notifications.map((notification) => {
                            // Determine highlight color for item types
                            const itemType = notification.data?.itemType || (notification.type === 'item_added' ? 'add' : null);
                            const isLost = itemType === 'lost' || notification.type === 'item_lost';
                            const isFound = itemType === 'found' || notification.type === 'item_found';
                            const bgClass = !notification.read
                              ? isLost
                                ? 'bg-red-50 dark:bg-red-900/20'
                                : isFound
                                ? 'bg-green-50 dark:bg-green-900/20'
                                : 'bg-blue-50 dark:bg-blue-900/20'
                              : '';

                            const textClass = isLost ? 'text-red-700 dark:text-red-200' : isFound ? 'text-green-700 dark:text-green-200' : (isDarkMode ? 'text-gray-300' : 'text-gray-700');

                            const handleNotificationClick = async (notif) => {
                              try {
                                await markAsRead(notif._id);
                              } catch (e) {
                                console.error('Failed to mark notification read', e);
                              }
                              setShowNotifications(false);
                              const itemId = notif.data?.itemId || notif.data?.bookId || notif.data?.bookId;
                              if (notif.data?.bookId) {
                                navigate(`/book/${notif.data.bookId}`);
                                return;
                              }
                              if (notif.data?.itemId) {
                                navigate(`/item/${notif.data.itemId}`);
                                return;
                              }
                              if (notif.data?.conversationId) {
                                navigate('/chat', { state: { conversationId: notif.data.conversationId } });
                                return;
                              }
                              // fallback: open notifications panel (stay)
                            };

                            const messageClass = isLost
                              ? 'text-red-600 dark:text-red-100'
                              : isFound
                              ? 'text-green-600 dark:text-green-100'
                              : (isDarkMode ? 'text-gray-200' : 'text-gray-800');

                            return (
                              <div
                                key={notification._id}
                                className={`p-3 border-b border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 ${bgClass}`}
                                onClick={() => handleNotificationClick(notification)}
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <p className={`text-sm font-medium truncate ${textClass}`}>{notification.title}</p>
                                  <span className="text-xs text-gray-400">{new Date(notification.createdAt).toLocaleString()}</span>
                                </div>
                                <p className={`text-sm mt-1 ${messageClass}`}>{notification.message}</p>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Profile Dropdown */}
            {isAuthenticated ? (
              <div className="relative" ref={profileRef}>
                <motion.button
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`flex items-center space-x-2 p-2 rounded-md transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-400 hover:text-white hover:bg-gray-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
      
                </motion.button>

                {/* Profile Dropdown Menu */}
                <AnimatePresence>
                  {showProfileDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      className={`absolute right-0 mt-2 w-48 rounded-md shadow-lg ${
                        isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
                      }`}
                    >
                      <div className="py-1">
                        <Link
                          to="/profile"
                          className={`flex items-center px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${
                            isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-gray-900'
                          }`}
                          onClick={() => setShowProfileDropdown(false)}
                        >
                          <User className="w-4 h-4 mr-3" />
                          Profile
                        </Link>
                        <Link
                          to="/my-items"
                          className={`flex items-center px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${
                            isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-gray-900'
                          }`}
                          onClick={() => setShowProfileDropdown(false)}
                        >
                          <Package className="w-4 h-4 mr-3" />
                          My Items
                        </Link>
                        <Link
                          to="/claim-requests"
                          className={`flex items-center px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${
                            isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-gray-900'
                          }`}
                          onClick={() => setShowProfileDropdown(false)}
                        >
                          <CheckCircle className="w-4 h-4 mr-3" />
                          Claim Requests
                        </Link>
                        <Link
                          to="/claim-history"
                          className={`flex items-center px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${
                            isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-gray-900'
                          }`}
                          onClick={() => setShowProfileDropdown(false)}
                        >
                          <Package className="w-4 h-4 mr-3" />
                          Claim History
                        </Link>
                        {user?.role === 'admin' && (
                          <Link
                            to="/admin"
                            className={`flex items-center px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 border-t ${
                              isDarkMode ? 'text-yellow-400 hover:text-yellow-300 border-gray-700' : 'text-yellow-600 hover:text-yellow-700 border-gray-200'
                            }`}
                            onClick={() => setShowProfileDropdown(false)}
                          >
                            <Settings className="w-4 h-4 mr-3" />
                            Admin Dashboard
                          </Link>
                        )}
                        <button
                          onClick={handleLogout}
                          className={`flex items-center w-full px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${
                            isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-gray-900'
                          }`}
                        >
                          <LogOut className="w-4 h-4 mr-3" />
                          Logout
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-4">
                <Link
                  to="/login"
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-300 hover:text-white hover:bg-gray-700' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors duration-300"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <div className="md:hidden">
              <motion.button
                onClick={toggleMenu}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`inline-flex items-center justify-center p-2 rounded-md transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-400 hover:text-white hover:bg-gray-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <span className="sr-only">Open main menu</span>
                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-gray-200 dark:border-gray-700"
          >
            <div className={`px-2 pt-2 pb-3 space-y-1 sm:px-3 ${
              isDarkMode ? 'bg-gray-800' : 'bg-gray-50'
            }`}>
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center px-3 py-2 rounded-md text-base font-medium transition-colors duration-300 ${
                    isDarkMode
                      ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  {item.icon && <item.icon className="w-5 h-5 mr-3" />}
                  {item.name}
                </Link>
              ))}

              {!isAuthenticated && (
                <div className="pt-4 pb-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center px-5">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                    </div>
                    <div className="ml-3">
                      <div className={`text-base font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                        Guest User
                      </div>
                      <div className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Sign in to access features
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 px-2 space-y-1">
                    <Link
                      to="/login"
                      className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-300 ${
                        isDarkMode
                          ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                          : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                      onClick={() => setIsOpen(false)}
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      className="block px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-base font-medium transition-colors duration-300"
                      onClick={() => setIsOpen(false)}
                    >
                      Sign Up
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Search Modal */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="md:hidden fixed inset-0 z-50 bg-black/50 pt-16"
          >
            <motion.div
              initial={{ y: -100 }}
              animate={{ y: 0 }}
              exit={{ y: -100 }}
              className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-4`}
            >
              <div className="flex items-center gap-2 mb-4">
                <motion.div
                  className={`flex-1 flex items-center rounded-lg px-3 py-2 ${
                    isDarkMode
                      ? 'bg-gray-700 border border-gray-600'
                      : 'bg-gray-100 border border-gray-300'
                  }`}
                >
                  <Search className="w-4 h-4 text-gray-400 mr-2" />
                  <input
                    type="text"
                    placeholder="Search items, books..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    onKeyDown={handleSearchSubmit}
                    autoFocus
                    className={`flex-1 bg-transparent outline-none text-sm ${
                      isDarkMode ? 'text-white placeholder-gray-400' : 'text-gray-900 placeholder-gray-500'
                    }`}
                  />
                </motion.div>
                <motion.button
                  onClick={() => {
                    setShowSearch(false);
                    setSearchQuery('');
                    setSearchResults([]);
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>

              {/* Mobile Search Results */}
              {searchLoading ? (
                <div className="p-4 text-center">
                  <div className="inline-block animate-spin">
                    <Search className="w-5 h-5 text-blue-500" />
                  </div>
                </div>
              ) : searchResults.length > 0 ? (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {searchResults.map((result) => (
                    <motion.div
                      key={`${result.category}-${result.id}`}
                      whileHover={{ scale: 1.02 }}
                      onClick={() => handleSearchResultClick(result)}
                      className={`p-3 rounded-lg cursor-pointer ${
                        isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {result.image ? (
                          <img
                            src={result.image}
                            alt={result.title}
                            className="w-10 h-10 rounded object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className={`w-10 h-10 rounded flex items-center justify-center flex-shrink-0 ${
                            isDarkMode ? 'bg-gray-600' : 'bg-gray-300'
                          }`}>
                            {result.category === 'items' ? (
                              <MapPinOff className="w-5 h-5 text-gray-400" />
                            ) : (
                              <Book className="w-5 h-5 text-gray-400" />
                            )}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <span className={`text-xs font-semibold px-2 py-1 rounded ${
                            result.category === 'items'
                              ? 'bg-purple-500/20 text-purple-400'
                              : 'bg-blue-500/20 text-blue-400'
                          }`}>
                            {result.type}
                          </span>
                          <p className={`text-sm font-medium mt-1 truncate ${
                            isDarkMode ? 'text-gray-100' : 'text-gray-900'
                          }`}>
                            {result.title}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : searchQuery ? (
                <div className="p-4 text-center">
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    No results found for "{searchQuery}"
                  </p>
                </div>
              ) : null}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;