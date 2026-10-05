import User from "../models/user.model.js";
import asyncHandler from "../../utils/asyncHandler.js";

const getProfileData = (user) => ({
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
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
});

// GET /api/users/profile
export const getProfile = asyncHandler(async (req, res) => {
    return res.status(200).json({
        success: true,
        data: {
            user: getProfileData(req.user),
        },
    });
});

// PUT /api/users/profile
export const updateProfile = asyncHandler(async (req, res) => {
    const { name, userName, email, mobile, address, dateOfBirth, profileImage } = req.body;

    const updates = {};

    if (name !== undefined) {
        if (typeof name !== "string" || name.trim().length < 2 || name.trim().length > 50) {
            return res.status(400).json({
                success: false,
                message: "Name must be between 2 and 50 characters",
            });
        }

        updates.name = name.trim();
    }

    if (userName !== undefined) {
        if (typeof userName !== "string" || !userName.trim()) {
            return res.status(400).json({
                success: false,
                message: "A valid username is required",
            });
        }

        const existingUser = await User.findOne({
            userName: userName.trim(),
            _id: { $ne: req.user._id },
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "Username is already taken",
            });
        }

        updates.userName = userName.trim();
    }

    if (email !== undefined) {
        if (typeof email !== "string" || !email.trim()) {
            return res.status(400).json({
                success: false,
                message: "A valid email is required",
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const existingUser = await User.findOne({
            email: normalizedEmail,
            _id: { $ne: req.user._id },
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "Email is already registered",
            });
        }

        updates.email = normalizedEmail;
    }

    if (mobile !== undefined) {
        if (typeof mobile !== "string") {
            return res.status(400).json({
                success: false,
                message: "Mobile must be a string",
            });
        }

        updates.mobile = mobile.trim();
    }

    if (address !== undefined) {
        if (typeof address !== "string") {
            return res.status(400).json({
                success: false,
                message: "Address must be a string",
            });
        }

        updates.address = address.trim();
    }

    if (dateOfBirth !== undefined) {
        if (dateOfBirth === null || dateOfBirth === "") {
            updates.dateOfBirth = null;
        } else {
            const date = new Date(dateOfBirth);

            if (Number.isNaN(date.getTime())) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid date of birth",
                });
            }

            updates.dateOfBirth = date;
        }
    }

    if (profileImage !== undefined) {
        if (typeof profileImage !== "string") {
            return res.status(400).json({
                success: false,
                message: "Profile image must be a URL string",
            });
        }

        updates.profileImage = profileImage.trim();
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        { $set: updates },
        {
            new: true,
            runValidators: true,
        }
    );

    return res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        data: {
            user: getProfileData(user),
        },
    });
});