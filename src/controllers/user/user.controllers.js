import bcrypt from "bcrypt";
import Users from "../../models/users.model.js";
import asyncHandler from "../../utils/asyncHandler.js";

const sendUserResponse = (user) => ({
    id: user._id,
    name: user.name,
    userName: user.userName,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    profileImage: user.profileImage,
    coverImage: user.coverImage,
    mobile: user.mobile,
    address: user.address,
    dateOfBirth: user.dateOfBirth,
    termsAccepted: user.termsAccepted,
    termsAcceptedAt: user.termsAcceptedAt,
    createdAt: user.createdAt,
});

// patch /users/profile
export const updateProfile = asyncHandler(async (req, res) => {
    const { name, userName, email, mobile, address, dateOfBirth, profileImage, coverImage } = req.body;

    const updates = {};

    if (name !== undefined) {
        if (
            typeof name !== "string" ||
            name.trim().length < 2 ||
            name.trim().length > 50
        ) {
            return res.status(400).json({
                success: false,
                message: "Name must be between 2 and 50 characters",
            });
        }

        updates.name = name.trim();
    }

    if (userName !== undefined) {
        if (
            typeof userName !== "string" ||
            !/^[a-zA-Z0-9_]{3,20}$/.test(userName.trim())
        ) {
            return res.status(400).json({
                success: false,
                message: "Username must be 3–20 characters and contain only letters, numbers, and underscores",
            });
        }

        const normalizedUserName = userName.trim();

        const existingUser = await Users.findOne({
            userName: normalizedUserName,
            _id: { $ne: req.user._id },
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "Username is already taken",
            });
        }

        updates.userName = normalizedUserName;
    }

    if (email !== undefined) {
        if (
            typeof email !== "string" ||
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
        ) {
            return res.status(400).json({
                success: false,
                message: "A valid email is required",
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const existingUser = await Users.findOne({
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
        if (
            typeof mobile !== "string" ||
            (mobile.trim() && !/^[0-9]{10}$/.test(mobile.trim()))
        ) {
            return res.status(400).json({
                success: false,
                message: "Enter a valid 10-digit mobile number",
            });
        }

        updates.mobile = mobile.trim();
    }

    if (address !== undefined) {
        if (
            typeof address !== "string" ||
            address.trim().length > 100
        ) {
            return res.status(400).json({
                success: false,
                message: "Address cannot exceed 100 characters",
            });
        }

        updates.address = address.trim();
    }

    if (dateOfBirth !== undefined) {
        if (dateOfBirth === null || dateOfBirth === "") {
            updates.dateOfBirth = null;
        } else {
            const date = new Date(dateOfBirth);
            const today = new Date().toISOString().slice(0, 10);

            if (
                Number.isNaN(date.getTime()) ||
                date.toISOString().slice(0, 10) !== dateOfBirth ||
                dateOfBirth >= today
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Enter a valid date of birth in the past",
                });
            }

            updates.dateOfBirth = date;
        }
    }

    if (profileImage !== undefined) {
        if (
            typeof profileImage !== "string" ||
            !profileImage.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: "A valid profile image URL is required",
            });
        }

        try {
            const imageUrl = new URL(profileImage.trim());

            if (!["http:", "https:"].includes(imageUrl.protocol)) {
                throw new Error("Invalid image URL");
            }

            updates.profileImage = imageUrl.toString();
        } catch {
            return res.status(400).json({
                success: false,
                message: "Profile image must be a valid URL",
            });
        }
    }

    if (coverImage !== undefined) {
        if (typeof coverImage !== "string" || !coverImage.trim()) {
            return res.status(400).json({
                success: false,
                message: "A valid cover image URL is required",
            });
        }

        try {
            const imageUrl = new URL(coverImage.trim());

            if (!["http:", "https:"].includes(imageUrl.protocol)) {
                throw new Error("Invalid cover image URL");
            }

            updates.coverImage = imageUrl.toString();
        } catch {
            return res.status(400).json({
                success: false,
                message: "Cover image must be a valid URL",
            });
        }
    }

    if (Object.keys(updates).length === 0) {
        return res.status(400).json({
            success: false,
            message: "No profile information provided to update",
        });
    }

    const user = await Users.findByIdAndUpdate(
        req.user._id,
        { $set: updates },
        {
            returnDocument: "after",
            runValidators: true,
        }
    );

    if (!user) {
        return res.status(404).json({
            success: false,
            message: "User not found",
        });
    }

    return res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        data: {
            user: sendUserResponse(user),
        },
    });
});

// patch /user/password-change
export const changePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
        return res.status(400).json({
            success: false,
            message: "All password fields are required",
        });
    }

    if (typeof currentPassword !== "string" || typeof newPassword !== "string" || typeof confirmPassword !== "string") {
        return res.status(400).json({
            success: false,
            message: "Password fields must be strings",
        });
    }

    if (newPassword.length < 8 || newPassword.length > 128) {
        return res.status(400).json({
            success: false,
            message: "New password must be between 8 and 128 characters",
        });
    }

    if (newPassword !== confirmPassword) {
        return res.status(400).json({
            success: false,
            message: "New password and confirm password do not match",
        });
    }

    if (currentPassword === newPassword) {
        return res.status(400).json({
            success: false,
            message: "New password must be different from the current password",
        });
    }

    const user = await Users.findById(req.user._id).select("+password");

    if (!user) {
        return res.status(404).json({
            success: false,
            message: "User not found",
        });
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

    if (!isPasswordValid) {
        return res.status(400).json({
            success: false,
            message: "Current password is incorrect",
        });
    }

    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();

    return res.status(200).json({
        success: true,
        message: "Password changed successfully!",
    });
});