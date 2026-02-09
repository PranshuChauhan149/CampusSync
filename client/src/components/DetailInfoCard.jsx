import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Calendar, Package, Eye, Tag } from 'lucide-react';

const DetailInfoCard = ({ 
  title, 
  description, 
  details = [], 
  tags = [], 
  additionalFeatures = {},
  isDarkMode,
  statusBadge 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className={`rounded-2xl p-6 ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      } shadow-xl`}
    >
      {/* Header */}
      <div className="mb-4">
        {statusBadge && <div className="mb-3">{statusBadge}</div>}
        <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          {title}
        </h1>
      </div>

      {/* Description */}
      {description && (
        <div className="mb-6">
          <h2 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Description
          </h2>
          <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} leading-relaxed`}>
            {description}
          </p>
        </div>
      )}

      {/* Details Grid */}
      {details.length > 0 && (
        <div className="grid grid-cols-2 gap-4 mb-6">
          {details.map((detail, index) => (
            <div
              key={index}
              className={`flex items-center gap-3 p-3 rounded-lg ${
                isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'
              }`}
            >
              {detail.icon}
              <div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {detail.label}
                </p>
                <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {detail.value}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tags */}
      {tags && tags.length > 0 && (
        <div className="mb-6">
          <h3 className={`text-lg font-semibold mb-3 flex items-center gap-2 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            <Tag className="w-5 h-5" />
            Tags
          </h3>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag, index) => (
              <span
                key={index}
                className={`px-3 py-1 rounded-full text-sm ${
                  isDarkMode
                    ? 'bg-blue-500/20 text-blue-400'
                    : 'bg-blue-100 text-blue-700'
                }`}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Additional Features */}
      {additionalFeatures && Object.keys(additionalFeatures).some(key => additionalFeatures[key]) && (
        <div>
          <h3 className={`text-lg font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Additional Details
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(additionalFeatures).map(([key, value]) => 
              value && (
                <div key={key} className={`p-3 rounded-lg ${
                  isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'
                }`}>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} capitalize`}>
                    {key}
                  </p>
                  <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {value}
                  </p>
                </div>
              )
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default DetailInfoCard;
