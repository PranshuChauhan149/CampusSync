import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { MapPin, Eye, Package, BookOpen } from 'lucide-react';

const RelatedItemsGrid = ({ items, title = "Related Items", isDarkMode, basePath = "/item", type = "item" }) => {
  const navigate = useNavigate();
  const FallbackIcon = type === 'book' ? BookOpen : Package;

  if (!items || items.length === 0) return null;

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(price);
  };

  const getConditionColor = (condition) => {
    const colors = {
      new: 'bg-green-500/20 text-green-400',
      excellent: 'bg-blue-500/20 text-blue-400',
      good: 'bg-yellow-500/20 text-yellow-400',
      fair: 'bg-orange-500/20 text-orange-400',
      poor: 'bg-red-500/20 text-red-400'
    };
    return colors[condition] || 'bg-gray-500/20 text-gray-400';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="mt-12"
    >
      <h2 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        {title}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {items.map((item, index) => (
          <motion.div
            key={item._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + index * 0.1 }}
            whileHover={{ y: -5 }}
            onClick={() => navigate(`${basePath}/${item._id}`)}
            className={`rounded-xl overflow-hidden cursor-pointer ${
              isDarkMode ? 'bg-gray-800' : 'bg-white'
            } shadow-lg hover:shadow-xl transition-all`}
          >
            {/* Image */}
            <div className="relative h-48 bg-gray-900">
              {item.images && item.images.length > 0 ? (
                <img
                  src={item.images[0]}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <FallbackIcon className="w-16 h-16 text-gray-600" />
                </div>
              )}
              {type === 'item' ? (
                <span
                  className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium ${
                    item.type === 'lost'
                      ? 'bg-red-500/90 text-white'
                      : 'bg-green-500/90 text-white'
                  }`}
                >
                  {item.type === 'lost' ? 'Lost' : 'Found'}
                </span>
                ) : (
                <span className="absolute top-3 right-3 px-3 py-1 rounded-full text-sm font-bold bg-green-500 text-white">
                  {formatPrice(item.price)}
                </span>
              )}
            </div>

            {/* Content */}
            <div className="p-4">
              <h3 className={`font-semibold mb-2 line-clamp-1 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {item.title}
              </h3>
              <p className={`text-sm mb-3 line-clamp-2 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {item.description || (type === 'book' && `by ${item.author}`)}
              </p>
              <div className="flex items-center justify-between text-sm">
                {type === 'item' ? (
                  <>
                    <div className="flex items-center gap-1 text-gray-500">
                      <MapPin className="w-4 h-4" />
                      <span className="line-clamp-1">{item.location}</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-500">
                      <Eye className="w-4 h-4" />
                      <span>{item.views || 0}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <span className={`px-2 py-1 rounded-full text-xs ${getConditionColor(item.condition)}`}>
                      {item.condition}
                    </span>
                    <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                      {item.subject}
                    </span>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default RelatedItemsGrid;
