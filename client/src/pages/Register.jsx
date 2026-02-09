import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Eye, EyeOff, Check } from 'lucide-react';
import OTPVerification from './OTPVerification';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [showOTPVerification, setShowOTPVerification] = useState(false);
  const [userId, setUserId] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.username.trim()) {
      toast.error('Username is required');
      return;
    }
    if (!formData.email.trim()) {
      toast.error('Email is required');
      return;
    }
    if (!formData.password) {
      toast.error('Password is required');
      return;
    }
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const result = await register(formData);
      
      if (result.success) {
        setUserId(result.data.userId);
        toast.success(result.data.message);
        setShowOTPVerification(true);
        setFormData({
          username: '',
          email: '',
          password: '',
          confirmPassword: '',
        });
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (showOTPVerification) {
    return (
      <OTPVerification
        userId={userId}
        email={formData.email || ''}
        onSuccess={() => {
          setShowOTPVerification(false);
          setFormData({
            username: '',
            email: '',
            password: '',
            confirmPassword: '',
          });
          toast.success('Registration completed successfully!');
        }}
      />
    );
  }

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
            <motion.h1
              className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              CampusSync
            </motion.h1>
            <motion.p 
              className={isDarkMode ? 'text-slate-400 text-lg' : 'text-gray-600 text-lg'}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              Create your account
            </motion.p>
          </motion.div>

          {/* Form */}
          <motion.form 
            onSubmit={handleSubmit} 
            className="space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ staggerChildren: 0.1, delayChildren: 0.2 }}
          >
            {/* Username */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ type: 'spring', stiffness: 100 }}
            >
              <label htmlFor="username" className="text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <User size={16} className="text-blue-400" />
                </motion.div>
                Username
              </label>
              <motion.input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Enter your username"
                className={inputClass}
                whileFocus={{ scale: 1.02 }}
              />
            </motion.div>

            {/* Email */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ type: 'spring', stiffness: 100, delay: 0.1 }}
            >
              <label htmlFor="email" className="text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
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
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className={inputClass}
                whileFocus={{ scale: 1.02 }}
              />
            </motion.div>

            {/* Password */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ type: 'spring', stiffness: 100, delay: 0.2 }}
            >
              <label htmlFor="password" className="text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <Lock size={16} className="text-blue-400" />
                </motion.div>
                Password
              </label>
              <div className="relative">
                <motion.input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className={`${inputClass} pr-10`}
                  whileFocus={{ scale: 1.02 }}
                />
                <motion.button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-blue-400 transition"
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </motion.button>
              </div>
            </motion.div>

            {/* Confirm Password */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ type: 'spring', stiffness: 100, delay: 0.3 }}
            >
              <label htmlFor="confirmPassword" className="text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <Lock size={16} className="text-blue-400" />
                </motion.div>
                Confirm Password
              </label>
              <div className="relative">
                <motion.input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition backdrop-blur-sm pr-10"
                  whileFocus={{ scale: 1.02 }}
                />
                <motion.button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-blue-400 transition"
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </motion.button>
              </div>
            </motion.div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={loading}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              whileHover={{ scale: 1.02, boxShadow: '0 20px 40px rgba(59, 130, 246, 0.3)' }}
              whileTap={{ scale: 0.98 }}
              className="w-full mt-6 px-4 py-3 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg relative overflow-hidden"
            >
              <motion.span
                className="flex items-center justify-center gap-2"
                animate={{ opacity: loading ? 0 : 1 }}
              >
                <motion.div
                  animate={{ rotate: loading ? 360 : 0 }}
                  transition={{ duration: 1, repeat: Infinity, repeatType: 'loop' }}
                >
                  {loading ? (
                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  ) : (
                    <Check size={18} />
                  )}
                </motion.div>
                {loading ? 'Creating account...' : 'Create Account'}
              </motion.span>
            </motion.button>
          </motion.form>

          {/* Footer */}
          <motion.div 
            className="mt-6 text-center text-slate-400 text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Already have an account?{' '}
            <motion.a
              href="/login"
              className="text-transparent bg-gradient-to-r from-blue-400 to-pink-400 bg-clip-text font-medium hover:from-blue-300 hover:to-pink-300 transition"
              whileHover={{ scale: 1.05 }}
            >
              Sign in
            </motion.a>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Register;
