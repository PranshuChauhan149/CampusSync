import mongoose from "mongoose";

const ItemClaimSchema = new mongoose.Schema(
  {
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
      required: true,
    },
    claimant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    contactInfo: {
      name: {
        type: String,
        required: true,
        trim: true,
      },
      email: {
        type: String,
        required: true,
        trim: true,
      },
      phone: {
        type: String,
        trim: true,
      },
    },
    details: {
      location: {
        type: String,
        required: true,
        trim: true,
      },
      date: {
        type: Date,
        required: true,
      },
      description: {
        type: String,
        required: true,
        trim: true,
      },
      distinguishingFeatures: {
        type: String,
        trim: true,
      },
      message: {
        type: String,
        trim: true,
      },
    },
    images: [{
      type: String,
    }],
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "claimed"],
      default: "pending",
    },
  },
  { timestamps: true }
);

ItemClaimSchema.index({ item: 1, createdAt: -1 });
ItemClaimSchema.index({ claimant: 1, createdAt: -1 });

const ItemClaim = mongoose.models.ItemClaim || mongoose.model("ItemClaim", ItemClaimSchema);

export default ItemClaim;
