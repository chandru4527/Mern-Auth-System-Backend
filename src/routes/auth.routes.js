import { Router } from "express";

import { register, login, getMe, logout, refreshAccessToken, googleLogin } from "../controllers/auth.controller.js";

import { protect } from "../middleware/auth.middleware.js";

const router = Router();

// Register
router.route("/register").post(register);

// Login
router.route("/login").post(login);

// Google login
router.route("/google-login").post(googleLogin);

// Get logged-in user
router.route("/me").get(protect, getMe);

// Refresh access token
router.route("/refresh-token").post(refreshAccessToken);

// Logout
router.route("/logout").post(logout);

export default router;