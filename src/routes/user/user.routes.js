import { Router } from "express";

import { protect } from "../middlewares/auth.middleware.js";

const router = Router();

router
    .route("/profile")
    .get(protect, getProfile)
    .put(protect, updateProfile);


    router.route('/users/:id')
    .get()
    .patch()

export default router;