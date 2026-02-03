import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, User, Mail, Phone, Image as ImageIcon, AlertCircle, XCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { itemsAPI } from '../services/api';
import { toast } from 'react-toastify';

const ClaimHistory = () => {
  const { isDarkMode } = useTheme();
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [claims, setClaims] = useState([]);
  const [expandedClaim, setExpandedClaim] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchClaims = async () => {
      try {
        setLoading(true);
        const response = await itemsAPI.getSentClaims();
        setClaims(response.data.data || []);
      } catch (error) {
        console.error('Failed to load sent claims:', error);
        toast.error(error.response?.data?.message || 'Failed to load sent claims');
      } finally {
        setLoading(false);
      }
    };

    fetchClaims();
  }, [isAuthenticated]);

  const getStatusIcon = (status) => {
    switch(status) {
      case 'approved':
        return <AlertCircle className="w-5 h-5 text-green-500" />;
      case 'pending':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'claimed':
        return <AlertCircle className="w-5 h-5 text-blue-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'approved':
        return isDarkMode ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800';
      case 'pending':
        return isDarkMode ? 'bg-yellow-900 text-yellow-200' : 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return isDarkMode ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-800';
      case 'claimed':
        return isDarkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800';
      default:
        return isDarkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-800';
    }
  };

  if (!isAuthenticated) {
    return (
      <div className={`min-h-screen pt-24 pb-12 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="max-w-4xl mx-auto px-4">
          <div className={`rounded-xl p-8 text-center ${isDarkMode ? 'bg-gray-800 text-gray-200' : 'bg-white text-gray-800'} shadow-lg`}>
            <h1 className="text-2xl font-bold mb-2">Claim History</h1>
            <p>Please login to view your claim history.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen pt-24 pb-12 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-6">
          <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            📋 My Claim History
          </h1>
          <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
            Track all your claim requests and their status
          </p>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((skeleton) => (
              <div key={skeleton} className={`rounded-xl p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg animate-pulse`}>
                <div className="h-6 w-1/3 bg-gray-300 dark:bg-gray-700 rounded mb-4"></div>
                <div className="h-4 w-2/3 bg-gray-300 dark:bg-gray-700 rounded mb-2"></div>
                <div className="h-4 w-1/2 bg-gray-300 dark:bg-gray-700 rounded"></div>
              </div>
            ))}
          </div>
        ) : claims.length === 0 ? (
          <div className={`rounded-xl p-8 text-center ${isDarkMode ? 'bg-gray-800 text-gray-200' : 'bg-white text-gray-800'} shadow-lg`}>
            <p className="text-lg font-medium">No claims submitted yet.</p>
            <p className={`text-sm mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Start claiming lost/found items to see them here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {claims.map((claim) => (
              <motion.div
                key={claim._id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-xl overflow-hidden shadow-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
              >
                {/* Collapsed View */}
                <button
                  onClick={() => setExpandedClaim(expandedClaim === claim._id ? null : claim._id)}
                  className={`w-full p-5 flex items-center justify-between transition-colors hover:opacity-80`}
                >
                  <div className="flex items-center gap-4 flex-1 text-left">
                    {/* Item Info */}
                    <div className="flex-1">
                      <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {claim.item?.title}
                      </h3>
                      <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Claimed from: <span className="font-medium">{claim.item?.reportedBy?.name || 'Unknown'}</span>
                      </p>
                    </div>

                    {/* Status Badge */}
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-sm ${getStatusColor(claim.status)}`}>
                      {getStatusIcon(claim.status)}
                      <span className="capitalize">{claim.status}</span>
                    </div>
                  </div>

                  {/* Expand Icon */}
                  <div className="ml-4">
                    {expandedClaim === claim._id ? (
                      <ChevronUp className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                    ) : (
                      <ChevronDown className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                    )}
                  </div>
                </button>

                {/* Expanded View */}
                {expandedClaim === claim._id && (
                  <div className={`border-t ${isDarkMode ? 'border-gray-700 bg-gray-750' : 'border-gray-200 bg-gray-50'}`}>
                    {/* Original Item Details */}
                    <div className={`p-5 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                      <h4 className={`text-sm font-bold uppercase tracking-wide mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        📦 Original Item Details
                      </h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                        <div className={`rounded-lg p-3 ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
                          <span className={`text-xs font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>LOCATION</span>
                          <p className={`font-medium mt-1 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{claim.item?.location}</p>
                        </div>
                        <div className={`rounded-lg p-3 ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
                          <span className={`text-xs font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>DATE</span>
                          <p className={`font-medium mt-1 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{new Date(claim.item?.date).toLocaleDateString()}</p>
                        </div>
                        <div className={`rounded-lg p-3 ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
                          <span className={`text-xs font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>CATEGORY</span>
                          <p className={`font-medium mt-1 capitalize ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{claim.item?.category}</p>
                        </div>
                        <div className={`rounded-lg p-3 ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
                          <span className={`text-xs font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>POSTED BY</span>
                          <p className={`font-medium mt-1 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{claim.item?.reportedBy?.name}</p>
                        </div>
                      </div>

                      {claim.item?.description && (
                        <div className={`rounded-lg p-3 ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
                          <span className={`text-xs font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>DESCRIPTION</span>
                          <p className={`mt-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{claim.item?.description}</p>
                        </div>
                      )}

                      {claim.item?.images && claim.item.images.length > 0 && (
                        <div className="mt-4">
                          <span className={`text-xs font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>ITEM IMAGES</span>
                          <div className="grid grid-cols-4 gap-2 mt-2">
                            {claim.item.images.slice(0, 4).map((img, idx) => (
                              <img
                                key={idx}
                                src={img}
                                alt={`item-${idx}`}
                                className="w-full h-20 object-cover rounded-lg"
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Your Claim Details */}
                    <div className={`p-5 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                      <h4 className={`text-sm font-bold uppercase tracking-wide mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        🔍 Your Claim Details
                      </h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                        <div className={`rounded-lg p-3 ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
                          <span className={`text-xs font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>FOUND AT</span>
                          <p className={`font-medium mt-1 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{claim.details?.location}</p>
                        </div>
                        <div className={`rounded-lg p-3 ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
                          <span className={`text-xs font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>DATE FOUND</span>
                          <p className={`font-medium mt-1 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{new Date(claim.details?.date).toLocaleDateString()}</p>
                        </div>
                        <div className={`rounded-lg p-3 lg:col-span-2 ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
                          <span className={`text-xs font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>FEATURES</span>
                          <p className={`font-medium mt-1 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                            {claim.details?.distinguishingFeatures || 'Not specified'}
                          </p>
                        </div>
                      </div>

                      {claim.details?.description && (
                        <div className={`rounded-lg p-3 mb-4 ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
                          <span className={`text-xs font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>DESCRIPTION</span>
                          <p className={`mt-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{claim.details?.description}</p>
                        </div>
                      )}

                      {claim.details?.message && (
                        <div className={`rounded-lg p-3 ${isDarkMode ? 'bg-blue-900 bg-opacity-30 border border-blue-700' : 'bg-blue-50 border border-blue-200'}`}>
                          <span className={`text-xs font-semibold ${isDarkMode ? 'text-blue-300' : 'text-blue-700'}`}>💬 YOUR MESSAGE</span>
                          <p className={`mt-2 italic ${isDarkMode ? 'text-blue-100' : 'text-blue-900'}`}>"{claim.details?.message}"</p>
                        </div>
                      )}
                    </div>

                    {/* Contact Information */}
                    <div className={`p-5 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                      <h4 className={`text-sm font-bold uppercase tracking-wide mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        👤 Item Owner's Contact
                      </h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className={`rounded-lg p-3 ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
                          <div className="flex items-center gap-2 mb-2">
                            <User className="w-4 h-4 text-indigo-500" />
                            <span className={`text-xs font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>NAME</span>
                          </div>
                          <p className={`font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{claim.item?.reportedBy?.name}</p>
                        </div>
                        <div className={`rounded-lg p-3 ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
                          <div className="flex items-center gap-2 mb-2">
                            <Mail className="w-4 h-4 text-red-500" />
                            <span className={`text-xs font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>EMAIL</span>
                          </div>
                          <p className={`font-medium break-all text-sm ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{claim.item?.reportedBy?.email}</p>
                        </div>
                      </div>
                    </div>

                    {/* Proof Images */}
                    <div className={`p-5 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                      <h4 className={`text-sm font-bold uppercase tracking-wide mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        📸 Your Proof Images
                      </h4>

                      {claim.images && claim.images.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                          {claim.images.map((img, idx) => (
                            <img
                              key={idx}
                              src={img}
                              alt={`proof-${idx}`}
                              className="w-full h-24 object-cover rounded-lg"
                            />
                          ))}
                        </div>
                      ) : (
                        <div className={`flex items-center justify-center h-24 rounded-lg border-2 border-dashed ${isDarkMode ? 'border-gray-700 text-gray-400' : 'border-gray-300 text-gray-500'}`}>
                          <div className="flex items-center gap-2">
                            <ImageIcon className="w-5 h-5" />
                            <span>No images provided</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Status Display */}
                    <div className={`p-5 border-t text-center font-semibold ${isDarkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-gray-50'}`}>
                      {claim.status === 'pending' && (
                        <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-yellow-900 text-yellow-200' : 'bg-yellow-100 text-yellow-800'}`}>
                          ⏳ Awaiting owner verification...
                        </div>
                      )}
                      {claim.status === 'approved' && (
                        <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800'}`}>
                          ✅ Owner Approved Your Claim!
                        </div>
                      )}
                      {claim.status === 'rejected' && (
                        <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-800'}`}>
                          ❌ Claim Was Not Verified
                        </div>
                      )}
                      {claim.status === 'claimed' && (
                        <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800'}`}>
                          ✓ Claim Successfully Verified!
                        </div>
                      )}
                    </div>

                    {/* Timestamp */}
                    <div className={`p-5 text-center text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Claimed on {new Date(claim.createdAt).toLocaleString()}
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClaimHistory;
