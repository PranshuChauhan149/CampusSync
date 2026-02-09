import React from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, MessageCircle, Flag } from 'lucide-react';

const UserInfoCard = ({ 
  user, 
  contactInfo, 
  isDarkMode, 
  isAuthenticated, 
  currentUserId, 
  onChat, 
  onClaim,
  showClaimButton = true,
  title = "Posted By",
  claimButtonText = "Submit Claim",
  claimButtonIcon = <Flag className="w-5 h-5" />
}) => {
  const isOwnItem = currentUserId === user?._id;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className={`rounded-2xl p-6 ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      } shadow-xl`}
    >
      <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        {title}
      </h3>
      
      <div className="flex items-center gap-4 mb-4">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold">
          {user?.username?.charAt(0).toUpperCase() || 'U'}
        </div>
        <div>
          <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {user?.username || 'Anonymous'}
          </p>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Member since {new Date(user?.createdAt).getFullYear()}
          </p>
        </div>
      </div>

      {/* Contact Information */}
      {contactInfo && (
        <div className="space-y-3 mb-6">
          <div className={`flex items-center gap-3 p-3 rounded-lg ${
            isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'
          }`}>
            <User className="w-5 h-5 text-blue-500" />
            <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
              {contactInfo.name}
            </span>
          </div>

          <div className={`flex items-center gap-3 p-3 rounded-lg ${
            isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'
          }`}>
            <Mail className="w-5 h-5 text-blue-500" />
            <a
              href={`mailto:${contactInfo.email}`}
              className={`hover:underline ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
            >
              {contactInfo.email}
            </a>
          </div>

          {contactInfo.phone && (
            <div className={`flex items-center gap-3 p-3 rounded-lg ${
              isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'
            }`}>
              <Phone className="w-5 h-5 text-blue-500" />
              <a
                href={`tel:${contactInfo.phone}`}
                className={`hover:underline ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
              >
                {contactInfo.phone}
              </a>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      {isAuthenticated && !isOwnItem && (
        <div className="space-y-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onChat}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            <MessageCircle className="w-5 h-5" />
            <span>Message Poster</span>
          </motion.button>

          {showClaimButton && onClaim && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onClaim}
              className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium ${
                isDarkMode
                  ? 'bg-gray-700 text-white hover:bg-gray-600'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {claimButtonIcon}
              <span>{claimButtonText}</span>
            </motion.button>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default UserInfoCard;
