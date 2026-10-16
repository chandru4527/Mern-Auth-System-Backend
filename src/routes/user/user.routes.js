import { Router } from "express";

import { protect } from "../../middleware/auth.middleware.js";

import { updateProfile, changePassword } from '../../controllers/user/user.controllers.js';

const router = Router();


router.use(protect)

// update profile
router.route('/profile').patch(updateProfile)

// change password
router.route("/change-password").patch(changePassword)

export default router;