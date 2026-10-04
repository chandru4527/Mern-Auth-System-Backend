import jwt from "jsonwebtoken";
import User from "../models/users.model.js";
import asyncHandler from "../utils/asyncHandler.js";

export const protect = asyncHandler(async (req, res, next) => {
    const token = req.cookies?.accessToken;

    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Authentication required. Please log in.",
        });
    }

    let decoded;

    try {
        decoded = jwt.verify(token, process.env.JWT_ACCESS_TOKEN_SECRET);
    } catch {
        return res.status(401).json({
            success: false,
            message: "Access token expired or invalid.",
        });
    }

    if (decoded.type !== "access" || typeof decoded.sub !== "string") {
        return res.status(401).json({
            success: false,
            message: "Invalid access token.",
        });
    }

    const user = await User.findById(decoded.sub);

    if (!user || !user.isActive) {
        return res.status(401).json({
            success: false,
            message: "Account unavailable. Please log in again.",
        });
    }

    req.user = user;

    next();
});