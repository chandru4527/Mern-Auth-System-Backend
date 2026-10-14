import express from "express";
import multer from "multer";

import { protect } from "../middleware/auth.middleware.js";
import { uploadMedia } from "../controllers/media.controller.js";

const router = express.Router();

const storage = multer.memoryStorage();

const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

const upload = multer({
    storage,
    limits: {  fileSize: 5 * 1024 * 1024, }, // 5MB limit
    fileFilter: (req, file, callback) => {
        if (allowedTypes.includes(file.mimetype)) {
            return callback(null, true);
        }
        callback(new Error("Only JPG, PNG, and WebP images are allowed"));
    },
});

router.use(protect);
router.route("/upload-image").post(upload.single("file"), uploadMedia);

export default router;