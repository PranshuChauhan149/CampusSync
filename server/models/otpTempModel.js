import mongoose from "mongoose";

const OTPTempSchema = new mongoose.Schema(
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
    otp: {
      type: String,
      required: true,
    },
    otpExpiry: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

// Auto delete document after 15 minutes (OTP expiry time + buffer)
OTPTempSchema.index({ createdAt: 1 }, { expireAfterSeconds: 900 });

const OTPTemp = mongoose.models.OTPTemp || mongoose.model("OTPTemp", OTPTempSchema);

export default OTPTemp;
