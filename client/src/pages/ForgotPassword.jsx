import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { Mail, Send, KeyRound } from 'lucide-react';
import Navbar from '../components/Navbar';
import { useTheme } from '../contexts/ThemeContext';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error('Email is required');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/users/forgot-password`, {
        email,
      });

      toast.success(response.data.message);
      
      setTimeout(() => {
        navigate('/reset-password', { state: { userId: response.data.userId } });
      }, 2000);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send reset code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const outerBg = isDarkMode
    ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900'
    : 'bg-gradient-to-br from-blue-50 via-pink-50 to-white';

  const subtleBg = isDarkMode
    ? 'from-blue-500/10 via-purple-500/10 to-pink-500/10'
    : 'from-blue-100/40 via-purple-100/40 to-pink-100/40';

  const cardBg = isDarkMode
    ? 'relative bg-gradient-to-br from-slate-800/95 via-slate-800/90 to-slate-900/95 rounded-3xl shadow-2xl p-8 border border-blue-500/20 backdrop-blur-md'
    : 'relative bg-white/95 rounded-3xl shadow-2xl p-8 border border-gray-200 backdrop-blur-sm';

  const inputClass = isDarkMode
    ? 'w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition backdrop-blur-sm'
    : 'w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition';

  return (
    <div className={`min-h-screen ${outerBg} flex items-center justify-center p-4 relative overflow-hidden`}>
     
      {/* Animated background gradient */}
      <motion.div
        className={`absolute inset-0 bg-gradient-to-br ${subtleBg}`}
        animate={{
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
        }}
      />

      <motion.div
        className="w-full max-w-md relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Gradient border effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-3xl opacity-0 blur-xl"
          animate={{
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
          }}
        />

        <motion.div
          className={cardBg}
          whileHover={{ y: -5 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          {/* Header */}
          <motion.div 
            className="text-center mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <motion.div 
              className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full mb-4 border border-blue-500/40 backdrop-blur-sm"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <KeyRound className="w-8 h-8 text-blue-400" />
              </motion.div>
            </motion.div>
            <motion.h1 
              className={isDarkMode ? 'text-3xl font-bold text-white mb-2' : 'text-3xl font-bold text-gray-900 mb-2'}
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              Reset Password
            </motion.h1>
            <motion.p 
              className="text-slate-400 text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              Enter your email to receive a reset code
            </motion.p>
          </motion.div>

          {/* Form */}
          <motion.form 
            onSubmit={handleSubmit} 
            className="space-y-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ staggerChildren: 0.1, delayChildren: 0.2 }}
          >
            {/* Email */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ type: 'spring', stiffness: 100 }}
            >
              <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <Mail size={16} className="text-blue-400" />
                </motion.div>
                Email Address
              </label>
                <motion.input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className={inputClass}
                whileFocus={{ scale: 1.02 }}
              />
            </motion.div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={loading}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              whileHover={{ scale: 1.02, boxShadow: '0 20px 40px rgba(59, 130, 246, 0.3)' }}
              whileTap={{ scale: 0.98 }}
              className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg relative overflow-hidden"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <motion.svg
                    className="h-5 w-5 mr-2"
                    viewBox="0 0 24 24"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </motion.svg>
                  Sending Reset Code...
                </span>
              ) : (
                <motion.span className="flex items-center justify-center gap-2">
                  <Send size={18} />
                  Send Reset Code
                </motion.span>
              )}
            </motion.button>
          </motion.form>

          {/* Footer */}
          <motion.div 
            className="mt-6 text-center text-slate-400 text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Remember your password?{' '}
            <motion.a
              href="/login"
              className="text-transparent bg-gradient-to-r from-blue-400 to-pink-400 bg-clip-text font-medium hover:from-blue-300 hover:to-pink-300 transition"
              whileHover={{ scale: 1.05 }}
            >
              Back to login
            </motion.a>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
