import { Router } from "express";

import { protect } from "../../middleware/auth.middleware.js";

import { updateProfile, changePassword } from '../../controllers/user/user.controllers.js';
import { getActiveBanners } from '../../controllers/admin/banners.controller.js'

const router = Router();


router.use(protect)

// update profile
router.route('/profile').patch(updateProfile)

// change password
router.route("/change-password").patch(changePassword)

// get banner 
router.route("/banners").get(getActiveBanners)

export default router;