import mongoose from "mongoose";
import Users from "../../../models/users.model.js";
import asyncHandler from "../../../utils/asyncHandler.js";

// Get all users with search, status filter, and pagination
export const getAllUsers = asyncHandler(async (req, res) => {
    const { search = "", status = "", page = 1, limit = 10 } = req.query;

    const currentPage = Math.max(1, Number.parseInt(page, 10) || 1);
    const perPage = Math.min(100, Math.max(1, Number.parseInt(limit, 10) || 10));
    const skip = (currentPage - 1) * perPage;

    const filter = {
        role: "user",
    };

    if (search.trim()) {
        const escapedSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const searchRegex = new RegExp(escapedSearch, "i");

        filter.$or = [
            { name: searchRegex },
            { userName: searchRegex },
            { email: searchRegex },
            { mobile: searchRegex },
        ];
    }

    if (status === "active") {
        filter.isActive = true;
    } else if (status === "inactive") {
        filter.isActive = false;
    }

    const [users, totalUsers] = await Promise.all([
        Users.find(filter)
            .select("name userName email role isActive profileImage mobile address dateOfBirth createdAt updatedAt")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(perPage)
            .lean(),

        Users.countDocuments(filter),
    ]);

    res.status(200).json({
        success: true,
        message: "Users fetched successfully",
        results: {
            users,
            currentPage,
            limit: perPage,
            totalUsers,
            totalPages: Math.ceil(totalUsers / perPage),
            hasNextPage: currentPage * perPage < totalUsers,
            hasPrevPage: currentPage > 1,
        },
    });
});

// Get a single user by ID
export const getUserById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({
            success: false,
            message: "Invalid user ID",
        });
    }

    const user = await Users.findById(id)
        .select("name userName email role isActive profileImage mobile address dateOfBirth createdAt updatedAt")
        .lean();

    if (!user) {
        return res.status(404).json({
            success: false,
            message: "User not found",
        });
    }

    res.status(200).json({
        success: true,
        message: "User fetched successfully",
        results: { user },
    });
});

// Update user profile fields
export const updateUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const allowedFields = [
        "name",
        "userName",
        "email",
        "mobile",
        "address",
        "dateOfBirth",
        "profileImage",
        "isActive",
    ];

    if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({
            success: false,
            message: "Invalid user ID",
        });
    }

    const updates = {};

    for (const field of allowedFields) {
        if (Object.prototype.hasOwnProperty.call(req.body, field)) {
            updates[field] = req.body[field];
        }
    }

    if (Object.keys(updates).length === 0) {
        return res.status(400).json({
            success: false,
            message: "No valid fields provided for update",
        });
    }

    if (updates.isActive !== undefined && typeof updates.isActive !== "boolean") {
        return res.status(400).json({
            success: false,
            message: "isActive must be a boolean",
        });
    }

    const user = await Users.findByIdAndUpdate(
        id,
        { $set: updates },
        {
            new: true,
            runValidators: true,
        }
    ).select("name userName email role isActive profileImage mobile address dateOfBirth createdAt updatedAt");

    if (!user) {
        return res.status(404).json({
            success: false,
            message: "User not found",
        });
    }

    res.status(200).json({
        success: true,
        message: "User updated successfully",
        results: { user },
    });
});

// Delete a user permanently
export const deleteUser = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({
            success: false,
            message: "Invalid user ID",
        });
    }

    const user = await Users.findByIdAndDelete(id);

    if (!user) {
        return res.status(404).json({
            success: false,
            message: "User not found",
        });
    }

    res.status(200).json({
        success: true,
        message: "User deleted successfully",
    });
});