import asyncHandler from "../utils/asyncHandler.js";
import cloudinary from "../config/cloudinary.js";

export const uploadMedia = asyncHandler(async (req, res) => {

    if (!req.file) {
        return res.status(400).json({
            success: false,
            message: "No file uploaded",
        });
    }

    const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder: "uploads",
                resource_type: "image",
            },
            (error, result) => {
                if (error) return reject(error);
                resolve(result);
            }
        );

        stream.end(req.file.buffer);
    });

    return res.status(200).json({
        success: true,
        message: "Media uploaded successfully",
        result: {
            url: result.secure_url,
            publicId: result.public_id
        }
    });
});