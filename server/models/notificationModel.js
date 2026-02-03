import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: [
        'item_match', // When a potential match is found for lost/found item
        'item_claimed', // When someone claims an item
        'item_resolved', // When an item is marked as resolved
        'book_interest', // When someone shows interest in a book
        'book_sold', // When a book is sold
        'message_received', // New message in chat
        'system', // System notifications
      ],
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    data: {
      // Additional data related to the notification
      itemId: mongoose.Schema.Types.ObjectId,
      bookId: mongoose.Schema.Types.ObjectId,
      conversationId: mongoose.Schema.Types.ObjectId,
      userId: mongoose.Schema.Types.ObjectId,
    },
    read: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    },
  },
  { timestamps: true }
);

// Indexes
NotificationSchema.index({ user: 1, read: 1, createdAt: -1 });
NotificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Remove expired notifications
NotificationSchema.pre('save', function(next) {
  if (this.expiresAt < new Date()) {
    this.remove();
    return next();
  }
  next();
});

const Notification = mongoose.models.Notification || mongoose.model("Notification", NotificationSchema);

export default Notification;