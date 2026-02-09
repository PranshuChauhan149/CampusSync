import React from 'react';
import { motion } from 'framer-motion';
import { Package, BookOpen } from 'lucide-react';

const ImageGallery = ({ images, selectedIndex, onSelectIndex, isDarkMode, fallbackIcon = 'package' }) => {
  const FallbackIcon = fallbackIcon === 'book' ? BookOpen : Package;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl overflow-hidden ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      } shadow-xl`}
    >
      {/* Main Image */}
      <div className="relative h-96 bg-gray-900">
        {images && images.length > 0 ? (
          <img
            src={images[selectedIndex]}
            alt="Main view"
            className="w-full h-full object-contain"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <FallbackIcon className="w-24 h-24 text-gray-600" />
          </div>
        )}
      </div>

      {/* Thumbnail Gallery */}
      {images && images.length > 1 && (
        <div className="p-4 flex gap-2 overflow-x-auto">
          {images.map((img, index) => (
            <motion.button
              key={index}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSelectIndex(index)}
              className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                selectedIndex === index
                  ? 'border-blue-500'
                  : 'border-transparent'
              }`}
            >
              <img
                src={img}
                alt={`Thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </motion.button>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default ImageGallery;
