import express from "express";
import {
  registerUser,
  verifyOTP,
  resendOTP,
  loginUser,
  forgotPassword,
  verifyResetOTP,
  resetPassword,
  resendResetOTP,
  getMe,
  logoutUser,
  updateProfile,
  addToFavorites,
  removeFromFavorites,
  getFavorites,
  checkFavorite,
} from "../controllers/userController.js";
import { authenticate } from "../middlewares/auth.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/verify-otp", verifyOTP);
router.post("/resend-otp", resendOTP);
router.post("/login", loginUser);
router.post("/logout", authenticate, logoutUser);
router.post("/forgot-password", forgotPassword);
router.post("/verify-reset-otp", verifyResetOTP);
router.post("/reset-password", resetPassword);
router.post("/resend-reset-otp", resendResetOTP);
router.get("/me", authenticate, getMe);
router.put("/profile", authenticate, updateProfile);

// Favorites routes
router.post("/favorites/add", authenticate, addToFavorites);
router.post("/favorites/remove", authenticate, removeFromFavorites);
router.get("/favorites", authenticate, getFavorites);
router.get("/favorites/check", authenticate, checkFavorite);

export default router;
