import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MapPin,
  Calendar,
  Eye,
  ArrowLeft,
  Heart,
  Package,
  Clock,
  Share2,
  Send,
  X
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { itemsAPI, chatAPI, favoritesAPI } from '../services/api';

import ImageGallery from '../components/ImageGallery';
import DetailInfoCard from '../components/DetailInfoCard';
import UserInfoCard from '../components/UserInfoCard';
import RelatedItemsGrid from '../components/RelatedItemsGrid';
import ClaimModal from '../components/ClaimModal';
import { toast } from 'react-toastify';

const ItemDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const { isAuthenticated, user } = useAuth();

  const [item, setItem] = useState(null);
  const [relatedItems, setRelatedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFavorited, setIsFavorited] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showMessageDialog, setShowMessageDialog] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [showClaimModal, setShowClaimModal] = useState(false);

  useEffect(() => {
    fetchItemDetails();
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    // Increment view count when component mounts
    if (id) {
      incrementView();
    }
  }, [id]);

  const incrementView = async () => {
    try {
      await itemsAPI.incrementView(id);
    } catch (error) {
      // Silently fail - view counting is not critical
      // intentionally silent
    }
  };

  const fetchItemDetails = async () => {
    try {
      setLoading(true);
      const response = await itemsAPI.getItemById(id);
      setItem(response.data.data);

      // Fetch related items based on category
      if (response.data.data.category) {
        const relatedResponse = await itemsAPI.getItems({
          category: response.data.data.category,
          status: 'active',
          limit: 6
        });
        const filteredRelated = relatedResponse.data.data.filter(i => i._id !== id);
        setRelatedItems(filteredRelated.slice(0, 4));
      }

      // Check if favorited
      if (isAuthenticated) {
        try {
          const favResponse = await favoritesAPI.checkFavorite(id, 'item');
          setIsFavorited(favResponse.data.isFavorited || false);
        } catch (error) {
          console.error('Error checking favorite:', error);
          setIsFavorited(false);
        }
      }
    } catch (error) {
      console.error('Error fetching item details:', error);
      toast.error('Failed to load item details');
    } finally {
      setLoading(false);
    }
  };

  const handleFavorite = async () => {
    if (!isAuthenticated) {
      toast.info('Please login to add favorites');
      navigate('/login');
      return;
    }

    try {
      if (isFavorited) {
        await favoritesAPI.removeFromFavorites(item._id, 'item');
        setIsFavorited(false);
        toast.success('Removed from favorites');
      } else {
        await favoritesAPI.addToFavorites(item._id, 'item');
        setIsFavorited(true);
        toast.success('Added to favorites');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Failed to update favorites');
    }
  };

  const handleChat = async () => {
    if (!isAuthenticated) {
      toast.info('Please login to start a chat');
      navigate('/login');
      return;
    }

    if (user?._id === item.reportedBy?._id) {
      toast.info('You cannot message yourself');
      return;
    }

    try {
      const response = await chatAPI.getOrCreateConversation(item.reportedBy._id);
      const conversation = response.data?.data || response.data;
      const conversationId = conversation._id || conversation?._id;
      navigate('/chat', { state: { conversationId } });
    } catch (error) {
      console.error('Error starting chat:', error);
      toast.error('Failed to start chat');
    }
  };

  const handleSendMessage = async () => {
    if (!messageText.trim()) {
      toast.error('Please enter a message');
      return;
    }

    setSendingMessage(true);
    try {
      // Create or get conversation
      const response = await chatAPI.getOrCreateConversation(item.reportedBy._id);
      const conversation = response.data?.data || response.data;
      const conversationId = conversation._id;

      // Send the message
      await chatAPI.sendMessage(conversationId, { content: messageText });
      
      toast.success('Message sent successfully!');
      setShowMessageDialog(false);
      setMessageText('');
      
      // Navigate to chat page to see the conversation
      navigate('/chat', { state: { conversationId } });
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: item.title,
        text: item.description,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <>
        
        <div className="min-h-screen pt-20 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </>
    );
  }

  if (!item) {
    return (
      <>
      
        <div className="min-h-screen pt-20 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Item not found</h2>
            <button
              onClick={() => navigate('/lost-found')}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Go Back
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
   
      <div className={`min-h-screen pt-20 pb-12 px-4 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="max-w-7xl mx-auto">
          {/* Back Button */}
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => navigate('/lost-found')}
            className={`mb-6 flex items-center gap-2 px-4 py-2 rounded-lg ${
              isDarkMode ? 'bg-gray-800 text-white hover:bg-gray-700' : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Items</span>
          </motion.button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Images and Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Image Gallery Component */}
              <ImageGallery
                images={item.images}
                selectedIndex={selectedImageIndex}
                onSelectIndex={setSelectedImageIndex}
                isDarkMode={isDarkMode}
                fallbackIcon="package"
              />

              {/* Item Details Component */}
              <DetailInfoCard
                title={item.title}
                description={item.description}
                details={[
                  {
                    icon: <MapPin className="w-5 h-5 text-blue-500" />,
                    label: 'Location',
                    value: item.location
                  },
                  {
                    icon: <Calendar className="w-5 h-5 text-blue-500" />,
                    label: 'Date',
                    value: new Date(item.date).toLocaleDateString()
                  },
                  {
                    icon: <Package className="w-5 h-5 text-blue-500" />,
                    label: 'Category',
                    value: item.category
                  },
                  {
                    icon: <Eye className="w-5 h-5 text-blue-500" />,
                    label: 'Views',
                    value: item.views || 0
                  }
                ]}
                tags={item.tags}
                additionalFeatures={item.features}
                isDarkMode={isDarkMode}
                statusBadge={
                  <div className="flex items-start justify-between mb-4">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                        item.type === 'lost'
                          ? 'bg-red-500/20 text-red-400'
                          : 'bg-green-500/20 text-green-400'
                      }`}
                    >
                      {item.type === 'lost' ? '🔍 Lost' : '✓ Found'}
                    </span>
                    <div className="flex gap-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={handleFavorite}
                        className={`p-3 rounded-full ${
                          isFavorited
                            ? 'bg-red-500 text-white'
                            : isDarkMode
                            ? 'bg-gray-700 text-gray-300'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={handleShare}
                        className={`p-3 rounded-full ${
                          isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        <Share2 className="w-5 h-5" />
                      </motion.button>
                    </div>
                  </div>
                }
              />
            </div>

            {/* Right Column - User Info and Actions */}
            <div className="space-y-6">
              {/* User Info Component */}
              <UserInfoCard
                user={item.reportedBy}
                contactInfo={item.contactInfo}
                isDarkMode={isDarkMode}
                isAuthenticated={isAuthenticated}
                currentUserId={user?._id}
                onChat={handleChat}
                onClaim={() => setShowClaimModal(true)}
                showClaimButton={true}
                title="Posted By"
              />

              {/* Posted Time */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className={`rounded-2xl p-6 ${
                  isDarkMode ? 'bg-gray-800' : 'bg-white'
                } shadow-xl`}
              >
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Posted on
                    </p>
                    <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {new Date(item.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Related Items Component */}
          <RelatedItemsGrid
            items={relatedItems}
            title="Related Items"
            isDarkMode={isDarkMode}
            basePath="/item"
            type="item"
          />
        </div>

        <ClaimModal isOpen={showClaimModal} item={item} onClose={() => setShowClaimModal(false)} />

        {/* Message Dialog */}
        {showMessageDialog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`w-full max-w-lg rounded-2xl shadow-2xl ${
                isDarkMode ? 'bg-gray-800' : 'bg-white'
              }`}
            >
              {/* Dialog Header */}
              <div className="flex items-center justify-between p-6 border-b ${
                isDarkMode ? 'border-gray-700' : 'border-gray-200'
              }">
                <h3 className={`text-xl font-semibold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Send Message to {item.reportedBy?.username || 'Poster'}
                </h3>
                <button
                  onClick={() => {
                    setShowMessageDialog(false);
                    setMessageText('');
                  }}
                  className={`p-2 rounded-lg transition-colors ${
                    isDarkMode
                      ? 'hover:bg-gray-700 text-gray-400 hover:text-white'
                      : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Dialog Content */}
              <div className="p-6 space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Your Message
                  </label>
                  <textarea
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder={`Hi, I'm interested in your ${item.type === 'lost' ? 'lost' : 'found'} item "${item.title}"...`}
                    rows={5}
                    className={`w-full px-4 py-3 rounded-lg border resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                  />
                </div>

                <div className={`p-4 rounded-lg ${
                  isDarkMode ? 'bg-gray-700/50' : 'bg-blue-50'
                }`}>
                  <p className={`text-sm ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    <strong>Item:</strong> {item.title}
                  </p>
                  <p className={`text-sm ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    <strong>Location:</strong> {item.location}
                  </p>
                </div>
              </div>

              {/* Dialog Actions */}
              <div className={`flex gap-3 p-6 border-t ${
                isDarkMode ? 'border-gray-700' : 'border-gray-200'
              }`}>
                <button
                  onClick={() => {
                    setShowMessageDialog(false);
                    setMessageText('');
                  }}
                  disabled={sendingMessage}
                  className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors ${
                    isDarkMode
                      ? 'bg-gray-700 text-white hover:bg-gray-600'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendMessage}
                  disabled={sendingMessage || !messageText.trim()}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {sendingMessage ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      <span>Send Message</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </>
  );
};

export default ItemDetail;
