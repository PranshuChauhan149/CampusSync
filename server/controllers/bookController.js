import Book from '../models/bookModel.js';
import User from '../models/userModel.js';
import Notification from '../models/notificationModel.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../config/cloudinary.js';
import mongoose from 'mongoose';

// Get all books with filtering and pagination
export const getBooks = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      search,
      subject,
      condition,
      minPrice,
      maxPrice,
      status = 'available',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = { status };

    if (search) {
      filter.$text = { $search: search };
    }

    if (subject) {
      filter.subject = subject;
    }

    if (condition) {
      filter.condition = condition;
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const books = await Book.find(filter)
      .populate('seller', 'username email profilePicture')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const total = await Book.countDocuments(filter);

    res.json({
      success: true,
      data: books,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalBooks: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching books:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch books',
      error: error.message
    });
  }
};

// Get single book by ID
export const getBookById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid book ID'
      });
    }

    const book = await Book.findById(id)
      .populate('seller', 'username email profilePicture createdAt')
      .populate('buyer', 'username email profilePicture');

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    res.json({
      success: true,
      data: book
    });
  } catch (error) {
    console.error('Error fetching book:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch book',
      error: error.message
    });
  }
};

// Increment book view count (unique users only)
export const incrementBookView = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid book ID'
      });
    }

    const book = await Book.findById(id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    // Check if user is the seller or has already viewed
    const isSeller = userId && book.seller.toString() === userId.toString();
    const hasViewed = userId && book.viewedBy?.includes(userId);

    if (!isSeller && !hasViewed) {
      // Add user to viewedBy array and increment views
      await Book.findByIdAndUpdate(id, {
        $inc: { views: 1 },
        $addToSet: { viewedBy: userId || null }
      });
    }

    res.json({
      success: true,
      message: 'View recorded'
    });
  } catch (error) {
    console.error('Error incrementing book view:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to record view',
      error: error.message
    });
  }
};

// Create new book listing
export const createBook = async (req, res) => {
  try {
    console.log('📚 Creating new book...');
    const {
      title,
      author,
      isbn,
      subject,
      course,
      description,
      price,
      condition,
      location,
      contactMethod,
      tags
    } = req.body;

    console.log('📝 Book data received:', { title, author, subject, price, condition, location });
    console.log('📸 Files received:', req.files?.length || 0);

    // Validate required fields
    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Book title is required'
      });
    }

    if (!author || !author.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Author name is required'
      });
    }

    if (!subject) {
      return res.status(400).json({
        success: false,
        message: 'Subject is required'
      });
    }

    if (!price || isNaN(parseFloat(price))) {
      return res.status(400).json({
        success: false,
        message: 'Valid price is required'
      });
    }

    if (!condition) {
      return res.status(400).json({
        success: false,
        message: 'Book condition is required'
      });
    }

    if (!location || !location.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Location is required'
      });
    }

    // Handle image uploads
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      try {
        const uploadPromises = req.files.map(file => uploadToCloudinary(file.buffer, 'books'));
        const results = await Promise.all(uploadPromises);
        imageUrls = results.map(result => result.secure_url);
        console.log('✅ Uploaded images:', imageUrls.length);
      } catch (uploadError) {
        console.error('Image upload error:', uploadError);
        return res.status(500).json({
          success: false,
          message: 'Failed to upload images: ' + uploadError.message
        });
      }
    }

    // Parse tags if needed
    let parsedTags = [];
    try {
      if (tags) {
        parsedTags = typeof tags === 'string' ? JSON.parse(tags) : (Array.isArray(tags) ? tags : []);
      }
    } catch (parseError) {
      console.error('Tags parse error:', parseError);
      parsedTags = [];
    }

    // Create book
    const book = new Book({
      title: title.trim(),
      author: author.trim(),
      isbn: isbn ? isbn.trim() : '',
      subject,
      course: course ? course.trim() : '',
      description: description ? description.trim() : '',
      price: parseFloat(price),
      condition,
      images: imageUrls,
      seller: req.user._id,
      location: location.trim(),
      contactMethod: contactMethod || 'email',
      tags: parsedTags,
      status: 'available'
    });

    await book.save();
    console.log(`✅ Book saved with ID: ${book._id}`);

    // Populate seller info
    await book.populate('seller', 'username email profilePicture');
    console.log(`✅ Book seller populated: ${book.seller.username}`);

    // Send notifications to all users about new book listing
    console.log('📬 Starting notification process...');
    try {
      await notifyUsersAboutNewBook(book, req.app.get('io'));
      console.log('✅ Notifications completed');
    } catch (notificationError) {
      console.error('⚠️  Notification error (continuing anyway):', notificationError.message);
    }

    // Emit real-time event for new book so connected clients see it immediately
    try {
      const io = req.app.get('io');
      if (io) {
        io.emit('new-book', {
          type: 'book_listing',
          title: `New Book: ${book.title}`,
          message: `${book.title} by ${book.author} listed for ₹${book.price}`,
          bookId: book._id,
          price: book.price,
          createdAt: book.createdAt,
        });
        console.log('📡 Emitted new-book event for', book._id);
      }
    } catch (emitErr) {
      console.error('Error emitting new-book event:', emitErr);
    }

    res.status(201).json({
      success: true,
      message: 'Book listed successfully',
      data: book
    });
  } catch (error) {
    console.error('❌ Error creating book:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create book listing: ' + error.message
    });
  }
};

// Update book listing
export const updateBook = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid book ID'
      });
    }

    const book = await Book.findById(id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    // Check if user is the seller
    if (book.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own listings'
      });
    }

    // Handle new image uploads
    if (req.files && req.files.length > 0) {
      try {
        const uploadPromises = req.files.map(file => uploadToCloudinary(file.buffer, 'books'));
        const results = await Promise.all(uploadPromises);
        const newImageUrls = results.map(result => result.secure_url);

        // Combine existing and new images
        updates.images = [...(book.images || []), ...newImageUrls];
      } catch (uploadError) {
        console.error('Image upload error:', uploadError);
        return res.status(500).json({
          success: false,
          message: 'Failed to upload images'
        });
      }
    }

    // Update tags if provided
    if (updates.tags && typeof updates.tags === 'string') {
      updates.tags = updates.tags.split(',').map(tag => tag.trim());
    }

    // Update price if provided
    if (updates.price) {
      updates.price = parseFloat(updates.price);
    }

    const updatedBook = await Book.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    ).populate('seller', 'username email profilePicture');

    res.json({
      success: true,
      message: 'Book updated successfully',
      data: updatedBook
    });
  } catch (error) {
    console.error('Error updating book:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update book',
      error: error.message
    });
  }
};

// Delete book listing
export const deleteBook = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid book ID'
      });
    }

    const book = await Book.findById(id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    // Check if user is the seller
    if (book.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own listings'
      });
    }

    // Delete images from Cloudinary
    if (book.images && book.images.length > 0) {
      try {
        const deletePromises = book.images.map(url => deleteFromCloudinary(url));
        await Promise.all(deletePromises);
      } catch (deleteError) {
        console.error('Error deleting images:', deleteError);
        // Continue with deletion even if image deletion fails
      }
    }

    await Book.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Book deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting book:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete book',
      error: error.message
    });
  }
};

// Mark book as sold
export const markBookAsSold = async (req, res) => {
  try {
    const { id } = req.params;
    const { buyerId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid book ID'
      });
    }

    const book = await Book.findById(id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    // Check if user is the seller
    if (book.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only mark your own books as sold'
      });
    }

    if (book.status !== 'available') {
      return res.status(400).json({
        success: false,
        message: 'Book is not available for sale'
      });
    }

    const updateData = {
      status: 'sold',
      soldDate: new Date(),
      buyer: buyerId || null
    };

    const updatedBook = await Book.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).populate('seller', 'username email profilePicture')
      .populate('buyer', 'username email profilePicture');

    res.json({
      success: true,
      message: 'Book marked as sold',
      data: updatedBook
    });
  } catch (error) {
    console.error('Error marking book as sold:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark book as sold',
      error: error.message
    });
  }
};

// Get user's own book listings
export const getMyBooks = async (req, res) => {
  try {
    const books = await Book.find({ seller: req.user._id })
      .populate('buyer', 'username email profilePicture')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: books
    });
  } catch (error) {
    console.error('Error fetching user books:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch your books',
      error: error.message
    });
  }
};

// Get books by subject
export const getBooksBySubject = async (req, res) => {
  try {
    const { subject } = req.params;
    const books = await Book.find({
      subject: new RegExp(subject, 'i'),
      status: 'available'
    })
      .populate('seller', 'username email profilePicture')
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({
      success: true,
      data: books
    });
  } catch (error) {
    console.error('Error fetching books by subject:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch books by subject',
      error: error.message
    });
  }
};

// Notify all users about new book listing
const notifyUsersAboutNewBook = async (book, io) => {
  try {
    console.log(`\n🔔 NOTIFICATION PROCESS FOR BOOK: "${book.title}"`);
    console.log('============================================');

    // Get all verified users except the seller
    const sellerId = book.seller._id || book.seller;
    console.log(`🔍 Looking for verified users (excluding seller: ${sellerId})`);
    
    const users = await User.find({
      isVerified: true,
      _id: { $ne: sellerId }
    });

    console.log(`✅ Found ${users.length} verified users to notify`);

    if (users.length === 0) {
      console.log('⚠️  No users to notify - skipping notifications');
      return;
    }

    // Create notifications for each user
    const notifications = users.map(user => ({
      user: user._id,
      type: 'book_listing',
      title: 'New Book Available',
      message: `A new book "${book.title}" by ${book.author} is now available for $${book.price}`,
      data: {
        bookId: book._id,
        bookTitle: book.title,
        price: book.price
      }
    }));

    const insertedNotifications = await Notification.insertMany(notifications);
    console.log(`💾 Created ${insertedNotifications.length} database notification records`);

    console.log('============================================\n');

  } catch (error) {
    console.error('❌ CRITICAL ERROR in notification process:', error);
  }
};