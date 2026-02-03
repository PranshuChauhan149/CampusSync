import User from "../models/userModel.js";
import Book from "../models/bookModel.js";
import Item from "../models/itemModel.js";
import jwt from "jsonwebtoken";
import bcryptjs from "bcryptjs";

const isProduction = process.env.NODE_ENV === "production";
const adminCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

/* =========================================================
   ADMIN AUTH CONTROLLERS
   ========================================================= */

export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const user = await User.findOne({ email });

    if (!user || user.role !== "admin") {
      return res
        .status(401)
        .json({ message: "Invalid credentials or not an admin" });
    }

    const isPasswordMatch = await bcryptjs.compare(password, user.password);

    if (!isPasswordMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET || "your_jwt_secret",
      { expiresIn: "7d" }
    );

    res.cookie("adminToken", token, adminCookieOptions);

    res.status(200).json({
      message: "Admin logged in successfully",
      admin: {
        id: user._id,
        email: user.email,
        name: user.username,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({ message: "Login failed" });
  }
};

export const adminLogout = (req, res) => {
  res.clearCookie("adminToken", {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
  });
  res.status(200).json({ message: "Logged out successfully" });
};

export const getAdminMe = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");

    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    res.status(200).json({ admin: user });
  } catch (error) {
    console.error("Get admin error:", error);
    res.status(500).json({ message: "Failed to fetch admin info" });
  }
};

export const verifyAdminToken = async (req, res) => {
  try {
    const token = req.cookies.adminToken;

    if (!token) {
      return res.status(401).json({ message: "No token found" });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your_jwt_secret"
    );

    if (decoded.role !== "admin") {
      return res.status(403).json({ message: "Not an admin token" });
    }

    res.status(200).json({ valid: true, userId: decoded.userId });
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};

/* =========================================================
   ADMIN USERS CONTROLLERS
   ========================================================= */

export const getAdminUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;
    const skip = (page - 1) * limit;

    const query = search
      ? { $or: [{ username: { $regex: search, $options: "i" } }, { email: { $regex: search, $options: "i" } }] }
      : {};

    const users = await User.find(query)
      .select("-password")
      .limit(limit * 1)
      .skip(skip)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.status(200).json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

export const getAdminUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ message: "Failed to fetch user" });
  }
};

export const updateAdminUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const updates = req.body;

    // Don't allow password updates through this route
    delete updates.password;

    const user = await User.findByIdAndUpdate(userId, updates, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User updated", user });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({ message: "Failed to update user" });
  }
};

export const deleteAdminUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ message: "Failed to delete user" });
  }
};

export const getUserStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const newUsersThisMonth = await User.countDocuments({
      createdAt: {
        $gte: new Date(new Date().setDate(1)),
      },
    });
    const activeUsers = await User.countDocuments({ isActive: true });

    res.status(200).json({
      totalUsers,
      newUsersThisMonth,
      activeUsers,
    });
  } catch (error) {
    console.error("Get user stats error:", error);
    res.status(500).json({ message: "Failed to fetch user stats" });
  }
};

/* =========================================================
   ADMIN BOOKS CONTROLLERS
   ========================================================= */

export const getAdminBooks = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;
    const skip = (page - 1) * limit;

    const query = search
      ? { $or: [{ title: { $regex: search, $options: "i" } }, { author: { $regex: search, $options: "i" } }] }
      : {};

    const books = await Book.find(query)
      .populate("seller", "username email")
      .limit(limit * 1)
      .skip(skip)
      .sort({ createdAt: -1 });

    const total = await Book.countDocuments(query);

    res.status(200).json({
      books,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    console.error("Get books error:", error);
    res.status(500).json({ message: "Failed to fetch books" });
  }
};

export const getAdminBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.bookId).populate(
      "seller",
      "username email"
    );

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    res.status(200).json({ book });
  } catch (error) {
    console.error("Get book error:", error);
    res.status(500).json({ message: "Failed to fetch book" });
  }
};

export const updateAdminBook = async (req, res) => {
  try {
    const book = await Book.findByIdAndUpdate(req.params.bookId, req.body, {
      new: true,
      runValidators: true,
    }).populate("seller", "username email");

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    res.status(200).json({ message: "Book updated", book });
  } catch (error) {
    console.error("Update book error:", error);
    res.status(500).json({ message: "Failed to update book" });
  }
};

export const deleteAdminBook = async (req, res) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.bookId);

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    res.status(200).json({ message: "Book deleted successfully" });
  } catch (error) {
    console.error("Delete book error:", error);
    res.status(500).json({ message: "Failed to delete book" });
  }
};

export const approveBook = async (req, res) => {
  try {
    const book = await Book.findByIdAndUpdate(
      req.params.bookId,
      { status: "approved" },
      { new: true }
    );

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    res.status(200).json({ message: "Book approved", book });
  } catch (error) {
    console.error("Approve book error:", error);
    res.status(500).json({ message: "Failed to approve book" });
  }
};

export const rejectBook = async (req, res) => {
  try {
    const book = await Book.findByIdAndUpdate(
      req.params.bookId,
      { status: "rejected" },
      { new: true }
    );

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    res.status(200).json({ message: "Book rejected", book });
  } catch (error) {
    console.error("Reject book error:", error);
    res.status(500).json({ message: "Failed to reject book" });
  }
};

export const getBookStats = async (req, res) => {
  try {
    const totalBooks = await Book.countDocuments();
    const pendingBooks = await Book.countDocuments({ status: "pending" });
    const approvedBooks = await Book.countDocuments({ status: "approved" });

    res.status(200).json({
      totalBooks,
      pendingBooks,
      approvedBooks,
    });
  } catch (error) {
    console.error("Get book stats error:", error);
    res.status(500).json({ message: "Failed to fetch book stats" });
  }
};

/* =========================================================
   ADMIN ITEMS CONTROLLERS
   ========================================================= */

export const getAdminItems = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;
    const skip = (page - 1) * limit;

    const query = search
      ? { $or: [{ title: { $regex: search, $options: "i" } }, { description: { $regex: search, $options: "i" } }] }
      : {};

    const items = await Item.find(query)
      .populate("postedBy", "username email")
      .limit(limit * 1)
      .skip(skip)
      .sort({ createdAt: -1 });

    const total = await Item.countDocuments(query);

    res.status(200).json({
      items,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    console.error("Get items error:", error);
    res.status(500).json({ message: "Failed to fetch items" });
  }
};

export const getAdminItemById = async (req, res) => {
  try {
    const item = await Item.findById(req.params.itemId).populate(
      "postedBy",
      "username email"
    );

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    res.status(200).json({ item });
  } catch (error) {
    console.error("Get item error:", error);
    res.status(500).json({ message: "Failed to fetch item" });
  }
};

export const updateAdminItem = async (req, res) => {
  try {
    const item = await Item.findByIdAndUpdate(req.params.itemId, req.body, {
      new: true,
      runValidators: true,
    }).populate("postedBy", "username email");

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    res.status(200).json({ message: "Item updated", item });
  } catch (error) {
    console.error("Update item error:", error);
    res.status(500).json({ message: "Failed to update item" });
  }
};

export const deleteAdminItem = async (req, res) => {
  try {
    const item = await Item.findByIdAndDelete(req.params.itemId);

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    res.status(200).json({ message: "Item deleted successfully" });
  } catch (error) {
    console.error("Delete item error:", error);
    res.status(500).json({ message: "Failed to delete item" });
  }
};

export const approveItem = async (req, res) => {
  try {
    const item = await Item.findByIdAndUpdate(
      req.params.itemId,
      { status: "approved" },
      { new: true }
    );

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    res.status(200).json({ message: "Item approved", item });
  } catch (error) {
    console.error("Approve item error:", error);
    res.status(500).json({ message: "Failed to approve item" });
  }
};

export const rejectItem = async (req, res) => {
  try {
    const item = await Item.findByIdAndUpdate(
      req.params.itemId,
      { status: "rejected" },
      { new: true }
    );

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    res.status(200).json({ message: "Item rejected", item });
  } catch (error) {
    console.error("Reject item error:", error);
    res.status(500).json({ message: "Failed to reject item" });
  }
};

export const getItemStats = async (req, res) => {
  try {
    const totalItems = await Item.countDocuments();
    const lostItems = await Item.countDocuments({ type: "lost" });
    const foundItems = await Item.countDocuments({ type: "found" });

    res.status(200).json({
      totalItems,
      lostItems,
      foundItems,
    });
  } catch (error) {
    console.error("Get item stats error:", error);
    res.status(500).json({ message: "Failed to fetch item stats" });
  }
};

/* =========================================================
   ADMIN DASHBOARD CONTROLLERS
   ========================================================= */

export const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalBooks = await Book.countDocuments();
    const totalItems = await Item.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });

    res.status(200).json({
      totalUsers,
      totalBooks,
      totalItems,
      activeUsers,
    });
  } catch (error) {
    console.error("Get dashboard stats error:", error);
    res.status(500).json({ message: "Failed to fetch dashboard stats" });
  }
};

export const getActivityChart = async (req, res) => {
  try {
    // Get monthly data for the last 6 months
    const months = [];
    const monthlyData = [];
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const year = date.getFullYear();
      const month = date.getMonth();
      
      // Format month name
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthName = monthNames[month];
      months.push(monthName);
      
      // Get start and end of month
      const startOfMonth = new Date(year, month, 1);
      const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59, 999);
      
      // Count documents created in this month
      const usersCount = await User.countDocuments({
        createdAt: { $gte: startOfMonth, $lte: endOfMonth }
      });
      const booksCount = await Book.countDocuments({
        createdAt: { $gte: startOfMonth, $lte: endOfMonth }
      });
      const itemsCount = await Item.countDocuments({
        createdAt: { $gte: startOfMonth, $lte: endOfMonth }
      });
      
      monthlyData.push({
        name: monthName,
        users: usersCount,
        books: booksCount,
        items: itemsCount
      });
    }
    
    res.status(200).json({
      data: monthlyData
    });
  } catch (error) {
    console.error("Get activity chart error:", error);
    res.status(500).json({ message: "Failed to fetch activity chart" });
  }
};

export const getRecentActivity = async (req, res) => {
  try {
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("username email createdAt");

    const recentBooks = await Book.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("title seller createdAt");

    const recentItems = await Item.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("title postedBy createdAt");

    res.status(200).json({
      recentUsers,
      recentBooks,
      recentItems,
    });
  } catch (error) {
    console.error("Get recent activity error:", error);
    res.status(500).json({ message: "Failed to fetch recent activity" });
  }
};

// Get all claims for admin dashboard
export const getAllClaims = async (req, res) => {
  try {
    const ItemClaim = require("../models/itemClaimModel.js").default;
    
    const claims = await ItemClaim.find()
      .populate({
        path: 'item',
        select: 'title description category location date reportedBy'
      })
      .populate('claimant', 'name username email')
      .populate({
        path: 'item',
        populate: { path: 'reportedBy', select: 'name username email' }
      })
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      data: claims,
      total: claims.length
    });
  } catch (error) {
    console.error('Error fetching all claims:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch claims'
    });
  }
};

// Get dashboard statistics for admin
export const getAdminDashboardStats = async (req, res) => {
  try {
    const ItemClaim = require("../models/itemClaimModel.js").default;
    
    const totalUsers = await User.countDocuments();
    const totalItems = await Item.countDocuments();
    const totalBooks = await Book.countDocuments();
    const totalClaims = await ItemClaim.countDocuments();
    const pendingClaims = await ItemClaim.countDocuments({ status: 'pending' });
    const approvedClaims = await ItemClaim.countDocuments({ status: 'approved' });
    const rejectedClaims = await ItemClaim.countDocuments({ status: 'rejected' });
    const claimedItems = await ItemClaim.countDocuments({ status: 'claimed' });
    
    const activeUsers = await User.countDocuments({ isVerified: true });
    const verifiedUsers = await User.countDocuments({ isVerified: true });
    
    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        activeUsers,
        verifiedUsers,
        totalItems,
        totalBooks,
        totalClaims,
        pendingClaims,
        approvedClaims,
        rejectedClaims,
        claimedItems
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch statistics'
    });
  }
};
