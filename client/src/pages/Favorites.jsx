import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  MapPin,
  Book,
  X,
  Grid,
  List,
  IndianRupee,
  Eye,
  MessageCircle,
  Download,
  Filter,
  ArrowRight
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { favoritesAPI, chatAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';

import { toast } from 'react-toastify';

const Favorites = () => {
  const { isDarkMode } = useTheme();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  
  const [viewMode, setViewMode] = useState('grid');
  const [filterType, setFilterType] = useState('all'); // all, item, book
  const [selectedFavorite, setSelectedFavorite] = useState(null);
  // Local favorites state (from API)
  const [favoritesList, setFavoritesList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchFavorites(1);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    // load more when page changes (except initial handled above)
    if (page > 1 && isAuthenticated) fetchFavorites(page);
  }, [page]);

  const fetchFavorites = async (p = 1) => {
    try {
      setLoading(true);
      const res = await favoritesAPI.getFavorites({ page: p, limit });
      const data = res.data?.data || [];
      const pagination = res.data?.pagination || {};
      if (p === 1) setFavoritesList(data);
      else setFavoritesList(prev => [...prev, ...data]);
      setHasMore((pagination.pages || 0) > p);
    } catch (error) {
      console.error('❌ Error fetching favorites:', error);
      toast.error('Failed to load favorites');
    } finally {
      setLoading(false);
    }
  };

  const allFavorites = favoritesList || [];

  const filteredFavorites = filterType === 'all' 
    ? allFavorites 
    : allFavorites.filter(fav => fav.type === filterType);

  const handleRemoveFavorite = async (itemId, isFavBook) => {
    try {
      const type = isFavBook ? 'book' : 'item';
      await favoritesAPI.removeFromFavorites(itemId, type);
      // optimistically remove
      setFavoritesList(prev => prev.filter(f => f._id !== itemId && f.favoriteId !== itemId));
      setSelectedFavorite(null);
      toast.success('Removed from favorites');
    } catch (error) {
      console.error('❌ Error removing favorite:', error);
      toast.error('Failed to remove from favorites');
    }
  };

  const handleMessageOwner = async (fav) => {
    try {
      // Determine other user id
      const otherUserId = fav.seller?._id || fav.reportedBy?._id || fav.seller || fav.reportedBy;
      if (!otherUserId) return navigate('/chat');
      const res = await chatAPI.getOrCreateConversation(otherUserId);
      const conv = res.data?.data;
      if (conv && conv._id) {
        navigate('/chat', { state: { conversationId: conv._id } });
      } else {
        navigate('/chat');
      }
    } catch (error) {
      console.error('❌ Error opening chat:', error);
      navigate('/chat');
    }
  };

  const getFavoriteType = (fav) => {
    if (fav.favoriteType) return fav.favoriteType;
    if (fav.subject !== undefined || fav.price !== undefined) return 'book';
    return 'item';
  };

  const isBook = (fav) => getFavoriteType(fav) === 'book';
  const isItem = (fav) => getFavoriteType(fav) === 'item';

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className={`${isDarkMode ? 'bg-gray-800 border-b border-gray-700' : 'bg-white border-b border-gray-200'} sticky top-16 z-40`}>
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col gap-4">
            {/* Title */}
            <div className="flex items-center gap-3">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
              >
                <Heart className="w-8 h-8 text-red-500 fill-red-500" />
              </motion.div>
              <div>
                <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  My Favorites
                </h1>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {filteredFavorites.length} items saved
                </p>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
              {/* Filter */}
              <div className="flex gap-2">
                {[
                  { id: 'all', label: 'All' },
                  { id: 'item', label: 'Items' },
                  { id: 'book', label: 'Books' }
                ].map((filter) => (
                  <motion.button
                    key={filter.id}
                    onClick={() => setFilterType(filter.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      filterType === filter.id
                        ? 'bg-red-500 text-white'
                        : isDarkMode
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {filter.label}
                  </motion.button>
                ))}
              </div>

              {/* View Mode Toggle */}
              <div className="flex gap-2 border-l pl-2 border-gray-300 dark:border-gray-600">
                <motion.button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === 'grid'
                      ? 'bg-red-500 text-white'
                      : isDarkMode
                      ? 'text-gray-400 hover:bg-gray-700'
                      : 'text-gray-600 hover:bg-gray-200'
                  }`}
                  whileHover={{ scale: 1.05 }}
                >
                  <Grid className="w-5 h-5" />
                </motion.button>
                <motion.button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === 'list'
                      ? 'bg-red-500 text-white'
                      : isDarkMode
                      ? 'text-gray-400 hover:bg-gray-700'
                      : 'text-gray-600 hover:bg-gray-200'
                  }`}
                  whileHover={{ scale: 1.05 }}
                >
                  <List className="w-5 h-5" />
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {loading && filteredFavorites.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin">
              <Heart className="w-8 h-8 text-red-500" />
            </div>
            <p className={`mt-4 text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Loading your favorites...
            </p>
          </div>
        ) : filteredFavorites.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`text-center py-20 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
          >
            <Heart className={`w-12 h-12 mx-auto mb-4 ${isDarkMode ? 'text-gray-600' : 'text-gray-300'}`} />
            <p className={`text-xl font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              No favorites yet
            </p>
            <p className={`text-sm mt-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
              Start adding items and books to your favorites
            </p>
            <motion.button
              onClick={() => navigate('/lost-found')}
              className="mt-6 px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg font-medium hover:shadow-lg transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Browse Items
            </motion.button>
          </motion.div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredFavorites.map((favorite, index) => {
              const isFavBook = isBook(favorite);

              return (
                <motion.div
                  key={favorite._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -8 }}
                  className={`rounded-lg overflow-hidden cursor-pointer shadow-md hover:shadow-xl transition-all group ${
                    isDarkMode ? 'bg-gray-800' : 'bg-white'
                  }`}
                  onClick={() => setSelectedFavorite(favorite)}
                >
                  {/* Image */}
                  <div className="relative h-40 bg-gray-200 dark:bg-gray-700 overflow-hidden">
                    {isFavBook ? (
                      favorite.image ? (
                        <img
                          src={favorite.image}
                          alt={favorite.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-400 to-purple-500">
                          <Book className="w-8 h-8 text-white" />
                        </div>
                      )
                    ) : favorite.images?.[0] ? (
                      <img
                        src={favorite.images[0]}
                        alt={favorite.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-400 to-pink-500">
                        <MapPin className="w-8 h-8 text-white" />
                      </div>
                    )}

                    {/* Badge */}
                    <div className="absolute top-2 right-2">
                      <span
                        className={`text-xs font-bold px-3 py-1 rounded-full text-white ${
                          isFavBook
                            ? 'bg-blue-500'
                            : favorite.type === 'found'
                            ? 'bg-green-500'
                            : 'bg-purple-500'
                        }`}
                      >
                        {isFavBook ? 'Book' : favorite.type === 'found' ? 'Found' : 'Lost'}
                      </span>
                    </div>

                    {/* Heart Icon */}
                    <motion.button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFavorite(favorite._id, isFavBook);
                      }}
                      className="absolute top-2 left-2 p-2 bg-red-500/90 hover:bg-red-600 text-white rounded-full transition-all"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Heart className="w-5 h-5 fill-white" />
                    </motion.button>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className={`font-semibold line-clamp-2 mb-2 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {favorite.title}
                    </h3>

                    {isFavBook ? (
                      <div className={`text-sm space-y-1 mb-3 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        <p className="truncate">{favorite.subject}</p>
                        <p className="text-blue-500 font-semibold flex items-center gap-1">
                          <IndianRupee className="w-4 h-4" />
                          {favorite.price}
                        </p>
                      </div>
                    ) : (
                      <div className={`text-sm space-y-1 mb-3 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        <p className="truncate flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {favorite.location}
                        </p>
                      </div>
                    )}

                    <div className="text-xs text-gray-500">
                      {isFavBook ? `Condition: ${favorite.condition}` : `Category: ${favorite.category}`}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredFavorites.map((favorite, index) => {
              const isFavBook = isBook(favorite);

              return (
                <motion.div
                  key={favorite._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`p-4 rounded-lg flex gap-4 cursor-pointer transition-all hover:shadow-md ${
                    isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:shadow-lg'
                  }`}
                  onClick={() => setSelectedFavorite(favorite)}
                >
                  {/* Image */}
                  <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-gray-200 dark:bg-gray-700 relative group">
                    {isFavBook ? (
                      favorite.image ? (
                        <img src={favorite.image} alt={favorite.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-400 to-purple-500">
                          <Book className="w-6 h-6 text-white" />
                        </div>
                      )
                    ) : favorite.images?.[0] ? (
                      <img src={favorite.images[0]} alt={favorite.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-400 to-pink-500">
                        <MapPin className="w-6 h-6 text-white" />
                      </div>
                    )}

                    {/* Heart */}
                    <motion.button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFavorite(favorite._id, isFavBook);
                      }}
                      className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity"
                      whileHover={{ scale: 1.1 }}
                    >
                      <Heart className="w-6 h-6 fill-red-500 text-red-500" />
                    </motion.button>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className={`font-semibold line-clamp-1 ${
                            isDarkMode ? 'text-white' : 'text-gray-900'
                          }`}>
                            {favorite.title}
                          </h3>
                          <span className={`text-xs font-bold px-2 py-1 rounded-full text-white flex-shrink-0 ${
                            isFavBook
                              ? 'bg-blue-500'
                              : favorite.type === 'found'
                              ? 'bg-green-500'
                              : 'bg-purple-500'
                          }`}>
                            {isFavBook ? 'Book' : favorite.type === 'found' ? 'Found' : 'Lost'}
                          </span>
                        </div>

                        {isFavBook ? (
                          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {favorite.subject}
                          </p>
                        ) : (
                          <p className={`text-sm flex items-center gap-1 ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            <MapPin className="w-3 h-3" />
                            {favorite.location}
                          </p>
                        )}

                        <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                          {isFavBook ? `Condition: ${favorite.condition}` : `Category: ${favorite.category}`}
                        </p>
                      </div>

                      {isFavBook ? (
                        <div className="text-right flex-shrink-0">
                          <p className="text-blue-500 font-semibold flex items-center gap-1">
                            <IndianRupee className="w-4 h-4" />
                            {favorite.price}
                          </p>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Load More */}
        {hasMore && (
          <motion.button
            onClick={() => setPage(p => p + 1)}
            className="mt-8 w-full py-3 border-2 border-red-500 text-red-500 rounded-lg font-semibold hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Load More
          </motion.button>
        )}
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedFavorite && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setSelectedFavorite(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className={`max-w-2xl w-full rounded-lg overflow-hidden ${
                isDarkMode ? 'bg-gray-800' : 'bg-white'
              }`}
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-700 dark:border-gray-600">
                <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {selectedFavorite.title}
                </h2>
                <button onClick={() => setSelectedFavorite(null)}>
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 max-h-96 overflow-y-auto">
                {/* Image */}
                <div className="mb-6">
                  {isBook(selectedFavorite) ? (
                    selectedFavorite.image ? (
                      <img src={selectedFavorite.image} alt={selectedFavorite.title} className="w-full h-64 object-cover rounded-lg" />
                    ) : (
                      <div className="w-full h-40 flex items-center justify-center bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg">
                        <Book className="w-12 h-12 text-white" />
                      </div>
                    )
                  ) : selectedFavorite.images?.[0] ? (
                    <img src={selectedFavorite.images[0]} alt={selectedFavorite.title} className="w-full h-64 object-cover rounded-lg" />
                  ) : (
                    <div className="w-full h-40 flex items-center justify-center bg-gradient-to-br from-purple-400 to-pink-500 rounded-lg">
                      <MapPin className="w-12 h-12 text-white" />
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="space-y-4">
                  {isBook(selectedFavorite) ? (
                    <>
                      <div>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Subject</p>
                        <p className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {selectedFavorite.subject}
                        </p>
                      </div>
                      <div>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Price</p>
                        <p className="text-2xl font-bold text-blue-500 flex items-center gap-1">
                          <IndianRupee className="w-6 h-6" />
                          {selectedFavorite.price}
                        </p>
                      </div>
                      <div>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Condition</p>
                        <p className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {selectedFavorite.condition}
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Location</p>
                        <p className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {selectedFavorite.location}
                        </p>
                      </div>
                      <div>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Category</p>
                        <p className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {selectedFavorite.category}
                        </p>
                      </div>
                      <div>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Description</p>
                        <p className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {selectedFavorite.description}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="p-4 border-t border-gray-700 dark:border-gray-600 flex gap-3">
                <motion.button
                  onClick={() => handleRemoveFavorite(selectedFavorite._id, isBook(selectedFavorite))}
                  className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Heart className="w-5 h-5" />
                  Remove from Favorites
                </motion.button>
                <motion.button
                  onClick={() => {
                    setSelectedFavorite(null);
                    handleMessageOwner(selectedFavorite);
                  }}
                  className="flex-1 px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <MessageCircle className="w-5 h-5" />
                  Message
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Favorites;
