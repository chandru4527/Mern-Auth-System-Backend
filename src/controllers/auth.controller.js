import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import Users from "../models/users.model.js";
import asyncHandler from "../utils/asyncHandler.js";

import { firebaseAdminAuth } from "../config/firebaseAdmin.js";

import { generateAccessToken, generateRefreshToken, } from "../utils/generateTokens.js";


const JWT_REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_TOKEN_SECRET;

const isProduction = process.env.NODE_ENV === "production";

const ACCESS_TOKEN_MAX_AGE = 2 * 60 * 1000;
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
    termsAccepted: user.termsAccepted,
    termsAcceptedAt: user.termsAcceptedAt,
    createdAt: user.createdAt,
});

// POST /api/auth/register
export const register = asyncHandler(async (req, res) => {
    const { name, email, password, termsAccepted } = req.body;

    // Validate required fields
    if (!name?.trim() || !email?.trim() || !password || !termsAccepted) {
        return res.status(400).json({
            success: false,
            message: "Name, email, password and terms acceptance are required",
        });
    }

    // Validate name
    const trimmedName = name.trim();

    if (trimmedName.length < 2 || trimmedName.length > 50) {
        return res.status(400).json({
            success: false,
            message: "Name must be between 2 and 50 characters",
        });
    }

    // Validate password
    if (password.length < 8) {
        return res.status(400).json({
            success: false,
            message: "Password must contain at least 8 characters",
        });
    }

    // Normalize email
    const normalizedEmail = email.trim().toLowerCase();

    // Check existing user
    const existingUser = await Users.findOne({
        email: normalizedEmail,
    });

    if (existingUser) {
        return res.status(409).json({
            success: false,
            message: "Email is already registered",
        });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await Users.create({
        name: trimmedName,
        email: normalizedEmail,
        password: hashedPassword,
    });

    // Generate tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Set HTTP-only cookies
    res.cookie("accessToken", accessToken, accessCookieOptions);
    res.cookie("refreshToken", refreshToken, refreshCookieOptions);

    return res.status(201).json({
        success: true,
        message: "Registration successful!...",
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

    const normalizedEmail = email.trim().toLowerCase();

    const user = await Users.findOne({
        email: normalizedEmail,
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
            message:
                "Your account is inactive. Please contact the administrator.",
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

// POST /api/auth/google-login
export const googleLogin = asyncHandler(async (req, res) => {
    const { googleToken, termsAccepted } = req.body;

    if (!googleToken || typeof googleToken !== "string") {
        return res.status(400).json({
            success: false,
            message: "Google ID token is required",
        });
    }

    const decodedToken = await firebaseAdminAuth.verifyIdToken(
        googleToken
    );

    const {
        uid,
        email,
        email_verified: emailVerified,
        name,
        picture,
    } = decodedToken;

    if (!email || !emailVerified) {
        return res.status(401).json({
            success: false,
            message: "A verified Google email is required",
        });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await Users.findOne({
        $or: [
            { googleId: uid },
            { email: normalizedEmail },
        ],
    });

    let authenticatedUser = user;

    if (user) {
        if (user.googleId !== uid) {
            return res.status(409).json({
                success: false,
                message:
                    "An account with this email already exists. Please login using your password.",
            });
        }
    } else {
        if (termsAccepted !== true) {
            return res.status(400).json({
                success: false,
                message:
                    "You must agree to the Terms & Conditions and Privacy Policy",
            });
        }

        const baseUsername =
            (normalizedEmail.split("@")[0] || "user")
                .replace(/[^a-zA-Z0-9_]/g, "")
                .slice(0, 20) || "user";

        let userName = baseUsername;
        let count = 1;

        while (await Users.exists({ userName })) {
            userName = `${baseUsername}${count++}`;
        }

        authenticatedUser = await Users.create({
            name: name?.trim() || baseUsername,
            userName,
            email: normalizedEmail,
            password: null,
            googleId: uid,
            termsAccepted: true,
            termsAcceptedAt: new Date(),
            ...(picture ? { profileImage: picture } : {}),
        });
    }

    if (!authenticatedUser.isActive) {
        return res.status(403).json({
            success: false,
            message:
                "Your account is inactive. Please contact the administrator.",
        });
    }

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