import Conversation from "../models/conversationModel.js";
import Message from "../models/messageModel.js";
import User from "../models/userModel.js";
import { uploadToCloudinary } from "../config/cloudinary.js";
import mongoose from "mongoose";

// Get all conversations for a user
export const getConversations = async (req, res) => {
  try {
    const userId = req.user._id;

    const conversations = await Conversation.find({
      participants: userId,
    })
      .populate('participants', 'username email')
      .populate('lastMessage')
      .sort({ lastMessageAt: -1 });

    res.status(200).json({
      success: true,
      data: conversations,
    });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch conversations',
    });
  }
};

// Get or create a conversation between two users
export const getOrCreateConversation = async (req, res) => {
  try {
    const userId = req.user._id;
    const { otherUserId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(otherUserId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID',
      });
    }

    // Check if other user exists
    const otherUser = await User.findById(otherUserId);
    if (!otherUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Don't allow conversation with self
    if (userId.toString() === otherUserId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot create conversation with yourself',
      });
    }

    // Find existing conversation
    let conversation = await Conversation.findOne({
      participants: {
        $all: [userId, new mongoose.Types.ObjectId(otherUserId)],
      },
    })
      .populate('participants', 'username email')
      .populate('lastMessage');

    // If no conversation exists, create one
    if (!conversation) {
      conversation = new Conversation({
        participants: [userId, new mongoose.Types.ObjectId(otherUserId)],
        unreadCounts: new Map(),
      });
      await conversation.save();
      await conversation.populate('participants', 'username email');
    }

    res.status(200).json({
      success: true,
      data: conversation,
    });
  } catch (error) {
    console.error('Get or create conversation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get or create conversation',
    });
  }
};

// Get messages for a conversation
export const getMessages = async (req, res) => {
  try {
    const userId = req.user._id;
    const { conversationId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid conversation ID',
      });
    }

    // Verify user is part of conversation
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found',
      });
    }

    const isParticipant = conversation.participants.some(
      (p) => p.toString() === userId.toString()
    );
    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'You are not part of this conversation',
      });
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    const messages = await Message.find({
      conversation: conversationId,
      deletedBy: { $ne: userId },
    })
      .populate('sender', 'username email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Reverse to get chronological order
    messages.reverse();

    const total = await Message.countDocuments({
      conversation: conversationId,
      deletedBy: { $ne: userId },
    });

    res.status(200).json({
      success: true,
      data: messages,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalMessages: total,
      },
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch messages',
    });
  }
};

// Send a message
export const sendMessage = async (req, res) => {
  try {
    const userId = req.user._id;
    const { conversationId } = req.params;
    const { content } = req.body;
    const file = req.file;

    console.log(`\n📨 ============================================`);
    console.log(`📨 SEND MESSAGE REQUEST`);
    console.log(`   Conversation ID: ${conversationId}`);
    console.log(`   Sender: ${userId}`);
    console.log(`   Content: ${content?.substring(0, 50)}...`);

    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      console.log(`❌ Invalid conversation ID`);
      return res.status(400).json({
        success: false,
        message: 'Invalid conversation ID',
      });
    }

    if ((!content || content.trim() === '') && !file) {
      console.log(`❌ Empty message and no attachment`);
      return res.status(400).json({
        success: false,
        message: 'Message content cannot be empty',
      });
    }

    // Verify conversation exists and user is participant
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      console.log(`❌ Conversation not found`);
      return res.status(404).json({
        success: false,
        message: 'Conversation not found',
      });
    }

    const isParticipant = conversation.participants.some(
      (p) => p.toString() === userId.toString()
    );
    if (!isParticipant) {
      console.log(`❌ User is not a participant`);
      return res.status(403).json({
        success: false,
        message: 'You are not part of this conversation',
      });
    }

    // Create message
    const messageData = {
      conversation: conversationId,
      sender: userId,
      content: content ? content.trim() : '',
      messageType: 'text',
      attachments: [],
    };

    // If an image file was uploaded, upload to Cloudinary and attach
    if (file) {
      try {
        console.log(`📸 Uploading image to Cloudinary (${file.originalname})`);
        const result = await uploadToCloudinary(file.buffer, 'chat');
        console.log(`✅ Uploaded to Cloudinary: ${result.secure_url}`);
        messageData.messageType = 'image';
        messageData.attachments.push({ url: result.secure_url, type: 'image', name: file.originalname });
        // If no text content, leave content empty string
      } catch (err) {
        console.error('❌ Cloudinary upload failed:', err);
      }
    }

    const message = new Message(messageData);

    await message.save();
    await message.populate('sender', 'username email');

    console.log(`✅ Message saved to database with ID: ${message._id}`);

    // Update conversation
    conversation.lastMessage = message._id;
    conversation.lastMessageAt = new Date();

    // Reset unread count for sender, increment for other participants
    conversation.participants.forEach((participant) => {
      if (participant.toString() === userId.toString()) {
        conversation.unreadCounts.set(userId.toString(), 0);
      } else {
        const currentUnread = conversation.unreadCounts.get(participant.toString()) || 0;
        conversation.unreadCounts.set(participant.toString(), currentUnread + 1);
      }
    });

    await conversation.save();
    console.log(`✅ Conversation updated`);

    // Emit real-time event
    const io = req.app.get('io');
    if (io) {
      console.log(`📡 Broadcasting new-message event to conversation room`);
      conversation.participants.forEach((participant) => {
        io.to(participant.toString()).emit('new-message', {
          conversationId,
          message,
        });
      });
      console.log(`✅ Real-time event broadcasted to ${conversation.participants.length} participants`);
    } else {
      console.log(`⚠️  Socket.io not available`);
    }

    console.log(`============================================\n`);

    res.status(201).json({
      success: true,
      data: message,
    });
  } catch (error) {
    console.error('❌ Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message',
    });
  }
};

// Mark messages as read
export const markMessagesAsRead = async (req, res) => {
  try {
    const userId = req.user._id;
    const { conversationId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid conversation ID',
      });
    }

    // Verify user is part of conversation
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found',
      });
    }

    const isParticipant = conversation.participants.some(
      (p) => p.toString() === userId.toString()
    );
    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'You are not part of this conversation',
      });
    }

    // Mark messages as read
    await Message.updateMany(
      {
        conversation: conversationId,
        sender: { $ne: userId },
        isRead: false,
      },
      {
        isRead: true,
        readAt: new Date(),
      }
    );

    // Reset unread count for this user
    conversation.unreadCounts.set(userId.toString(), 0);
    await conversation.save();

    res.status(200).json({
      success: true,
      message: 'Messages marked as read',
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark messages as read',
    });
  }
};

// Delete a message
export const deleteMessage = async (req, res) => {
  try {
    const userId = req.user._id;
    const { messageId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(messageId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid message ID',
      });
    }

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found',
      });
    }

    // Only sender can delete their message
    if (message.sender.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own messages',
      });
    }

    message.deletedBy.push(userId);
    await message.save();

    res.status(200).json({
      success: true,
      message: 'Message deleted',
    });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete message',
    });
  }
};

// Search users for chat
export const searchUsers = async (req, res) => {
  try {
    const { search } = req.query;
    const userId = req.user._id;

    if (!search || search.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Search query required',
      });
    }

    const users = await User.find({
      $and: [
        {
          $or: [
            { username: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
          ],
        },
        { _id: { $ne: userId } },
        { isVerified: true },
      ],
    })
      .select('username email')
      .limit(10);

    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search users',
    });
  }
};
