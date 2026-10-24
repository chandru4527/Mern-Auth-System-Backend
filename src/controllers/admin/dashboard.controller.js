import Users from "../../models/users.model.js";
import Banners from "../../models/banners.model.js";
import asyncHandler from "../../utils/asyncHandler.js";

export const getDashboardStats = asyncHandler(async (req, res) => {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);

    const [
        totalUsers,
        activeUsers,
        inactiveUsers,
        totalBanners,
        monthlyUserGrowth,
    ] = await Promise.all([
        Users.countDocuments({ role: "user" }),
        Users.countDocuments({ role: "user", isActive: true }),
        Users.countDocuments({ role: "user", isActive: false }),
        Banners.countDocuments(),
        Users.aggregate([
            {
                $match: {
                    role: "user",
                    createdAt: { $gte: sixMonthsAgo },
                },
            },
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" },
                    },
                    users: { $sum: 1 },
                },
            },
            {
                $sort: {
                    "_id.year": 1,
                    "_id.month": 1,
                },
            },
            {
                $project: {
                    _id: 0,
                    year: "$_id.year",
                    month: "$_id.month",
                    users: 1,
                },
            },
        ]),
    ]);

    const growthMap = new Map(
        monthlyUserGrowth.map(({ year, month, users }) => [
            `${year}-${month}`,
            users,
        ])
    );

    const monthlyUserData = Array.from({ length: 6 }, (_, index) => {
        const date = new Date(sixMonthsAgo);
        date.setMonth(sixMonthsAgo.getMonth() + index);

        const year = date.getFullYear();
        const month = date.getMonth() + 1;

        return {
            month: date.toLocaleString("en-US", { month: "short" }),
            users: growthMap.get(`${year}-${month}`) ?? 0,
        };
    });

    return res.status(200).json({
        success: true,
        message: "Dashboard statistics fetched successfully",
        results: {
            totalUsers,
            activeUsers,
            inactiveUsers,
            totalBanners,
            monthlyUserData,
        },
    });
});