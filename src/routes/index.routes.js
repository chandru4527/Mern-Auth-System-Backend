import { Router } from "express";

import authRoutes from "./auth.routes.js";
import adminRoutes from "./admin/admin.index.routes.js";

const router = Router();

// GET /api
router.get("/", (req, res) => {
    return res.status(200).json({
        success: true,
        message: "Welcome to the API",
    });
});

// GET /api/health
router.get("/health", (req, res) => {
    return res.status(200).json({
        success: true,
        message: "Server is running",
        environment: process.env.NODE_ENV || "development",
    });
});

// Auth routes
router.use("/auth", authRoutes);

// Admin routes
router.use("/admin", adminRoutes);

export default router;