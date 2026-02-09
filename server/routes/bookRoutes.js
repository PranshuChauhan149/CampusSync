import express from 'express';
import multer from 'multer';
import {
  getBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  markBookAsSold,
  getMyBooks,
  getBooksBySubject,
  incrementBookView
} from '../controllers/bookController.js';
import { authenticate, optionalAuth } from '../middlewares/auth.js';

const router = express.Router();

// Configure multer for memory storage (for Cloudinary upload)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit per file
    files: 5 // Maximum 5 files
  },
  fileFilter: (req, file, cb) => {
    // Allow only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Public routes
router.get('/', getBooks);
router.get('/subject/:subject', getBooksBySubject);

// Protected routes (require authentication) - Place specific routes before dynamic :id routes
router.get('/my-books', authenticate, getMyBooks);

// Dynamic :id routes must come after specific paths
router.get('/:id', getBookById);
router.post('/:id/view', optionalAuth, incrementBookView);

router.post('/', authenticate, upload.array('images', 5), createBook);
router.put('/:id', authenticate, upload.array('images', 5), updateBook);
router.delete('/:id', authenticate, deleteBook);
router.post('/:id/sold', authenticate, markBookAsSold);

export default router;