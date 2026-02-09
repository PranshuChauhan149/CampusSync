import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  MapPin,
  Book,
  ChevronDown,
  Grid,
  List,
  X,
  IndianRupee,
  Clock,
  Eye
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { itemsAPI, booksAPI } from '../services/api';

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q') || '';
  const { isDarkMode } = useTheme();

  const [items, setItems] = useState([]);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [activeTab, setActiveTab] = useState('all');
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    if (!query.trim()) {
      navigate('/');
      return;
    }

    const fetchResults = async () => {
      setLoading(true);
      try {
        const [itemsRes, booksRes] = await Promise.all([
          itemsAPI.getItems({ search: query, limit: 50 }),
          booksAPI.getBooks({ search: query, limit: 50 })
        ]);

        setItems(itemsRes.data.data || []);
        setBooks(booksRes.data.data || []);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query, navigate]);

  const displayedItems = activeTab === 'all' 
    ? [...items, ...books]
    : activeTab === 'items' 
    ? items 
    : books;

  const itemCount = items.length + books.length;

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className={`${isDarkMode ? 'bg-gray-800 border-b border-gray-700' : 'bg-white border-b border-gray-200'} sticky top-16 z-30`}>
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col gap-4">
            {/* Search Bar */}
            <div className="flex items-center gap-3">
              <Search className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
              <input
                type="text"
                placeholder="Search items, books..."
                defaultValue={query}
                onChange={(e) => {
                  if (e.target.value.trim()) {
                    navigate(`/search?q=${encodeURIComponent(e.target.value)}`);
                  }
                }}
                className={`flex-1 px-4 py-2 rounded-lg border ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-gray-100 border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
              />
              <button
                onClick={() => navigate('/')}
                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Results Info and Controls */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Found <span className="font-semibold text-blue-500">{itemCount}</span> results for "<span className="font-semibold">{query}</span>"
                </p>
              </div>

              <div className="flex items-center gap-2">
                {/* Tab Filter */}
                <div className="flex gap-2">
                  {[
                    { id: 'all', label: 'All' },
                    { id: 'items', label: 'Items' },
                    { id: 'books', label: 'Books' }
                  ].map((tab) => (
                    <motion.button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        activeTab === tab.id
                          ? 'bg-blue-600 text-white'
                          : isDarkMode
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {tab.label}
                    </motion.button>
                  ))}
                </div>

                {/* View Mode Toggle */}
                <div className="flex gap-2 border-l pl-2 ml-2 border-gray-300 dark:border-gray-600">
                  <motion.button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg transition-all ${
                      viewMode === 'grid'
                        ? 'bg-blue-600 text-white'
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
                        ? 'bg-blue-600 text-white'
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
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin">
              <Search className="w-8 h-8 text-blue-500" />
            </div>
            <p className={`mt-4 text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Searching...
            </p>
          </div>
        ) : displayedItems.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`text-center py-20 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
          >
            <Search className={`w-12 h-12 mx-auto mb-4 ${isDarkMode ? 'text-gray-600' : 'text-gray-300'}`} />
            <p className={`text-xl font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              No results found
            </p>
            <p className={`text-sm mt-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
              Try a different search term
            </p>
          </motion.div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {displayedItems.map((item, index) => {
              const isBook = item.subject !== undefined;
              const isFound = item.type === 'found';

              return (
                <motion.div
                  key={`${isBook ? 'book' : 'item'}-${item._id}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -8 }}
                  className={`rounded-lg overflow-hidden cursor-pointer shadow-md hover:shadow-xl transition-all ${
                    isDarkMode ? 'bg-gray-800' : 'bg-white'
                  }`}
                  onClick={() => {
                    if (isBook) navigate(`/book/${item._id}`);
                    else navigate(`/item/${item._id}`);
                  }}
                >
                  {/* Image */}
                  <div className="relative h-40 bg-gray-200 dark:bg-gray-700 overflow-hidden group">
                    {isBook ? (
                      item.image ? (
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-400 to-purple-500">
                          <Book className="w-8 h-8 text-white" />
                        </div>
                      )
                    ) : item.images?.[0] ? (
                      <img
                        src={item.images[0]}
                        alt={item.title}
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
                          isBook
                            ? 'bg-blue-500'
                            : isFound
                            ? 'bg-green-500'
                              : 'bg-red-500'
                        }`}
                      >
                        {isBook ? 'Book' : isFound ? 'Found' : 'Lost'}
                      </span>
                    </div>

                    {/* View Count */}
                    {!isBook && item.views && (
                      <div className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {item.views}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className={`font-semibold line-clamp-2 mb-2 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {item.title}
                    </h3>

                    {isBook ? (
                      <div className={`text-sm space-y-1 mb-3 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        <p className="truncate">{item.subject}</p>
                        <p className="text-blue-500 font-semibold flex items-center gap-1">
                          <IndianRupee className="w-4 h-4" />
                          {item.price}
                        </p>
                      </div>
                    ) : (
                      <div className={`text-sm space-y-1 mb-3 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        <p className="truncate flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {item.location}
                        </p>
                        {item.dateReported && (
                          <p className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {new Date(item.dateReported).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    )}

                    <div className="text-xs text-gray-500">
                      {isBook
                        ? `Condition: ${item.condition}`
                        : `Category: ${item.category}`}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-4">
            {displayedItems.map((item, index) => {
              const isBook = item.subject !== undefined;
              const isFound = item.type === 'found';

              return (
                <motion.div
                  key={`${isBook ? 'book' : 'item'}-${item._id}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`p-4 rounded-lg flex gap-4 cursor-pointer transition-all hover:shadow-md ${
                    isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:shadow-lg'
                  }`}
                  onClick={() => {
                    if (isBook) navigate(`/book/${item._id}`);
                    else navigate(`/item/${item._id}`);
                  }}
                >
                  {/* Image */}
                  <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-gray-200 dark:bg-gray-700">
                    {isBook ? (
                      item.image ? (
                        <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-400 to-purple-500">
                          <Book className="w-6 h-6 text-white" />
                        </div>
                      )
                    ) : item.images?.[0] ? (
                      <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-400 to-pink-500">
                        <MapPin className="w-6 h-6 text-white" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className={`font-semibold line-clamp-1 ${
                            isDarkMode ? 'text-white' : 'text-gray-900'
                          }`}>
                            {item.title}
                          </h3>
                          <span className={`text-xs font-bold px-2 py-1 rounded-full text-white flex-shrink-0 ${
                            isBook
                              ? 'bg-blue-500'
                              : isFound
                              ? 'bg-green-500'
                              : 'bg-red-500'
                          }`}>
                            {isBook ? 'Book' : isFound ? 'Found' : 'Lost'}
                          </span>
                        </div>

                        {isBook ? (
                          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {item.subject}
                          </p>
                        ) : (
                          <p className={`text-sm flex items-center gap-1 ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            <MapPin className="w-3 h-3" />
                            {item.location}
                          </p>
                        )}

                        <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                          {isBook
                            ? `Condition: ${item.condition} • Category: ${item.subject}`
                            : `Category: ${item.category} • Posted: ${new Date(item.dateReported).toLocaleDateString()}`}
                        </p>
                      </div>

                      {isBook ? (
                        <div className="text-right flex-shrink-0">
                          <p className="text-blue-500 font-semibold flex items-center gap-1">
                            <IndianRupee className="w-4 h-4" />
                            {item.price}
                          </p>
                        </div>
                      ) : item.views ? (
                        <div className="text-right flex-shrink-0">
                          <p className={`text-sm flex items-center gap-1 ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            <Eye className="w-4 h-4" />
                            {item.views}
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
      </div>
    </div>
  );
};

export default SearchResults;
