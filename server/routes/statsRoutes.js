import express from 'express';
import { getStats, getUserStats } from '../controllers/statsController.js';
import { optionalAuth, authenticate } from '../middlewares/auth.js';

const router = express.Router();

// Public route - get overall stats
router.get('/', optionalAuth, getStats);

// Protected route - get user specific stats
router.get('/user', authenticate, getUserStats);

export default router;
