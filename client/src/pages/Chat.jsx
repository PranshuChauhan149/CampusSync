import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Search,
  Plus,
  X,
  MoreVertical,
  Smile,
  Paperclip,
  Phone,
  Loader,
  ChevronLeft
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { chatAPI } from '../services/api';
import { toast } from 'react-toastify';
import io from 'socket.io-client';

const Chat = () => {
  const { user, isAuthenticated } = useAuth();
  const { isDarkMode } = useTheme();
  const location = useLocation();
  
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [messageLoading, setMessageLoading] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [showNewChat, setShowNewChat] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [pendingImage, setPendingImage] = useState(null);
  const [pendingImagePreview, setPendingImagePreview] = useState('');
  
  const socket = useRef(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const selectedConversationRef = useRef(null);
  const fileInputRef = useRef(null);
  const messageInputRef = useRef(null);

  useEffect(() => {
    selectedConversationRef.current = selectedConversation;
  }, [selectedConversation]);

  useEffect(() => {
    return () => {
      if (pendingImagePreview) {
        URL.revokeObjectURL(pendingImagePreview);
      }
    };
  }, [pendingImagePreview]);

  // Initialize socket connection
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
    const SOCKET_URL = API_BASE_URL.replace(/\/api\/?$/, '');
    
    socket.current = io(SOCKET_URL, {
      auth: {
        userId: user._id,
      },
      reconnection: true,
    });

    socket.current.on('connect', () => {
      socket.current.emit('join', user._id);
    });

    socket.current.on('user-online', (data) => {
      setOnlineUsers(prev => new Set([...prev, data.userId]));
    });

    socket.current.on('online-users', (userIds) => {
      setOnlineUsers(new Set(userIds));
    });

    socket.current.on('user-offline', (data) => {
      setOnlineUsers(prev => {
        const updated = new Set(prev);
        updated.delete(data.userId);
        return updated;
      });
    });

    socket.current.on('receive-message', (data) => {
      if (selectedConversationRef.current?._id === data.conversationId) {
        setMessages(prev => [...prev, data.message]);
        scrollToBottom();
      }
      // Update conversation list
      fetchConversations();
    });

    socket.current.on('new-message', (data) => {
      if (selectedConversationRef.current?._id === data.conversationId) {
        setMessages(prev => [...prev, data.message]);
        scrollToBottom();
      }
      // Update conversation list
      fetchConversations();
    });

    socket.current.on('user-typing', (data) => {
      if (selectedConversation?.participants.some(p => p._id === data.userId)) {
        setTypingUsers(prev => [...new Set([...prev, data.userId])]);
      }
    });

    socket.current.on('user-stop-typing', (data) => {
      setTypingUsers(prev => prev.filter(id => id !== data.userId));
    });

    socket.current.on('disconnect', () => {});

    return () => {
      socket.current?.disconnect();
    };
  }, [isAuthenticated, user]);

  // Fetch conversations
  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await chatAPI.getConversations();
      setConversations(response.data.data);
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
      toast.error('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchConversations();
    }
  }, [isAuthenticated]);

  // If navigated here with a conversationId, select it once conversations are loaded
  useEffect(() => {
    const convId = location.state?.conversationId;
    if (convId && conversations.length > 0) {
      const found = conversations.find(c => c._id === convId || c._id === convId?.toString());
      if (found) {
        setSelectedConversation(found);
      }
    }
  }, [conversations, location.state]);

  // autofocus message input when a conversation is selected
  useEffect(() => {
    if (selectedConversation) {
      setTimeout(() => {
        messageInputRef.current?.focus();
        scrollToBottom();
      }, 150);
    }
  }, [selectedConversation]);

  // Fetch messages for selected conversation
  useEffect(() => {
    if (!selectedConversation) return;
    const conversationId = selectedConversation._id;

    const fetchMessages = async () => {
      try {
        setMessageLoading(true);
        const response = await chatAPI.getMessages(conversationId, { page: 1, limit: 50 });
        setMessages(response.data.data);
        scrollToBottom();

        // Join conversation room for real-time updates
        socket.current?.emit('join-conversation', conversationId);

        // Mark all messages as read
        await chatAPI.markAsRead(conversationId);
      } catch (error) {
        console.error('❌ Failed to fetch messages:', error);
        toast.error('Failed to load messages');
      } finally {
        setMessageLoading(false);
      }
    };

    fetchMessages();
    return () => {
      if (conversationId) {
        socket.current?.emit('leave-conversation', conversationId);
      }
    };
  }, [selectedConversation]);

  // Search users
  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      const response = await chatAPI.searchUsers(query);
      setSearchResults(response.data.data);
    } catch (error) {
      console.error('Search failed:', error);
    }
  };

  // Start new conversation
  const startConversation = async (otherUser) => {
    try {
      const response = await chatAPI.getOrCreateConversation(otherUser._id);
      setSelectedConversation(response.data.data);
      setShowNewChat(false);
      setSearchQuery('');
      setSearchResults([]);
      fetchConversations();
    } catch (error) {
      console.error('Failed to start conversation:', error);
      toast.error('Failed to start conversation');
    }
  };

  // Send message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!selectedConversation) return;
    if (!newMessage.trim() && !pendingImage) return;

    const messageContent = newMessage.trim();

    try {
      const formData = new FormData();
      formData.append('content', messageContent);
      if (pendingImage) {
        formData.append('image', pendingImage);
      }
      const response = await chatAPI.sendMessage(selectedConversation._id, formData);
      setMessages(prev => [...prev, response.data.data]);
      setNewMessage('');
      if (pendingImagePreview) {
        URL.revokeObjectURL(pendingImagePreview);
      }
      setPendingImagePreview('');
      setPendingImage(null);
      scrollToBottom();

      // Emit via socket to notify other users in real-time
      socket.current?.emit('send-message', {
        conversationId: selectedConversation._id,
        message: response.data.data,
      });
    } catch (error) {
      console.error('❌ Failed to send message:', error);
      toast.error('Failed to send message');
    }
  };

  const addEmoji = (emoji) => {
    setNewMessage((prev) => prev + emoji);
    setShowEmojiPicker(false);
  };

  // Handle typing
  const handleTyping = () => {
    if (!isTyping && selectedConversation) {
      setIsTyping(true);
      socket.current?.emit('user-typing', {
        conversationId: selectedConversation._id,
        userId: user._id,
        username: user.username,
      });
    }

    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socket.current?.emit('user-stop-typing', {
        conversationId: selectedConversation._id,
        userId: user._id,
      });
    }, 3000);
  };

  // Scroll to bottom
  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 0);
  };

  // Get other participant info
  const getOtherParticipant = (conversation) => {
    return conversation.participants.find(p => p._id !== user._id);
  };

  const formatTime = (iso) => {
    try {
      const d = new Date(iso);
      const now = new Date();
      const sameDay = d.toDateString() === now.toDateString();
      if (sameDay) {
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
      return d.toLocaleDateString();
    } catch (e) {
      return '';
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className={`text-4xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Chat</h1>
          <p className={isDarkMode ? 'text-slate-400' : 'text-slate-600'}>Please login to use chat</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen pt-20 pb-10 ${isDarkMode ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="h-[calc(100vh-120px)] flex gap-4"
        >
          {/* Conversations List */}
          <motion.div
            className={`${
              selectedConversation ? 'hidden md:flex' : 'flex'
            } flex-col w-full md:w-80 ${
              isDarkMode ? 'bg-gray-800' : 'bg-white'
            } rounded-lg shadow-lg overflow-hidden`}
          >
            {/* Header */}
            <div className={`p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Messages</h2>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowNewChat(!showNewChat)}
                  className={`p-2 rounded-lg transition ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
                >
                  <Plus className="w-5 h-5 text-blue-500" />
                </motion.button>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className={`absolute left-3 top-3 w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:outline-none focus:border-blue-500`}
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>
            </div>

            {/* New Chat Dialog */}
            <AnimatePresence>
              {showNewChat && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`border-b ${isDarkMode ? 'border-gray-700 bg-gray-700' : 'border-gray-200 bg-gray-50'} p-4 max-h-64 overflow-y-auto`}
                >
                  <input
                    type="text"
                    placeholder="Search users..."
                    className={`w-full p-2 rounded-lg border mb-3 ${
                      isDarkMode
                        ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-300'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } focus:outline-none`}
                    onChange={(e) => handleSearch(e.target.value)}
                    value={searchQuery}
                  />
                  {searchResults.map((result) => (
                    <motion.button
                      key={result._id}
                      whileHover={{ x: 5 }}
                      onClick={() => startConversation(result)}
                      className={`w-full text-left p-3 rounded-lg mb-2 transition ${
                        isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-100'
                      }`}
                    >
                      <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{result.username}</p>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{result.email}</p>
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Conversations */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader className="w-6 h-6 text-blue-400 animate-spin" />
                </div>
              ) : conversations.length === 0 ? (
                <div className={`flex flex-col items-center justify-center h-full gap-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  <p>No conversations yet</p>
                  <button
                    onClick={() => setShowNewChat(true)}
                    className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg"
                  >
                    Start a conversation
                  </button>
                </div>
              ) : (
                conversations.map((conv) => {
                  const other = getOtherParticipant(conv);
                  const isOnline = onlineUsers.has(other?._id);
                  const isSelected = selectedConversation?._id === conv._id;
                  const unread = conv.unreadCount || (conv.unread && conv.unread.length) || 0;

                  const avatarInitial = other?.username ? other.username.charAt(0).toUpperCase() : '?';

                  return (
                    <motion.button
                      key={conv._id}
                      whileHover={{ x: 5 }}
                      onClick={() => setSelectedConversation(conv)}
                      className={`w-full p-4 border-b text-left transition ${
                        isSelected
                          ? isDarkMode
                            ? 'bg-gray-700 border-blue-500'
                            : 'bg-blue-50 border-blue-500'
                          : isDarkMode
                          ? 'hover:bg-gray-700 border-gray-700'
                          : 'hover:bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-white`} style={{background: 'linear-gradient(135deg,#60a5fa,#a78bfa)'}}>
                            {avatarInitial}
                          </div>
                          {isOnline && (
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2" style={{borderColor: isDarkMode ? '#111827' : '#fff'}}></div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold truncate" style={{color: isDarkMode ? '#fff' : '#111827'}}>{other?.username}</p>
                            {unread > 0 && (
                              <span className="text-xs bg-red-500 text-white rounded-full px-2 py-0.5">{unread}</span>
                            )}
                            <span className="ml-auto text-xs text-gray-400">{conv.lastMessage?._id ? formatTime(conv.lastMessage.createdAt) : ''}</span>
                          </div>
                          <p className={`text-sm truncate ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {conv.lastMessage?.content || 'No messages yet'}
                          </p>
                        </div>
                      </div>
                    </motion.button>
                  );
                })
              )}
            </div>
          </motion.div>

          {/* Chat Area */}
          {selectedConversation ? (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`flex-1 ${
                isDarkMode ? 'bg-gray-800' : 'bg-white'
              } rounded-lg shadow-lg flex flex-col overflow-hidden`}
            >
              {/* Chat Header */}
              <div className={`p-4 border-b ${
                isDarkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-white'
              } flex items-center justify-between`}>
                <div className="flex items-center gap-3">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    onClick={() => setSelectedConversation(null)}
                    className={`md:hidden p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
                  >
                    <ChevronLeft className={`w-5 h-5 ${isDarkMode ? 'text-white' : 'text-gray-900'}`} />
                  </motion.button>
                  <div>
                    <h3 className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {getOtherParticipant(selectedConversation)?.username}
                    </h3>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {onlineUsers.has(getOtherParticipant(selectedConversation)?._id) ? 'Online' : 'Offline'}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {(() => {
                    const otherUser = getOtherParticipant(selectedConversation);
                    const phone = otherUser?.phone;
                    if (phone) {
                      return (
                        <a
                          href={`tel:${phone}`}
                          aria-label={`Call ${otherUser.username}`}
                          className={`p-2 rounded-lg transition ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
                        >
                          <Phone className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                        </a>
                      );
                    }

                    // Fallback: open mailto if phone not available
                    const email = otherUser?.email;
                    if (email) {
                      return (
                        <a
                          href={`mailto:${email}`}
                          aria-label={`Email ${otherUser.username}`}
                          className={`p-2 rounded-lg transition ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
                        >
                          <Phone className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                        </a>
                      );
                    }

                    return (
                      <button
                        type="button"
                        onClick={() => toast.info('Contact details not available')}
                        className="p-2 rounded-lg opacity-50 cursor-not-allowed"
                        aria-label="Contact not available"
                      >
                        <Phone className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                      </button>
                    );
                  })()}
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messageLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader className="w-6 h-6 text-blue-400 animate-spin" />
                  </div>
                ) : (
                  messages.map((msg, idx) => (
                    <motion.div
                      key={msg._id || idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${
                        msg.sender._id === user._id ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-[70%] md:max-w-xs px-4 py-2 rounded-lg ${
                          msg.sender._id === user._id
                            ? 'bg-blue-600 text-white'
                            : isDarkMode
                            ? 'bg-gray-700 text-white'
                            : 'bg-gray-400 text-white'
                        }`}
                      >
                        {msg.messageType === 'image' && msg.attachments?.[0]?.url ? (
                          <img
                            src={msg.attachments[0].url}
                            alt="attachment"
                            className="max-w-full rounded-lg mb-2"
                          />
                        ) : null}
                        {msg.content ? <p className="text-white font-semibold">{msg.content}</p> : null}
                        <p className={`text-xs mt-1 ${msg.sender._id === user._id ? 'text-blue-100' : 'text-gray-100'}`}>
                          {formatTime(msg.createdAt)}
                        </p>
                      </div>
                    </motion.div>
                  ))
                )}

                {/* Typing Indicator */}
                {typingUsers.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex gap-1"
                  >
                    <div className={`px-4 py-2 rounded-lg ${
                      isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                    }`}>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-700'}`}>
                        {typingUsers.map(id => 
                          selectedConversation.participants.find(p => p._id === id)?.username
                        ).join(', ')} is typing...
                      </p>
                    </div>
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <form
                onSubmit={handleSendMessage}
                className={`relative p-4 border-t ${
                  isDarkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-white'
                } flex gap-2`}
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  className={`p-2 rounded-lg transition ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Paperclip className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                </motion.button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      if (pendingImagePreview) {
                        URL.revokeObjectURL(pendingImagePreview);
                      }
                      setPendingImage(file);
                      setPendingImagePreview(URL.createObjectURL(file));
                    }
                  }}
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  className={`p-2 rounded-lg transition ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
                  onClick={() => setShowEmojiPicker((prev) => !prev)}
                >
                  <Smile className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                </motion.button>
                {showEmojiPicker && (
                  <div className={`absolute bottom-20 left-6 p-3 rounded-xl shadow-lg ${
                    isDarkMode ? 'bg-gray-800' : 'bg-white border border-gray-300'
                  }`}>
                    <div className="grid grid-cols-6 gap-2 text-lg">
                      {['😀','😁','😂','😍','😎','👍','🙏','🔥','🎉','❤️','😢','😡'].map((e) => (
                        <button key={e} type="button" onClick={() => addEmoji(e)}>{e}</button>
                      ))}
                    </div>
                  </div>
                )}
                <textarea
                  ref={messageInputRef}
                  value={newMessage}
                  onChange={(e) => {
                    setNewMessage(e.target.value);
                    handleTyping();
                  }}
                  onInput={(e) => {
                    e.target.style.height = 'auto';
                    e.target.style.height = `${e.target.scrollHeight}px`;
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage(e);
                    }
                  }}
                  rows={1}
                  placeholder="Type a message... (Enter to send, Shift+Enter for newline)"
                  className={`flex-1 px-4 py-2 rounded-lg border resize-none overflow-hidden ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:outline-none focus:border-blue-500`}
                />
                {pendingImage && (
                  <div className="flex items-center gap-2 px-2">
                    {pendingImagePreview ? (
                      <img
                        src={pendingImagePreview}
                        alt="preview"
                        className="w-8 h-8 rounded object-cover"
                      />
                    ) : null}
                    <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Image ready</span>
                    <button
                      type="button"
                      onClick={() => {
                        if (pendingImagePreview) {
                          URL.revokeObjectURL(pendingImagePreview);
                        }
                        setPendingImagePreview('');
                        setPendingImage(null);
                      }}
                    >
                      <X className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                    </button>
                  </div>
                )}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  disabled={!newMessage.trim() && !pendingImage}
                  className="p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg transition"
                >
                  <Send className="w-5 h-5" />
                </motion.button>
              </form>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`hidden md:flex flex-1 ${
                isDarkMode ? 'bg-gray-800' : 'bg-white'
              } rounded-lg items-center justify-center`}
            >
              <div className="text-center">
                <h2 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Select a conversation
                </h2>
                <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                  Or start a new chat with someone
                </p>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Chat;
