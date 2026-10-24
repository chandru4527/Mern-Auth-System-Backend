import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import indexRoutes from "./routes/index.routes.js";

import { errorHandler, notFound } from "./middleware/error.middleware.js";

const app = express();

app.disable("x-powered-by");

// CORS configuration
app.use(
    cors({
        origin: process.env.CLIENT_URL,
        credentials: true,
    })
);

// app.use(
//     cors({
//         origin: [
//             "http://localhost:2705",
//             "http://127.0.0.1:2705",
//             "http://10.24.156.203:2705"
//         ],
//         credentials: true,
//         methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
//         allowedHeaders: ["Content-Type", "Authorization"]
//     })
// );

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(cookieParser());

// API routes
app.use("/ck1", indexRoutes);

// Error handling (must be last)
app.use(notFound);
app.use(errorHandler);

export default app;