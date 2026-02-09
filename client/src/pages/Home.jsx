import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MapPin,
  BookOpen,
  MessageCircle,
  Bell,
  ArrowRight,
  Facebook,
  Twitter,
  Instagram,
  Github,
  Star
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { booksAPI } from '../services/api';


// Skeleton Loader Component
const SkeletonLoader = ({ className }) => (
  <div className={`animate-pulse bg-gray-300 dark:bg-gray-700 rounded ${className}`}></div>
);

// (Stats removed — cleaned up homepage to focus on features and testimonials)

// Feature Card Component
const FeatureCard = ({ icon: Icon, title, description, color, delay = 0 }) => {
  const { isDarkMode } = useTheme();

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      viewport={{ once: true }}
      whileHover={{ scale: 1.05, y: -10 }}
      className={`p-6 rounded-xl backdrop-blur-sm border transition-all duration-300 ${
        isDarkMode
          ? 'bg-gray-800/50 border-gray-700 hover:bg-gray-800/70'
          : 'bg-white/50 border-gray-200 hover:bg-white/70'
      }`}
    >
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <h3 className={`text-xl font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        {title}
      </h3>
      <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        {description}
      </p>
    </motion.div>
  );
};

// Book Card Component
const BookCard = ({ book, isLoading }) => {
  const { isDarkMode } = useTheme();

  if (isLoading) {
    return (
      <div className={`p-4 rounded-lg border ${
        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <SkeletonLoader className="h-32 w-full mb-3" />
        <SkeletonLoader className="h-4 w-3/4 mb-2" />
        <SkeletonLoader className="h-4 w-1/2" />
      </div>
    );
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -5 }}
      className={`p-4 rounded-lg border transition-all duration-300 ${
        isDarkMode
          ? 'bg-gray-800/50 border-gray-700 hover:bg-gray-800/70'
          : 'bg-white/50 border-gray-200 hover:bg-white/70'
      }`}
    >
      <div className="aspect-w-3 aspect-h-4 mb-3">
        <img
          src={book.image || '/placeholder-book.jpg'}
          alt={book.title}
          className="w-full h-32 object-cover rounded-md"
        />
      </div>
      <h4 className={`font-semibold text-sm mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        {book.title}
      </h4>
      <p className={`text-xs mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        {book.subject}
      </p>
      <div className="flex items-center justify-between">
        <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
          ₹{book.price}
        </span>
        <span className={`text-xs px-2 py-1 rounded-full ${
          book.condition === 'new' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
          book.condition === 'good' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
          'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
        }`}>
          {book.condition}
        </span>
      </div>
    </motion.div>
  );
};

const Home = () => {
  const { isDarkMode } = useTheme();
  const [books, setBooks] = useState([]);
  const [loadingBooks, setLoadingBooks] = useState(true);

  // Fetch stats and books on component mount
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await booksAPI.getBooks({ limit: 4 });
        setBooks(response.data.books || []);
      } catch (error) {
        console.error('Failed to fetch books:', error);
        // Fallback data for demo
        setBooks([
          { id: 1, title: 'Data Structures', subject: 'Computer Science', price: 250, condition: 'good', image: null },
          { id: 2, title: 'Calculus Vol 1', subject: 'Mathematics', price: 180, condition: 'new', image: null },
          { id: 3, title: 'Physics Fundamentals', subject: 'Physics', price: 320, condition: 'excellent', image: null },
          { id: 4, title: 'Organic Chemistry', subject: 'Chemistry', price: 400, condition: 'good', image: null },
        ]);
      } finally {
        setLoadingBooks(false);
      }
    };

    fetchBooks();
  }, []);

  const features = [
    {
      icon: MapPin,
      title: 'Smart Lost & Found',
      description: 'Report lost items and get intelligent matches with found items using AI-powered recognition.',
      color: 'bg-red-500',
      delay: 0.1
    },
    {
      icon: BookOpen,
      title: 'Book Marketplace',
      description: 'Buy and sell textbooks with verified sellers. Find deals on your course materials.',
      color: 'bg-blue-500',
      delay: 0.2
    },
    {
      icon: MessageCircle,
      title: 'Real-Time Chat',
      description: 'Connect instantly with other students for item exchanges and academic discussions.',
      color: 'bg-green-500',
      delay: 0.3
    },
    {
      icon: Bell,
      title: 'AI-powered Learning',
      description: 'Personalized study suggestions, topic summaries and smart note (TNote) generation to help you learn faster.',
      color: 'bg-indigo-500',
      delay: 0.4
    }
  ];

  const howItWorks = [
    {
      step: 1,
      title: 'Post Lost / Found Item',
      description: 'Upload photos and details of your lost item or found item with our easy-to-use interface.'
    },
    {
      step: 2,
      title: 'Get Smart Matches & Notifications',
      description: 'Our AI analyzes images and details to find potential matches and sends instant notifications.'
    },
    {
      step: 3,
      title: 'Chat & Recover Item',
      description: 'Connect with the item owner/finder through secure chat and arrange safe item recovery.'
    }
  ];

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      

      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="max-w-6xl mx-auto text-center ">
          <motion.h1
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-600 to-blue-600 bg-clip-text text-transparent"
          >
            CampusSync
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className={`text-xl md:text-2xl mb-8 max-w-3xl mx-auto ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}
          >
            Find lost items, sell books, and connect with students in real time.
            Your campus utility platform for seamless academic life.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
          >
            <Link
              to="/lost-found"
              className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white font-semibold py-4 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center justify-center gap-2"
            >
              <MapPin className="w-5 h-5" />
              Report Lost Item
            </Link>
            <Link
              to="/books"
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center justify-center gap-2"
            >
              <BookOpen className="w-5 h-5" />
              Browse Books
            </Link>
            <Link
              to="/study-material"
              className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center justify-center gap-2"
            >
              <Star className="w-5 h-5" />
              AI Study · Take Notes
            </Link>
          </motion.div>
        </div>

        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{
              rotate: 360,
              scale: [1, 1.1, 1],
            }}
            transition={{
              rotate: { duration: 20, repeat: Infinity, ease: "linear" },
              scale: { duration: 4, repeat: Infinity, ease: "easeInOut" }
            }}
            className="absolute top-20 left-10 w-32 h-32 bg-blue-500/10 rounded-full blur-xl"
          />
          <motion.div
            animate={{
              rotate: -360,
              scale: [1.1, 1, 1.1],
            }}
            transition={{
              rotate: { duration: 25, repeat: Infinity, ease: "linear" },
              scale: { duration: 5, repeat: Infinity, ease: "easeInOut" }
            }}
            className="absolute bottom-20 right-10 w-40 h-40 bg-purple-500/10 rounded-full blur-xl"
          />
        </div>
      </section>

      {/* Testimonials Section */}
  
      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className={`text-4xl font-bold text-center mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
          >
            Why Choose CampusSync?
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className={`text-center mb-12 max-w-2xl mx-auto ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}
          >
            Powerful features designed specifically for students to make campus life easier and more connected.
          </motion.p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <FeatureCard key={index} {...feature} />
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className={`py-20 px-4 ${isDarkMode ? 'bg-gray-800/30' : 'bg-gray-100/50'}`}>
        <div className="max-w-6xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className={`text-4xl font-bold text-center mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
          >
            How It Works
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className={`text-center mb-12 max-w-2xl mx-auto ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}
          >
            Simple 3-step process to recover lost items or find great book deals.
          </motion.p>

          <div className="grid md:grid-cols-3 gap-8">
            {howItWorks.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                className={`text-center p-6 rounded-xl ${
                  isDarkMode ? 'bg-gray-800/50' : 'bg-white/50'
                } backdrop-blur-sm border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}
              >
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-white">{step.step}</span>
                </div>
                <h3 className={`text-xl font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {step.title}
                </h3>
                <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      

      {/* Book Marketplace Preview */}
      <section className={`py-20 px-4 ${isDarkMode ? 'bg-gray-800/30' : 'bg-gray-100/50'}`}>
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className={`text-4xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Latest Books Available
            </h2>
            <p className={`text-lg mb-8 max-w-2xl mx-auto ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Find affordable textbooks and study materials from fellow students.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {loadingBooks
              ? Array(4).fill(0).map((_, index) => (
                  <BookCard key={index} isLoading={true} />
                ))
              : books.slice(0, 4).map((book) => (
                  <BookCard key={book.id || book._id} book={book} />
                ))
            }
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <Link
              to="/books"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
            >
              View All Books
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

          <section className={`py-20 px-4 ${isDarkMode ? 'bg-gray-800/10' : 'bg-white/50'}`}>
        <div className="max-w-6xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className={`text-4xl font-bold text-center mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
          >
            What Students Say
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            className={`text-center mb-12 max-w-2xl mx-auto ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}
          >
            Real students, real recoveries — CampusSync makes campus life easier.
          </motion.p>

          <div className="grid md:grid-cols-3 gap-6">
            {[{
              name: 'Aisha R.',
              role: '2nd Year, CS',
              text: 'Found my lost laptop within hours — the matching feature is incredible!'
            },{
              name: 'Rohit K.',
              role: '4th Year, Chemistry',
              text: 'Sold my old textbooks quickly and safely through CampusSync.'
            },{
              name: 'Meera S.',
              role: '1st Year, Arts',
              text: 'The chat feature made coordinating pickup so smooth. Highly recommend.'
            }].map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 * i }}
                viewport={{ once: true }}
                className={`p-6 rounded-xl shadow-lg transition-all ${isDarkMode ? 'bg-gray-800/60 border border-gray-700' : 'bg-white/80 border border-gray-200'}`}
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold mr-4">{t.name.split(' ')[0].charAt(0)}</div>
                  <div>
                    <div className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{t.name}</div>
                    <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t.role}</div>
                  </div>
                </div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{t.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>


      {/* Call to Action Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className={`text-4xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
          >
            Built for Students, Powered by Technology
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className={`text-xl mb-8 max-w-2xl mx-auto ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}
          >
            Join thousands of students who are already using CampusSync to make their campus life better.
            Start your journey today!
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <Link
              to="/register"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 px-10 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg text-lg"
            >
              Join CampusSync Today
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className={`py-12 px-4 border-t ${isDarkMode ? 'border-gray-700 bg-gray-900/50' : 'border-gray-200 bg-white/50'}`}>
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* Logo and Description */}
            <div className="md:col-span-2">
              <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent mb-4">
                CampusSync
              </div>
              <p className={`text-sm leading-relaxed mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Your comprehensive campus utility platform. Find lost items, buy/sell books,
                and connect with fellow students in real-time. Making campus life easier, one connection at a time.
              </p>
              <div className="flex space-x-4">
                <motion.a
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  href="#"
                  className={`p-2 rounded-full transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-400 hover:text-blue-400 hover:bg-gray-800' : 'text-gray-600 hover:text-blue-600 hover:bg-gray-100'
                  }`}
                >
                  <Facebook className="w-5 h-5" />
                </motion.a>
                <motion.a
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  href="#"
                  className={`p-2 rounded-full transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-400 hover:text-blue-400 hover:bg-gray-800' : 'text-gray-600 hover:text-blue-600 hover:bg-gray-100'
                  }`}
                >
                  <Twitter className="w-5 h-5" />
                </motion.a>
                <motion.a
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  href="#"
                  className={`p-2 rounded-full transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-400 hover:text-blue-400 hover:bg-gray-800' : 'text-gray-600 hover:text-blue-600 hover:bg-gray-100'
                  }`}
                >
                  <Instagram className="w-5 h-5" />
                </motion.a>
                <motion.a
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  href="#"
                  className={`p-2 rounded-full transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-400 hover:text-blue-400 hover:bg-gray-800' : 'text-gray-600 hover:text-blue-600 hover:bg-gray-100'
                  }`}
                >
                  <Github className="w-5 h-5" />
                </motion.a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Quick Links
              </h4>
              <ul className="space-y-2">
                {[
                  { name: 'Home', path: '/' },
                  { name: 'Lost & Found', path: '/lost-found' },
                  { name: 'Books', path: '/books' },
                  { name: 'Chat', path: '/chat' },
                  { name: 'About Us', path: '/about' },
                  { name: 'Contact', path: '/contact' }
                ].map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.path}
                      className={`text-sm transition-colors duration-300 ${
                        isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Support
              </h4>
              <ul className="space-y-2">
                {[
                  { name: 'Help Center', path: '/help' },
                  { name: 'Privacy Policy', path: '/privacy' },
                  { name: 'Terms of Service', path: '/terms' },
                  { name: 'Report Issue', path: '/report' },
                  { name: 'Feedback', path: '/feedback' }
                ].map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.path}
                      className={`text-sm transition-colors duration-300 ${
                        isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Copyright */}
          <div className={`pt-8 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} text-center`}>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              © {new Date().getFullYear()} CampusSync. All rights reserved.
              <span className="mx-2">•</span>
              Made with ❤️ for students, by students.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;