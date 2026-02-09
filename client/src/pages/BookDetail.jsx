import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MapPin,
  Calendar,
  User,
  Phone,
  Mail,
  Eye,
  ArrowLeft,
  Heart,
  MessageCircle,
  Tag,
  BookOpen,
  Clock,
  Share2,
  Package
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { booksAPI, chatAPI, favoritesAPI } from '../services/api';
import Navbar from '../components/Navbar';
import { toast } from 'react-toastify';
import ImageGallery from '../components/ImageGallery';
import DetailInfoCard from '../components/DetailInfoCard';
import UserInfoCard from '../components/UserInfoCard';
import RelatedItemsGrid from '../components/RelatedItemsGrid';

const BookDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const { isAuthenticated, user } = useAuth();

  const [book, setBook] = useState(null);
  const [relatedBooks, setRelatedBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFavorited, setIsFavorited] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    fetchBookDetails();
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
      await booksAPI.incrementView(id);
    } catch (error) {
      // Silently fail - view counting is not critical
      // intentionally silent
    }
  };

  const fetchBookDetails = async () => {
    try {
      setLoading(true);
      const response = await booksAPI.getBookById(id);
      setBook(response.data.data);

      // Fetch related books based on subject
      if (response.data.data.subject) {
        const relatedResponse = await booksAPI.getBooks({
          subject: response.data.data.subject,
          status: 'available',
          limit: 6
        });
        const filteredRelated = relatedResponse.data.data.filter(b => b._id !== id);
        setRelatedBooks(filteredRelated.slice(0, 4));
      }

      // Check if favorited
      if (isAuthenticated) {
        try {
          const favResponse = await favoritesAPI.checkFavorite(id, 'book');
          setIsFavorited(favResponse.data.isFavorited || false);
        } catch (error) {
          console.error('Error checking favorite:', error);
          setIsFavorited(false);
        }
      }
    } catch (error) {
      console.error('Error fetching book details:', error);
      toast.error('Failed to load book details');
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
        await favoritesAPI.removeFromFavorites(book._id, 'book');
        setIsFavorited(false);
        toast.success('Removed from favorites');
      } else {
        await favoritesAPI.addToFavorites(book._id, 'book');
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

    if (user?._id === book.seller?._id) {
      toast.info('You cannot message yourself');
      return;
    }

    try {
      const response = await chatAPI.getOrCreateConversation(book.seller._id);
      const conversation = response.data?.data || response.data;
      const conversationId = conversation._id;
      navigate('/chat', { state: { conversationId } });
    } catch (error) {
      console.error('Error starting chat:', error);
      toast.error('Failed to start chat');
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: book.title,
        text: `${book.title} by ${book.author} - ${formatPrice(book.price)}`,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

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

  if (loading) {
    return (
      <>
 
        <div className="min-h-screen pt-20 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </>
    );
  }

  if (!book) {
    return (
      <>
   
        <div className="min-h-screen pt-20 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Book not found</h2>
            <button
              onClick={() => navigate('/books')}
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
            onClick={() => navigate('/books')}
            className={`mb-6 flex items-center gap-2 px-4 py-2 rounded-lg ${
              isDarkMode ? 'bg-gray-800 text-white hover:bg-gray-700' : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Books</span>
          </motion.button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Images and Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Image Gallery Component */}
              <ImageGallery
                images={book.images}
                selectedIndex={selectedImageIndex}
                onSelectIndex={setSelectedImageIndex}
                isDarkMode={isDarkMode}
                fallbackIcon="book"
              />

              {/* Book Details Component */}
              <DetailInfoCard
                title={book.title}
                description={book.description}
                details={[
                  {
                    icon: <BookOpen className="w-5 h-5 text-blue-500" />,
                    label: 'Subject',
                    value: book.subject
                  },
                  book.course && {
                    icon: <Tag className="w-5 h-5 text-blue-500" />,
                    label: 'Course',
                    value: book.course
                  },
                  book.isbn && {
                    icon: <Package className="w-5 h-5 text-blue-500" />,
                    label: 'ISBN',
                    value: book.isbn
                  },
                  book.edition && {
                    icon: <Calendar className="w-5 h-5 text-blue-500" />,
                    label: 'Edition',
                    value: book.edition
                  }
                ].filter(Boolean)}
                tags={[]}
                additionalFeatures={{
                  ...(book.publisher && { Publisher: book.publisher }),
                  ...(book.publicationYear && { 'Publication Year': book.publicationYear })
                }}
                isDarkMode={isDarkMode}
                statusBadge={
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <p className={`text-xl mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        by {book.author}
                      </p>
                      <div className="flex items-center gap-3">
                        <span className="text-3xl font-bold text-green-500">
                          {formatPrice(book.price)}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getConditionColor(book.condition)}`}>
                          {book.condition?.toUpperCase()}
                        </span>
                      </div>
                    </div>
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

            {/* Right Column - Seller Info and Actions */}
            <div className="space-y-6">
              {/* Seller Info Component */}
              <UserInfoCard
                user={book.seller}
                contactInfo={{ email: book.seller?.email, name: book.seller?.username }}
                isDarkMode={isDarkMode}
                isAuthenticated={isAuthenticated}
                currentUserId={user?._id}
                onChat={handleChat}
                onClaim={() => window.open(`mailto:${book.seller?.email || ''}?subject=Interested in: ${book.title}`)}
                showClaimButton={isAuthenticated}
                title="Seller Information"
                claimButtonText="Email Seller"
                claimButtonIcon={<Mail className="w-5 h-5" />}
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
                      {new Date(book.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Price Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className={`rounded-2xl p-6 ${
                  isDarkMode ? 'bg-gradient-to-br from-green-900/50 to-blue-900/50' : 'bg-gradient-to-br from-green-50 to-blue-50'
                } shadow-xl border-2 border-green-500/30`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      Asking Price
                    </p>
                    <p className="text-4xl font-bold text-green-500">
                      {formatPrice(book.price)}
                    </p>
                  </div>
                  <div className="text-5xl text-green-500/50 font-bold">₹</div>
                </div>
              </motion.div>

              {!isAuthenticated && (
                <button
                  onClick={() => navigate('/login')}
                  className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  Login to Contact Seller
                </button>
              )}
            </div>
          </div>

          {/* Related Books Component */}
          <RelatedItemsGrid
            items={relatedBooks}
            title="Related Books"
            isDarkMode={isDarkMode}
            basePath="/book"
            type="book"
          />
        </div>
      </div>
    </>
  );
};

export default BookDetail;
