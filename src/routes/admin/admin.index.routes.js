import { Router } from "express";
import { protect } from "../../middleware/auth.middleware.js";
import { adminOnly } from "../../middleware/admin.middleware.js";

import { getDashboardStats } from "../../controllers/admin/dashboard.controller.js";
import { getAllUsers, updateUser, deleteUser } from '../../controllers/admin/users.controller.js';
import { createBanner, getBanners, updateBanner, deleteBanner } from '../../controllers/admin/banners.controller.js';

const router = Router();

// Protect every admin endpoint
router.use(protect, adminOnly);

// Dashboard
router.route("/dashboard").get(getDashboardStats);

// Users
router.route("/users").get(getAllUsers);

router.route("/users/:id")
    .patch(updateUser)
    .delete(deleteUser)

// banners
router.route("/banners")
    .get(getBanners)
    .post(createBanner)

router.route("/banners/:id")
    .patch(updateBanner)
    .delete(deleteBanner)

export default router;