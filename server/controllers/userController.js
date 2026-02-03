import User from "../models/userModel.js";
import OTPTemp from "../models/otpTempModel.js";
import Item from "../models/itemModel.js";
import Book from "../models/bookModel.js";
import bcrypt from "bcryptjs";
import { sendOTPEmail } from "../config/verifyEmail.js";
import jwt from "jsonwebtoken";
import genToken from "../config/Token.js";
const isProduction = process.env.NODE_ENV === "production";
const authCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
};
const authCookieOptionsWithMaxAge = {
  ...authCookieOptions,
  maxAge: 7 * 24 * 60 * 60 * 1000,
};
// Generate 6 digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Register user - Store temporarily with OTP (DO NOT SAVE TO MAIN USER COLLECTION)
export const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields required",
      });
    }

    // Check if email already exists in verified users
    const existingVerifiedUser = await User.findOne({ email, isVerified: true });
    if (existingVerifiedUser) {
      return res.status(409).json({
        success: false,
        message: "Email already registered. Please login or use different email.",
      });
    }

    // Check if email is already pending verification
    const existingTempUser = await OTPTemp.findOne({ email });
    if (existingTempUser) {
      // Delete old pending registration
      await OTPTemp.deleteOne({ email });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store temporarily in OTPTemp collection (NOT in User collection)
    const tempUser = await OTPTemp.create({
      username,
      email,
      password: hashedPassword,
      otp,
      otpExpiry,
    });

    // Send OTP to email and wait for result
    try {
      await sendOTPEmail(otp, email);
    } catch (err) {
      console.error('Failed to send OTP email:', err.message);
      await OTPTemp.deleteOne({ _id: tempUser._id });
      return res.status(500).json({
        success: false,
        message: "Failed to send OTP email. Please try again.",
      });
    }

    return res.status(201).json({
      success: true,
      message: "OTP sent to your email. Please verify to complete registration.",
      userId: tempUser._id,
      email: tempUser.email,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Verify OTP and SAVE to main User collection


// Verify OTP and SAVE to main User collection
export const verifyOTP = async (req, res) => {
  try {
    const { userId, otp } = req.body;

    if (!userId || !otp) {
      return res.status(400).json({
        success: false,
        message: "User ID and OTP required",
      });
    }

    // Find temporary user data
    const tempUser = await OTPTemp.findById(userId);

    if (!tempUser) {
      return res.status(404).json({
        success: false,
        message: "Registration request expired. Please register again.",
      });
    }

    // Check if OTP is expired
    if (new Date() > tempUser.otpExpiry) {
      await OTPTemp.deleteOne({ _id: userId });
      return res.status(400).json({
        success: false,
        message: "OTP expired. Please register again.",
      });
    }

    // Check OTP
    if (tempUser.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    // Save to main User collection
    const newUser = await User.create({
      username: tempUser.username,
      email: tempUser.email,
      password: tempUser.password,
      isVerified: true,
    });

    

    // 🔐 CREATE JWT TOKEN
    const token = jwt.sign(
      { id: newUser._id },
      process.env.JWT_SECRET, // "gjhgjgkuygukiu"
      { expiresIn: "7d" }
    );

    res.cookie("token", token, authCookieOptionsWithMaxAge);

    // Delete temp user
    await OTPTemp.deleteOne({ _id: userId });

    return res.status(200).json({
      success: true,
      message: "Email verified successfully! Registration complete.",
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        isVerified: newUser.isVerified,
      },
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Resend OTP - For temporary users (not yet verified)
export const resendOTP = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID required",
      });
    }

    // Find temporary user
    const tempUser = await OTPTemp.findById(userId);

    if (!tempUser) {
      return res.status(404).json({
        success: false,
        message: "Registration request expired. Please register again.",
      });
    }

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    tempUser.otp = otp;
    tempUser.otpExpiry = otpExpiry;
    await tempUser.save();

    // Send OTP to email and wait for result
    try {
      await sendOTPEmail(otp, tempUser.email);
    } catch (err) {
      console.error('Failed to send OTP email:', err.message);
      return res.status(500).json({
        success: false,
        message: "Failed to send OTP email. Please try again.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "OTP sent to your email",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Login user

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password required",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your email first",
        userId: user._id,
      });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // 🔐 CREATE JWT TOKEN
     const token = genToken(user._id);

    res.cookie("token", token, authCookieOptionsWithMaxAge);


    return res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        isVerified: user.isVerified,
      },
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Forgot Password - Send OTP
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found with this email",
      });
    }

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.resetOtp = otp;
    user.resetOtpExpiry = otpExpiry;
    await user.save();

    // Send OTP to email and wait for result
    try {
      await sendOTPEmail(otp, email);
    } catch (err) {
      console.error('Failed to send OTP email:', err.message);
      return res.status(500).json({
        success: false,
        message: "Failed to send OTP email. Please try again.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Password reset OTP sent to your email",
      userId: user._id,
      email: user.email,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Verify Reset OTP
export const verifyResetOTP = async (req, res) => {
  try {
    const { userId, otp } = req.body;

    if (!userId || !otp) {
      return res.status(400).json({
        success: false,
        message: "User ID and OTP required",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if OTP is expired
    if (new Date() > user.resetOtpExpiry) {
      return res.status(400).json({
        success: false,
        message: "OTP expired. Please request a new one.",
      });
    }

    // Check if OTP matches
    if (user.resetOtp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Reset Password
export const resetPassword = async (req, res) => {
  try {
    const { userId, otp, newPassword, confirmPassword } = req.body;

    if (!userId || !otp || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if OTP is expired
    if (new Date() > user.resetOtpExpiry) {
      return res.status(400).json({
        success: false,
        message: "OTP expired. Please request a new one.",
      });
    }

    // Check if OTP matches
    if (user.resetOtp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.resetOtp = null;
    user.resetOtpExpiry = null;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password reset successfully. Please login with your new password.",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Resend Reset OTP
export const resendResetOTP = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID required",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    user.resetOtp = otp;
    user.resetOtpExpiry = otpExpiry;
    await user.save();

    // Send OTP to email and wait for result
    try {
      await sendOTPEmail(otp, user.email);
    } catch (err) {
      console.error('Failed to send OTP email:', err.message);
      return res.status(500).json({
        success: false,
        message: "Failed to send OTP email. Please try again.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Password reset OTP sent to your email",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


export const getMe = (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user,
  });
};

// Logout user
export const logoutUser = (req, res) => {
  try {
    res.clearCookie("token", authCookieOptions);

    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Update user profile
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const { username, phone, location, bio } = req.body;

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if username is already taken by another user
    if (username && username !== user.username) {
      const existingUser = await User.findOne({ username });
      if (existingUser && existingUser._id.toString() !== userId.toString()) {
        return res.status(400).json({
          success: false,
          message: "Username already taken",
        });
      }
      user.username = username;
    }

    // Update other fields
    if (phone !== undefined) user.phone = phone;
    if (location !== undefined) user.location = location;
    if (bio !== undefined) user.bio = bio;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: {
        _id: user._id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        location: user.location,
        bio: user.bio,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Update profile error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update profile",
    });
  }
};
// Add item/book to favorites
export const addToFavorites = async (req, res) => {
  try {
    const { itemId, type } = req.body; // type: 'item' or 'book'
    const userId = req.user.id;

    if (!itemId || !type) {
      return res.status(400).json({
        success: false,
        message: "Item ID and type required",
      });
    }

    if (!['item', 'book'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Type must be 'item' or 'book'",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if already in favorites
    const alreadyFavorited = user.favorites.some(
      fav => fav.itemId.toString() === itemId && fav.type === type
    );

    if (alreadyFavorited) {
      return res.status(400).json({
        success: false,
        message: "Already in favorites",
      });
    }

    // Add to favorites
    user.favorites.push({ itemId, type });
    await user.save();

    console.log(`❤️ Item ${itemId} added to favorites for user ${userId}`);

    return res.status(200).json({
      success: true,
      message: "Added to favorites",
      data: user.favorites,
    });
  } catch (error) {
    console.error("Add to favorites error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to add to favorites",
    });
  }
};

// Remove from favorites
export const removeFromFavorites = async (req, res) => {
  try {
    const { itemId, type } = req.body;
    const userId = req.user.id;

    if (!itemId || !type) {
      return res.status(400).json({
        success: false,
        message: "Item ID and type required",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Remove from favorites
    user.favorites = user.favorites.filter(
      fav => !(fav.itemId.toString() === itemId && fav.type === type)
    );
    await user.save();

    console.log(`💔 Item ${itemId} removed from favorites for user ${userId}`);

    return res.status(200).json({
      success: true,
      message: "Removed from favorites",
      data: user.favorites,
    });
  } catch (error) {
    console.error("Remove from favorites error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to remove from favorites",
    });
  }
};

// Get user favorites with populated data
export const getFavorites = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 12 } = req.query;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const skip = (page - 1) * limit;

    // Fetch favorites in correct order (newest first)
    const sortedFavorites = user.favorites.sort(
      (a, b) => new Date(b.addedAt) - new Date(a.addedAt)
    );

    const items = [];
    const books = [];

    for (const fav of sortedFavorites) {
      if (fav.type === 'item') {
        const item = await Item.findById(fav.itemId).populate('reportedBy', 'username');
        if (item) items.push({ ...item.toObject(), favoriteId: fav._id, favoriteType: 'item' });
      } else if (fav.type === 'book') {
        const book = await Book.findById(fav.itemId).populate('seller', 'username');
        if (book) books.push({ ...book.toObject(), favoriteId: fav._id, favoriteType: 'book' });
      }
    }

    const allFavorites = [...items, ...books];
    const paginatedFavorites = allFavorites.slice(skip, skip + parseInt(limit));

    console.log(`📚 Fetching favorites for user ${userId}: ${allFavorites.length} total`);

    return res.status(200).json({
      success: true,
      data: paginatedFavorites,
      pagination: {
        total: allFavorites.length,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(allFavorites.length / limit),
      },
    });
  } catch (error) {
    console.error("Get favorites error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch favorites",
    });
  }
};

// Check if item is favorited
export const checkFavorite = async (req, res) => {
  try {
    const userId = req.user.id;
    const { itemId, type } = req.query;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const isFavorited = user.favorites.some(
      fav => fav.itemId.toString() === itemId && fav.type === type
    );

    return res.status(200).json({
      success: true,
      isFavorited,
    });
  } catch (error) {
    console.error("Check favorite error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to check favorite status",
    });
  }
};