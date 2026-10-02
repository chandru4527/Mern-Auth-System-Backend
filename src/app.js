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

// Request parsers
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(cookieParser());

// API routes
app.use("/api", indexRoutes);

// Error handling (must be last)
app.use(notFound);
app.use(errorHandler);

export default app;