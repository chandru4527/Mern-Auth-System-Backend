import { Router } from "express";

import { protect } from "../middlewares/auth.middleware.js";

const router = Router();



    router.route('profile/:id')
    .get()
    .patch()

export default router;