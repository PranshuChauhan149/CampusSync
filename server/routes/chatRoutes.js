import express from 'express';
import multer from 'multer';
import {
  getConversations,
  getOrCreateConversation,
  getMessages,
  sendMessage,
  markMessagesAsRead,
  deleteMessage,
  searchUsers,
} from '../controllers/chatController.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// All chat routes require authentication
router.use(authenticate);

// Conversations
router.get('/conversations', getConversations);
router.get('/conversations/:otherUserId', getOrCreateConversation);

// Messages
router.get('/conversations/:conversationId/messages', getMessages);
router.post('/conversations/:conversationId/messages', upload.single('image'), sendMessage);
router.put('/conversations/:conversationId/read', markMessagesAsRead);
router.delete('/messages/:messageId', deleteMessage);

// Search users
router.get('/search-users', searchUsers);

export default router;
