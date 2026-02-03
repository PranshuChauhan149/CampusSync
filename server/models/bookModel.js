import mongoose from "mongoose";

const BookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    author: {
      type: String,
      required: true,
      trim: true,
    },
    isbn: {
      type: String,
      trim: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    course: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    condition: {
      type: String,
      required: true,
      enum: ['new', 'excellent', 'good', 'fair', 'poor'],
    },
    images: [{
      type: String, // Cloudinary URLs
    }],
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'available', 'sold', 'reserved', 'removed'],
      default: 'pending',
    },
    location: {
      type: String,
      required: true,
    },
    contactMethod: {
      type: String,
      enum: ['email', 'phone', 'both'],
      default: 'email',
    },
    tags: [{
      type: String,
      trim: true,
    }],
    views: {
      type: Number,
      default: 0,
    },
    soldDate: {
      type: Date,
    },
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

// Indexes for better search performance
BookSchema.index({ title: 'text', author: 'text', subject: 'text', description: 'text', tags: 'text' });
BookSchema.index({ subject: 1, status: 1 });
BookSchema.index({ seller: 1 });
BookSchema.index({ price: 1 });
BookSchema.index({ condition: 1 });

const Book = mongoose.models.Book || mongoose.model("Book", BookSchema);

export default Book;