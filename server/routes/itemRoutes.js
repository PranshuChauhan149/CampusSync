import express from 'express';
import multer from 'multer';
import {
  getItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
  claimItem,
  getMyItems,
  getReceivedClaims,
  getSentClaims,
  updateClaimStatus,
  incrementItemView
} from '../controllers/itemController.js';
import { authenticate, optionalAuth } from '../middlewares/auth.js';

const router = express.Router();

// Configure multer for memory storage (for Cloudinary upload)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 5 // Maximum 5 files
  },
  fileFilter: (req, file, cb) => {
    // Check if file is an image
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Public routes
router.get('/', getItems);

// Protected routes (require authentication) - Place specific routes before dynamic :id routes
router.get('/my-items', authenticate, getMyItems);
router.get('/claims/received', authenticate, getReceivedClaims);
router.get('/claims/sent', authenticate, getSentClaims);
router.put('/claims/:claimId/status', authenticate, updateClaimStatus);

// Dynamic :id routes must come after specific paths
router.get('/:id', getItemById);
router.post('/:id/view', optionalAuth, incrementItemView);

router.post('/', authenticate, upload.array('images', 5), createItem);
router.put('/:id', authenticate, upload.array('images', 5), updateItem);
router.delete('/:id', authenticate, deleteItem);
router.post('/:id/claim', authenticate, upload.array('claimImages', 5), claimItem);

export default router;