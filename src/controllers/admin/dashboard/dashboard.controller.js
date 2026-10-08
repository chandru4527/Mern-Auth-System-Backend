import Users from "../../../models/users.model.js";
import asyncHandler from "../../../utils/asyncHandler.js";

export const getDashboardStats = asyncHandler(async (req, res) => {
    const [
        totalUsers,
        activeUsers,
        inactiveUsers,
        admins,
    ] = await Promise.all([
        Users.countDocuments({ role: "user" }),
        Users.countDocuments({ role: "user", isActive: true }),
        Users.countDocuments({ role: "user", isActive: false }),
        Users.countDocuments({ role: "admin" }),
    ]);

    return res.status(200).json({
        success: true,
        message: "Dashboard statistics fetched successfully",
        results: {
            totalUsers,
            activeUsers,
            inactiveUsers,
            admins,
        },
    });
});