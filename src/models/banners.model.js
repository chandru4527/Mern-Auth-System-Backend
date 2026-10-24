import mongoose from "mongoose";

const bannerSchema = new mongoose.Schema(
    {
        image: {
            type: String,
            required: true,
            trim: true,
        },
        badge: {
            type: String,
            required: true,
            trim: true,
        },
        title: {
            type: String,
            required: true,
            trim: true,
        },
        highlight: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            required: true,
            trim: true,
        },
        order: {
            type: Number,
            default: 0,
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