import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      default: '',
    },
    location: {
      type: String,
      default: '',
    },
    bio: {
      type: String,
      default: '',
    },
    role: {
      type: String,
      enum: ['user', 'moderator', 'admin'],
      default: 'user',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    otp:{
        type:String,
        default:null
    },
    otpExpiry:{
        type:Date,
        default:null
    },
    resetOtp:{
        type:String,
        default:null
    },
    resetOtpExpiry:{
        type:Date,
        default:null
    },
    favorites: {
      type: [{
        itemId: mongoose.Schema.Types.ObjectId,
        type: { type: String, enum: ['item', 'book'] }, // 'item' or 'book'
        addedAt: { type: Date, default: Date.now }
      }],
      default: []
    },
    itemsRecovered: {
      type: Number,
      default: 0
    }

  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", UserSchema);

export default User;
