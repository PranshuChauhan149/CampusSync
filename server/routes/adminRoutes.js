import express from "express";
import {
  adminLogin,
  adminLogout,
  getAdminMe,
  verifyAdminToken,
  getAdminUsers,
  getAdminUserById,
  updateAdminUser,
  deleteAdminUser,
  getUserStats,
  getAdminBooks,
  getAdminBookById,
  updateAdminBook,
  deleteAdminBook,
  approveBook,
  rejectBook,
  getBookStats,
  getAdminItems,
  getAdminItemById,
  updateAdminItem,
  deleteAdminItem,
  approveItem,
  rejectItem,
  getItemStats,
  getDashboardStats,
  getActivityChart,
  getRecentActivity,
  getAllClaims,
  getAdminDashboardStats
} from "../controllers/adminController.js";
import { authenticateAdmin } from "../middlewares/adminAuth.js";

const router = express.Router();

/* =========================================================
   ADMIN AUTH ROUTES (NO AUTH REQUIRED)
   ========================================================= */

router.post("/login", adminLogin);

/* =========================================================
   ADMIN AUTH ROUTES (AUTH REQUIRED)
   ========================================================= */

router.post("/logout", authenticateAdmin, adminLogout);
router.get("/me", authenticateAdmin, getAdminMe);
router.get("/verify", verifyAdminToken);

/* =========================================================
   ADMIN USERS ROUTES (AUTH REQUIRED)
   ========================================================= */

router.get("/users", authenticateAdmin, getAdminUsers);
router.get("/users/stats", authenticateAdmin, getUserStats);
router.get("/users/:userId", authenticateAdmin, getAdminUserById);
router.patch("/users/:userId", authenticateAdmin, updateAdminUser);
router.delete("/users/:userId", authenticateAdmin, deleteAdminUser);

/* =========================================================
   ADMIN BOOKS ROUTES (AUTH REQUIRED)
   ========================================================= */

router.get("/books", authenticateAdmin, getAdminBooks);
router.get("/books/stats", authenticateAdmin, getBookStats);
router.get("/books/:bookId", authenticateAdmin, getAdminBookById);
router.patch("/books/:bookId", authenticateAdmin, updateAdminBook);
router.delete("/books/:bookId", authenticateAdmin, deleteAdminBook);
router.post("/books/:bookId/approve", authenticateAdmin, approveBook);
router.post("/books/:bookId/reject", authenticateAdmin, rejectBook);

/* =========================================================
   ADMIN ITEMS ROUTES (AUTH REQUIRED)
   ========================================================= */

router.get("/items", authenticateAdmin, getAdminItems);
router.get("/items/stats", authenticateAdmin, getItemStats);
router.get("/items/:itemId", authenticateAdmin, getAdminItemById);
router.patch("/items/:itemId", authenticateAdmin, updateAdminItem);
router.delete("/items/:itemId", authenticateAdmin, deleteAdminItem);
router.post("/items/:itemId/approve", authenticateAdmin, approveItem);
router.post("/items/:itemId/reject", authenticateAdmin, rejectItem);

/* =========================================================
   ADMIN DASHBOARD ROUTES (AUTH REQUIRED)
   ========================================================= */

router.get("/dashboard/stats", authenticateAdmin, getDashboardStats);
router.get("/dashboard/activity", authenticateAdmin, getActivityChart);
router.get("/dashboard/recent-activity", authenticateAdmin, getRecentActivity);
router.get("/claims/all", authenticateAdmin, getAllClaims);
router.get("/statistics", authenticateAdmin, getAdminDashboardStats);

export default router;
