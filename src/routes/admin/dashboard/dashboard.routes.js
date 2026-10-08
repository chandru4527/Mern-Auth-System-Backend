import { Router } from "express";

import { getDashboardStats } from "../../../controllers/admin/dashboard/dashboard.controller.js";

import { protect } from "../../../middleware/auth.middleware.js";
import { adminOnly } from "../../../middleware/admin.middleware.js";

const router = Router();

router
    .route("/")
    .get(protect, adminOnly, getDashboardStats);

export default router;