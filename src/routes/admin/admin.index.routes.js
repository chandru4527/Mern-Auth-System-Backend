import { Router } from "express";
import { protect } from "../../middleware/auth.middleware.js";
import { adminOnly } from "../../middleware/admin.middleware.js";

import { getDashboardStats } from "../../controllers/admin/dashboard/dashboard.controller.js";
import { getAllUsers, getUserById, updateUser, deleteUser } from '../../controllers/admin/users/users.controller.js';

const router = Router();

// Protect every admin endpoint
router.use(protect, adminOnly);

// Dashboard
router.route("/dashboard").get(getDashboardStats);

// Users
router.route("/users").get(getAllUsers);

router
    .route("/users/:id")
    .get(getUserById)
    .patch(updateUser)
    .delete(deleteUser);

// Admin routes can be extended here in the future

export default router;