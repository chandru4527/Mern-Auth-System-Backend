import Banners from "../../models/banners.model.js";
import asyncHandler from "../../utils/asyncHandler.js";

// create banner
export const createBanner = asyncHandler(async (req, res) => {
    const { image, badge, title, highlight, description, order, isActive } = req.body;

    const banner = await Banners.create({
        image,
        badge,
        title,
        highlight,
        description,
        order,
        isActive,
    });

    res.status(201).json({
        success: true,
        message: "Banner created successfully",
        results: { banner },
    });
});

export const getBanners = asyncHandler(async (req, res) => {
    const { search, status } = req.query;

    const filter = {};

    if (search) {
        filter.$or = [
            { title: { $regex: search, $options: "i" } },
        ];
    }

    if (status === "active") filter.isActive = true;
    if (status === "inactive") filter.isActive = false;

    const banners = await Banners.find(filter).sort({ order: 1, createdAt: -1 });

    res.status(200).json({
        success: true,
        message: "Banners fetched successfully",
        results: {
            banners,
            total: banners.length,
        },
    });
});

export const getBannerById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const banner = await Banners.findById(id);

    if (!banner) {
        return res.status(404).json({
            success: false,
            message: "Banner not found",
        });
    }

    res.status(200).json({
        success: true,
        message: "Banner fetched successfully",
        results: { banner },
    });
});

export const updateBanner = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const banner = await Banners.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true,
    });

    if (!banner) {
        return res.status(404).json({
            success: false,
            message: "Banner not found",
        });
    }

    res.status(200).json({
        success: true,
        message: "Banner updated successfully",
        results: { banner },
    });
});

export const deleteBanner = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const banner = await Banners.findByIdAndDelete(id);

    if (!banner) {
        return res.status(404).json({
            success: false,
            message: "Banner not found",
        });
    }

    res.status(200).json({
        success: true,
        message: "Banner deleted successfully",
        results: { banner },
    });
});

export const getActiveBanners = asyncHandler(async (req, res) => {
    
    const banners = await Banners.find({ isActive: true })
        .sort({ order: 1, createdAt: -1 })
        .select("image badge title highlight description order");

    res.status(200).json({
        success: true,
        message: "Active banners fetched successfully",
        results: {
            banners,
            total: banners.length,
        },
    });
});