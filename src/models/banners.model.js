import mongoose from "mongoose";

const bannerSchema = new mongoose.Schema(
    {
        image: {
            type: String,
            required: [true, "Banner image is required"],
            trim: true,
        },
        badge: {
            type: String,
            required: [true, "Banner badge is required"],
            trim: true,
            maxlength: [50, "Badge cannot exceed 50 characters"],
        },
        title: {
            type: String,
            required: [true, "Banner title is required"],
            trim: true,
            maxlength: [100, "Title cannot exceed 100 characters"],
        },
        highlight: {
            type: String,
            required: [true, "Banner highlight is required"],
            trim: true,
            maxlength: [100, "Highlight cannot exceed 100 characters"],
        },
        description: {
            type: String,
            required: [true, "Banner description is required"],
            trim: true,
            maxlength: [300, "Description cannot exceed 300 characters"],
        },
        order: {
            type: Number,
            default: 0,
            min: [0, "Display order cannot be negative"],
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

const Banners = mongoose.model("Banner", bannerSchema);

export default Banners;