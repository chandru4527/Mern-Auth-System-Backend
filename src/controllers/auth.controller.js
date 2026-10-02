import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { randomBytes } from "node:crypto";

import Users from "../models/users.model.js";
import asyncHandler from "../utils/asyncHandler.js";

import { firebaseAdminAuth } from "../config/firebaseAdmin.js";

import {  generateAccessToken,  generateRefreshToken,} from "../utils/generateTokens.js";


const JWT_REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_TOKEN_SECRET;

const isProduction = process.env.NODE_ENV === "production";

const ACCESS_TOKEN_MAX_AGE = 15 * 60 * 1000;
const REFRESH_TOKEN_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

// Cookie options
const accessCookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/",
    maxAge: ACCESS_TOKEN_MAX_AGE,
};

const refreshCookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/api/auth",
    maxAge: REFRESH_TOKEN_MAX_AGE,
};

// Safe user response (never return the password)
const sendUserResponse = (user) => ({
    id: user._id,
    name: user.name,
    userName: user.userName,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    profileImage: user.profileImage,
    mobile: user.mobile,
    address: user.address,
    dateOfBirth: user.dateOfBirth,
});

// POST /api/auth/register
export const register = asyncHandler(async (req, res) => {
    const { name, userName, email, password } = req.body;

    if (!name?.trim() || !userName?.trim() || !email?.trim() || !password) {
        return res.status(400).json({
            success: false,
            message: "Name, username, email and password are required",
        });
    }

    if (name.trim().length < 2 || name.trim().length > 50) {
        return res.status(400).json({
            success: false,
            message: "Name must be between 2 and 50 characters",
        });
    }

    if (password.length < 8) {
        return res.status(400).json({
            success: false,
            message: "Password must contain at least 8 characters",
        });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedUserName = userName.trim();

    const existingUser = await Users.findOne({
        $or: [
            { email: normalizedEmail },
            { userName: normalizedUserName },
        ],
    });

    if (existingUser) {
        return res.status(409).json({
            success: false,
            message: "Email or username is already registered",
        });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await Users.create({
        name: name.trim(),
        userName: normalizedUserName,
        email: normalizedEmail,
        password: hashedPassword,
    });

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    res.cookie("accessToken", accessToken, accessCookieOptions);
    res.cookie("refreshToken", refreshToken, refreshCookieOptions);

    return res.status(201).json({
        success: true,
        message: "Registration successful!",
        results: {
            user: sendUserResponse(user),
        },
    });
});

// POST /api/auth/login
export const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email?.trim() || !password) {
        return res.status(400).json({
            success: false,
            message: "Email and password are required",
        });
    }

    const user = await Users.findOne({
        email: email.trim().toLowerCase(),
    }).select("+password");

    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({
            success: false,
            message: "Invalid email or password",
        });
    }

    if (!user.isActive) {
        return res.status(403).json({
            success: false,
            message: "Your account is inactive. Please contact the administrator.",
        });
    }

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    res.cookie("accessToken", accessToken, accessCookieOptions);
    res.cookie("refreshToken", refreshToken, refreshCookieOptions);

    return res.status(200).json({
        success: true,
        message: "Login successful",
        results: {
            user: sendUserResponse(user),
        },
    });
});

// POST /api/auth/google
export const googleLogin = asyncHandler(async (req, res) => {
    const { credential } = req.body;

    if (!credential || typeof credential !== "string") {
        return res.status(400).json({
            success: false,
            message: "Firebase ID token is required",
        });
    }

    // Verify the Firebase ID token on the backend
    const decodedToken = await firebaseAdminAuth.verifyIdToken(credential);

    const { uid, email, email_verified, name, picture } = decodedToken;

    if (!email || !email_verified) {
        return res.status(401).json({
            success: false,
            message: "A verified Google email is required",
        });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Find an account by Firebase UID or email
    const user = await Users.findOne({
        $or: [
            { googleId: uid },
            { email: normalizedEmail },
        ],
    });

    let authenticatedUser = user;

    if (user) {
        // Do not silently link an existing password account
        if (user.googleId !== uid) {
            return res.status(409).json({
                success: false,
                message: "An account with this email already exists",
            });
        }
    } else {
        const baseUsername = (
            normalizedEmail.split("@")[0] || "user"
        )
            .replace(/[^a-zA-Z0-9_]/g, "")
            .slice(0, 20) || "user";

        let userName = baseUsername;
        let count = 1;

        while (await Users.exists({ userName })) {
            userName = `${baseUsername}${count++}`;
        }

        const randomPassword = randomBytes(32).toString("hex");
        const hashedPassword = await bcrypt.hash(randomPassword, 12);

        authenticatedUser = await Users.create({
            name: name || baseUsername,
            userName,
            email: normalizedEmail,
            password: hashedPassword,
            googleId: uid,
            ...(picture ? { profileImage: picture } : {}),
        });
    }

    if (!authenticatedUser.isActive) {
        return res.status(403).json({
            success: false,
            message: "Your account is inactive. Please contact the administrator.",
        });
    }

    // Generate Authify JWT cookies
    const accessToken = generateAccessToken(authenticatedUser._id);
    const refreshToken = generateRefreshToken(authenticatedUser._id);

    res.cookie("accessToken", accessToken, accessCookieOptions);
    res.cookie("refreshToken", refreshToken, refreshCookieOptions);

    return res.status(200).json({
        success: true,
        message: "Google login successful",
        results: {
            user: sendUserResponse(authenticatedUser),
        },
    });
});

// GET /api/auth/me
// Requires protect middleware
export const getMe = asyncHandler(async (req, res) => {
    return res.status(200).json({
        success: true,
        results: {
            user: sendUserResponse(req.user),
        },
    });
});

// POST /api/auth/logout
export const logout = asyncHandler(async (req, res) => {
    res.clearCookie("accessToken", {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
        path: "/",
    });

    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
        path: "/api/auth",
    });

    return res.status(200).json({
        success: true,
        message: "Logout successful!",
    });
});

// POST /api/auth/refresh
export const refreshAccessToken = asyncHandler(async (req, res) => {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
        return res.status(401).json({
            success: false,
            message: "Refresh token required. Please log in again.",
        });
    }

    if (!JWT_REFRESH_TOKEN_SECRET) {
        return res.status(500).json({
            success: false,
            message: "Refresh token configuration is missing",
        });
    }

    let decoded;

    try {
        decoded = jwt.verify(refreshToken, JWT_REFRESH_TOKEN_SECRET);
    } catch {
        return res.status(401).json({
            success: false,
            message: "Refresh token expired or invalid. Please log in again.",
        });
    }

    if (decoded.type !== "refresh" || typeof decoded.sub !== "string") {
        return res.status(401).json({
            success: false,
            message: "Invalid refresh token.",
        });
    }

    const user = await Users.findById(decoded.sub);

    if (!user || !user.isActive) {
        return res.status(401).json({
            success: false,
            message: "Account unavailable. Please log in again.",
        });
    }

    const newAccessToken = generateAccessToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    res.cookie("accessToken", newAccessToken, accessCookieOptions);
    res.cookie("refreshToken", newRefreshToken, refreshCookieOptions);

    return res.status(200).json({
        success: true,
        message: "Tokens refreshed successfully",
    });
});