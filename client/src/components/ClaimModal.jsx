import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { itemsAPI } from '../services/api';
import { toast } from 'react-toastify';

const ClaimModal = ({ isOpen, onClose, item }) => {
  const { isDarkMode } = useTheme();
  const { isAuthenticated, user } = useAuth();

  const [claimSubmitting, setClaimSubmitting] = useState(false);
  const [claimForm, setClaimForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    location: '',
    date: '',
    description: '',
    distinguishingFeatures: '',
    message: ''
  });
  const [claimImages, setClaimImages] = useState([]);
  const [claimImagePreviews, setClaimImagePreviews] = useState([]);
  const claimFileInputRef = useRef(null);

  useEffect(() => {
    if (isAuthenticated && user) {
      setClaimForm(prev => ({ ...prev, fullName: user.username || prev.fullName, email: user.email || prev.email }));
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    return () => {
      if (claimImagePreviews.length > 0) {
        claimImagePreviews.forEach((url) => URL.revokeObjectURL(url));
      }
    };
  }, [claimImagePreviews]);

  const handleClaimChange = (e) => {
    const { name, value } = e.target;
    setClaimForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleClaimImages = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (claimImagePreviews.length > 0) {
      claimImagePreviews.forEach((url) => URL.revokeObjectURL(url));
    }

    const previews = files.map((file) => URL.createObjectURL(file));
    setClaimImages(files);
    setClaimImagePreviews(previews);
  };

  const handleClaimSubmit = async (e) => {
    e.preventDefault();
    if (!item) return;

    if (!isAuthenticated) {
      toast.error('Please login to claim an item');
      return;
    }

    if (!claimForm.fullName || !claimForm.email || !claimForm.location || !claimForm.date || !claimForm.description) {
      toast.error('Please fill all required claim details');
      return;
    }

    try {
      setClaimSubmitting(true);
      const submitData = new FormData();
      submitData.append('fullName', claimForm.fullName.trim());
      submitData.append('email', claimForm.email.trim());
      submitData.append('phone', claimForm.phone.trim());
      submitData.append('location', claimForm.location.trim());
      submitData.append('date', claimForm.date);
      submitData.append('description', claimForm.description.trim());
      submitData.append('distinguishingFeatures', claimForm.distinguishingFeatures.trim());
      submitData.append('message', claimForm.message.trim());

      if (claimImages.length > 0) {
        claimImages.forEach((file) => submitData.append('claimImages', file));
      }

      await itemsAPI.claimItem(item._id, submitData);
      toast.success('Claim request submitted! The owner will review your details.');
      onClose?.();
    } catch (error) {
      console.error('Failed to submit claim:', error);
      toast.error(error.response?.data?.message || 'Failed to submit claim');
    } finally {
      setClaimSubmitting(false);
    }
  };

  if (!isOpen || !item) return null;

  return (
    <AnimatePresence>
      {isOpen && item && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className={`w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Claim Item</h2>
                  <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Provide proof and details to verify your claim.</p>
                </div>
                <button onClick={onClose} className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className={`rounded-lg border p-4 ${isDarkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-gray-50'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{item.title}</h3>
                    <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{item.category} • {new Date(item.date).toLocaleDateString()}</p>
                  </div>
                  <span className={`text-xs font-medium px-2 py-1 rounded ${item.type === 'lost' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'}`}>{item.type.toUpperCase()}</span>
                </div>
              </div>

              <form onSubmit={handleClaimSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Full Name *</label>
                    <input type="text" name="fullName" value={claimForm.fullName} onChange={handleClaimChange} className={`w-full px-4 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} focus:outline-none focus:border-blue-500`} placeholder="Your full name" required />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Email *</label>
                    <input type="email" name="email" value={claimForm.email} onChange={handleClaimChange} className={`w-full px-4 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} focus:outline-none focus:border-blue-500`} placeholder="you@example.com" required />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Phone</label>
                    <input type="tel" name="phone" value={claimForm.phone} onChange={handleClaimChange} className={`w-full px-4 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} focus:outline-none focus:border-blue-500`} placeholder="Optional" />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Location *</label>
                    <input type="text" name="location" value={claimForm.location} onChange={handleClaimChange} className={`w-full px-4 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} focus:outline-none focus:border-blue-500`} placeholder="Where did you lose/find it?" required />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Date *</label>
                    <input type="date" name="date" value={claimForm.date} onChange={handleClaimChange} className={`w-full px-4 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:border-blue-500`} required />
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Description *</label>
                  <textarea name="description" value={claimForm.description} onChange={handleClaimChange} rows={4} className={`w-full px-4 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} focus:outline-none focus:border-blue-500`} placeholder="Describe the item and why you believe it is yours." required />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Distinguishing Features</label>
                  <textarea name="distinguishingFeatures" value={claimForm.distinguishingFeatures} onChange={handleClaimChange} rows={3} className={`w-full px-4 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} focus:outline-none focus:border-blue-500`} placeholder="Unique marks, serial numbers, stickers, etc." />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Message to Owner</label>
                  <textarea name="message" value={claimForm.message} onChange={handleClaimChange} rows={3} className={`w-full px-4 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} focus:outline-none focus:border-blue-500`} placeholder="Optional note for the person who posted this item." />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Upload Proof Images</label>
                  <div className="space-y-3">
                    <input ref={claimFileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleClaimImages} />
                    <button type="button" onClick={() => claimFileInputRef.current?.click()} className={`w-full py-3 px-4 rounded-lg border-2 border-dashed transition-colors ${isDarkMode ? 'border-gray-600 text-gray-300 hover:border-blue-500' : 'border-gray-300 text-gray-700 hover:border-blue-500'}`}>
                      <div className="flex items-center justify-center gap-2">
                        <Upload className="w-4 h-4" />
                        Add Images
                      </div>
                    </button>
                    {claimImagePreviews.length > 0 && (
                      <div className="grid grid-cols-3 gap-3">
                        {claimImagePreviews.map((preview, index) => (
                          <div key={preview} className="relative">
                            <img src={preview} alt={`claim-${index}`} className="w-full h-24 object-cover rounded-lg" />
                            <button type="button" onClick={() => {
                              const updatedImages = claimImages.filter((_, i) => i !== index);
                              const updatedPreviews = claimImagePreviews.filter((_, i) => i !== index);
                              URL.revokeObjectURL(claimImagePreviews[index]);
                              setClaimImages(updatedImages);
                              setClaimImagePreviews(updatedPreviews);
                            }} className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700">
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-4 pt-2">
                  <button type="button" onClick={onClose} className={`flex-1 py-3 px-6 rounded-lg border transition-colors ${isDarkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}>Cancel</button>
                  <button type="submit" disabled={claimSubmitting} className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">{claimSubmitting ? 'Submitting...' : 'Submit Claim'}</button>
                </div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ClaimModal;
