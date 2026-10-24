import { Router } from "express";
import { protect } from "../../middleware/auth.middleware.js";
import { updateProfile, changePassword } from "../../controllers/user/user.controllers.js";
import { getActiveBanners } from "../../controllers/admin/banners.controller.js";

const router = Router();

router.route("/profile").patch(protect, updateProfile);
router.route("/change-password").patch(protect, changePassword);
router.route("/banners").get(getActiveBanners);

export default router;