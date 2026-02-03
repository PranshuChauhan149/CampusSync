import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, User, Mail, Phone, Image as ImageIcon, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { itemsAPI } from '../services/api';
import { toast } from 'react-toastify';

const ClaimRequests = () => {
  const { isDarkMode } = useTheme();
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [claims, setClaims] = useState([]);
  const [updatingStatus, setUpdatingStatus] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchClaims = async () => {
      try {
        setLoading(true);
        const response = await itemsAPI.getReceivedClaims();
        setClaims(response.data.data || []);
      } catch (error) {
        console.error('Failed to load claim requests:', error);
        toast.error(error.response?.data?.message || 'Failed to load claim requests');
      } finally {
        setLoading(false);
      }
    };

    fetchClaims();
  }, [isAuthenticated]);

  const handleClaimStatus = async (claimId, status) => {
    try {
      setUpdatingStatus(claimId);
      await itemsAPI.updateClaimStatus(claimId, status);
      
      // Update local state
      setClaims(prev => prev.map(claim => 
        claim._id === claimId ? { ...claim, status } : claim
      ));
      
      toast.success(`Claim ${status}!`);
    } catch (error) {
      console.error('Failed to update claim status:', error);
      toast.error(error.response?.data?.message || 'Failed to update claim status');
    } finally {
      setUpdatingStatus(null);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className={`min-h-screen pt-24 pb-12 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="max-w-4xl mx-auto px-4">
          <div className={`rounded-xl p-8 text-center ${isDarkMode ? 'bg-gray-800 text-gray-200' : 'bg-white text-gray-800'} shadow-lg`}>
            <h1 className="text-2xl font-bold mb-2">Claim Requests</h1>
            <p>Please login to view claim requests for your items.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen pt-24 pb-12 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-6">
          <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Claim Requests</h1>
          <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Review claim details and verify matches.</p>
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
            <p>No claim requests yet.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {claims.map((claim) => (
              <motion.div
                key={claim._id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-xl overflow-hidden shadow-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
              >
                {/* Header with Match Score */}
                <div className={`p-6 border-b ${isDarkMode ? 'bg-gray-750 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        📦 {claim.item?.title}
                      </h2>
                      <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {claim.item?.category?.toUpperCase()} • Posted {new Date(claim.item?.date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="w-full md:w-80">
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>MATCH SCORE</span>
                        <span className={`text-lg font-bold ${claim.matchScore >= 70 ? 'text-green-500' : claim.matchScore >= 40 ? 'text-yellow-500' : 'text-red-500'}`}>
                          {claim.matchScore || 0}%
                        </span>
                      </div>
                      <div className={`h-3 w-full rounded-full overflow-hidden ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                        <div
                          className={`h-3 rounded-full transition-all ${claim.matchScore >= 70 ? 'bg-green-500' : claim.matchScore >= 40 ? 'bg-yellow-500' : 'bg-red-500'}`}
                          style={{ width: `${claim.matchScore || 0}%` }}
                        ></div>
                      </div>
                      <div className="flex items-center gap-2 mt-2 text-xs">
                        {claim.matchScore >= 70 ? (
                          <><CheckCircle2 className="w-4 h-4 text-green-500" /> <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>High Match</span></>
                        ) : claim.matchScore >= 40 ? (
                          <><AlertCircle className="w-4 h-4 text-yellow-500" /> <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Medium Match</span></>
                        ) : (
                          <><XCircle className="w-4 h-4 text-red-500" /> <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Low Match</span></>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Original Item Details Section */}
                <div className={`p-6 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <h3 className={`text-sm font-bold mb-4 uppercase tracking-wide ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    📋 Original Item Information
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    {/* Location */}
                    <div className={`rounded-lg p-3 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <MapPin className="w-4 h-4 text-blue-500" />
                        <span className={`text-xs font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>LOCATION</span>
                      </div>
                      <p className={`font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{claim.item?.location}</p>
                    </div>

                    {/* Date Posted */}
                    <div className={`rounded-lg p-3 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar className="w-4 h-4 text-purple-500" />
                        <span className={`text-xs font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>DATE POSTED</span>
                      </div>
                      <p className={`font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{new Date(claim.item?.date).toLocaleDateString()}</p>
                    </div>

                    {/* Category */}
                    <div className={`rounded-lg p-3 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
                      <span className={`text-xs font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>CATEGORY</span>
                      <p className={`font-medium capitalize ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{claim.item?.category}</p>
                    </div>

                    {/* Status */}
                    <div className={`rounded-lg p-3 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
                      <span className={`text-xs font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>STATUS</span>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                        <p className={`font-medium capitalize ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{claim.status}</p>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div className={`rounded-lg p-3 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
                    <span className={`text-xs font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>DESCRIPTION</span>
                    <p className={`mt-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{claim.item?.description}</p>
                  </div>

                  {/* Original Item Images */}
                  {claim.item?.images && claim.item.images.length > 0 && (
                    <div className="mt-4">
                      <span className={`text-xs font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>ITEM IMAGES</span>
                      <div className="grid grid-cols-4 gap-2 mt-2">
                        {claim.item.images.slice(0, 4).map((img, idx) => (
                          <div key={idx} className="relative group">
                            <img
                              src={img}
                              alt={`item-${idx}`}
                              className="w-full h-24 object-cover rounded-lg group-hover:opacity-75 transition"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Claim Details Section */}
                <div className={`p-6 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <h3 className={`text-sm font-bold mb-4 uppercase tracking-wide ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    🔍 Claim Details
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    {/* Where Found */}
                    <div className={`rounded-lg p-3 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <MapPin className="w-4 h-4 text-green-500" />
                        <span className={`text-xs font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>FOUND AT</span>
                      </div>
                      <p className={`font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{claim.details?.location}</p>
                    </div>

                    {/* Date Found */}
                    <div className={`rounded-lg p-3 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar className="w-4 h-4 text-green-500" />
                        <span className={`text-xs font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>DATE FOUND</span>
                      </div>
                      <p className={`font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{new Date(claim.details?.date).toLocaleDateString()}</p>
                    </div>

                    {/* Distinguishing Features */}
                    <div className={`rounded-lg p-3 lg:col-span-2 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
                      <span className={`text-xs font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>FEATURES/MARKS</span>
                      <p className={`font-medium mt-1 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                        {claim.details?.distinguishingFeatures || 'Not specified'}
                      </p>
                    </div>
                  </div>

                  {/* Claim Description */}
                  <div className={`rounded-lg p-3 mb-4 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
                    <span className={`text-xs font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>DESCRIPTION</span>
                    <p className={`mt-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{claim.details?.description}</p>
                  </div>

                  {/* Claimant Message */}
                  {claim.details?.message && (
                    <div className={`rounded-lg p-3 ${isDarkMode ? 'bg-blue-900 bg-opacity-30 border border-blue-700' : 'bg-blue-50 border border-blue-200'}`}>
                      <span className={`text-xs font-semibold ${isDarkMode ? 'text-blue-300' : 'text-blue-700'}`}>💬 CLAIMANT'S MESSAGE</span>
                      <p className={`mt-2 italic ${isDarkMode ? 'text-blue-100' : 'text-blue-900'}`}>"{claim.details?.message}"</p>
                    </div>
                  )}
                </div>

                {/* Claimant Information Section */}
                <div className={`p-6 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <h3 className={`text-sm font-bold mb-4 uppercase tracking-wide ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    👤 Who Claimed It
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Name */}
                    <div className={`rounded-lg p-3 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
                      <div className="flex items-center gap-2 mb-2">
                        <User className="w-4 h-4 text-indigo-500" />
                        <span className={`text-xs font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>FULL NAME</span>
                      </div>
                      <p className={`font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{claim.contactInfo?.name}</p>
                    </div>

                    {/* Email */}
                    <div className={`rounded-lg p-3 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
                      <div className="flex items-center gap-2 mb-2">
                        <Mail className="w-4 h-4 text-red-500" />
                        <span className={`text-xs font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>EMAIL</span>
                      </div>
                      <p className={`font-medium break-all ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{claim.contactInfo?.email}</p>
                    </div>

                    {/* Phone */}
                    {claim.contactInfo?.phone && (
                      <div className={`rounded-lg p-3 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
                        <div className="flex items-center gap-2 mb-2">
                          <Phone className="w-4 h-4 text-green-500" />
                          <span className={`text-xs font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>PHONE</span>
                        </div>
                        <p className={`font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{claim.contactInfo?.phone}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Proof Images Section */}
                <div className={`p-6 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <h3 className={`text-sm font-bold mb-4 uppercase tracking-wide ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    📸 Proof Images from Claimant
                  </h3>

                  {claim.images && claim.images.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {claim.images.map((img, idx) => (
                        <div
                          key={idx}
                          className={`relative group rounded-lg overflow-hidden cursor-pointer border-2 ${isDarkMode ? 'border-gray-700 hover:border-blue-500' : 'border-gray-200 hover:border-blue-500'}`}
                        >
                          <img
                            src={img}
                            alt={`proof-${idx}`}
                            className="w-full h-32 object-cover group-hover:opacity-75 transition"
                          />
                          <div className={`absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition ${isDarkMode ? 'bg-black bg-opacity-50' : 'bg-black bg-opacity-30'}`}>
                            <span className="text-white text-sm font-semibold">{idx + 1}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className={`flex items-center justify-center h-32 rounded-lg border-2 border-dashed ${isDarkMode ? 'border-gray-700 bg-gray-900 text-gray-400' : 'border-gray-300 bg-gray-50 text-gray-500'}`}>
                      <div className="flex items-center gap-2">
                        <ImageIcon className="w-5 h-5" />
                        <span className="font-medium">No images provided</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className={`p-6 border-t ${isDarkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-gray-50'}`}>
                  <h3 className={`text-sm font-bold uppercase tracking-wide mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    ✅ Verify & Approve Claim
                  </h3>

                  {claim.status === 'pending' ? (
                    <div className="flex gap-3 flex-wrap">
                      <button
                        onClick={() => handleClaimStatus(claim._id, 'approved')}
                        disabled={updatingStatus === claim._id}
                        className={`flex-1 min-w-[200px] px-4 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                          updatingStatus === claim._id
                            ? 'opacity-50 cursor-not-allowed'
                            : 'bg-green-500 hover:bg-green-600 text-white'
                        }`}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Approve & Claim ✓
                      </button>
                      <button
                        onClick={() => handleClaimStatus(claim._id, 'rejected')}
                        disabled={updatingStatus === claim._id}
                        className={`px-4 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                          updatingStatus === claim._id
                            ? 'opacity-50 cursor-not-allowed'
                            : isDarkMode 
                              ? 'bg-red-900 hover:bg-red-800 text-red-200'
                              : 'bg-red-100 hover:bg-red-200 text-red-800'
                        }`}
                      >
                        <XCircle className="w-4 h-4" />
                        Reject
                      </button>
                    </div>
                  ) : (
                    <div className={`p-4 rounded-lg text-center font-semibold ${
                      claim.status === 'approved' 
                        ? isDarkMode ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800'
                        : isDarkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {claim.status === 'approved' && '✅ Claim Approved!'}
                      {claim.status === 'rejected' && '❌ Claim Rejected'}
                      {claim.status === 'claimed' && '✓ Item Claimed'}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClaimRequests;
