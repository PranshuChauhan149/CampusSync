import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { Mail, CheckCircle, Clock } from 'lucide-react';

const OTPVerification = ({ userId, email, onSuccess }) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(600); // 10 minutes
  const [canResend, setCanResend] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

  
  useEffect(() => {
    if (timer <= 0) {
      setCanResend(true);
      return;
    }
    const interval = setInterval(() => {
      setTimer(prev => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return;
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();

    const otpString = otp.join('');
    if (otpString.length !== 6) {
      toast.error('Please enter a 6-digit OTP');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/users/verify-otp`, {
        userId,
        otp: otpString,
      });

      toast.success(response.data.message);
      setOtp(['', '', '', '', '', '']);
      
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (err) {
      toast.error(err.response?.data?.message || 'OTP verification failed. Please try again.');
      setOtp(['', '', '', '', '', '']);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/users/resend-otp`, {
        userId,
      });

      toast.success(response.data.message);
      setTimer(600);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background gradient */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10"
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
          className="relative bg-gradient-to-br from-slate-800/95 via-slate-800/90 to-slate-900/95 rounded-3xl shadow-2xl p-8 border border-blue-500/20 backdrop-blur-md"
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
                <Mail className="w-8 h-8 text-blue-400" />
              </motion.div>
            </motion.div>
            <motion.h1 
              className="text-3xl font-bold text-white mb-2"
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              Verify Your Email
            </motion.h1>
            <motion.p 
              className="text-slate-400 text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              We sent a 6-digit code to<br />
              <span className="text-blue-400 font-medium">{email}</span>
            </motion.p>
          </motion.div>

          {/* OTP Input */}
          <motion.form 
            onSubmit={handleVerifyOTP} 
            className="space-y-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ staggerChildren: 0.1, delayChildren: 0.2 }}
          >
            <motion.div 
              className="flex gap-3 justify-center"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 100, delay: 0.2 }}
            >
              {otp.map((digit, index) => (
                <motion.input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  placeholder="•"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileFocus={{
                    scale: 1.1,
                    boxShadow: '0 0 20px rgba(59, 130, 246, 0.5)',
                  }}
                  className="w-12 h-14 text-center text-2xl font-bold bg-slate-700/50 border-2 border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition backdrop-blur-sm"
                />
              ))}
            </motion.div>

            {/* Timer */}
            <motion.div 
              className="text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <motion.p 
                className="text-slate-400 text-sm flex items-center justify-center gap-2"
                animate={{ color: timer < 60 ? ['rgb(107, 114, 128)', 'rgb(239, 68, 68)'] : 'rgb(107, 114, 128)' }}
                transition={{ duration: 0.5 }}
              >
                <Clock size={16} className={timer < 60 ? 'text-red-500' : 'text-blue-400'} />
                OTP expires in <span className={`font-bold ${timer < 60 ? 'text-red-400' : 'text-blue-400'}`}>{formatTime(timer)}</span>
              </motion.p>
            </motion.div>

            {/* Verify Button */}
            <motion.button
              type="submit"
              disabled={loading || otp.join('').length !== 6}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
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
                  Verifying...
                </span>
              ) : (
                <motion.span className="flex items-center justify-center gap-2">
                  <CheckCircle size={18} />
                  Verify OTP
                </motion.span>
              )}
            </motion.button>
          </motion.form>

          {/* Resend OTP */}
          <motion.div 
            className="mt-6 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {canResend ? (
              <motion.button
                onClick={handleResendOTP}
                disabled={loading}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="text-blue-400 hover:text-blue-300 font-medium text-sm transition disabled:opacity-50"
              >
                Resend OTP
              </motion.button>
            ) : (
              <motion.p 
                className="text-slate-400 text-sm"
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                Didn't receive the code? <span className="text-blue-400">Resend in {formatTime(timer)}</span>
              </motion.p>
            )}
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default OTPVerification;
