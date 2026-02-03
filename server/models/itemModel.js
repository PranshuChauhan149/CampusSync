import mongoose from "mongoose";

const ItemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: ['electronics', 'books', 'clothing', 'accessories', 'documents', 'keys', 'other'],
    },
    type: {
      type: String,
      required: true,
      enum: ['lost', 'found'],
    },
    location: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    images: [{
      type: String, // Cloudinary URLs
    }],
    contactInfo: {
      name: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: true,
      },
      phone: {
        type: String,
      },
    },
    status: {
      type: String,
      enum: ['active', 'resolved', 'expired'],
      default: 'active',
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    claimedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    tags: [{
      type: String,
      trim: true,
    }],
    // For AI matching
    features: {
      color: String,
      brand: String,
      size: String,
      model: String,
    },
    views: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Indexes for better search performance
ItemSchema.index({ title: 'text', description: 'text', tags: 'text' });
ItemSchema.index({ category: 1, type: 1, status: 1 });
ItemSchema.index({ location: 1 });
ItemSchema.index({ reportedBy: 1 });
ItemSchema.index({ createdAt: -1 });

const Item = mongoose.models.Item || mongoose.model("Item", ItemSchema);

export default Item;