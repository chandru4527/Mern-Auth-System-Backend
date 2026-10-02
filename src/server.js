import "dotenv/config";

import app from "./app.js";
import connectDB from "./config/db.js";

const PORT = process.env.PORT || 2003;
const Host = '0.0.0.0';

const startServer = async () => {
    try {
        await connectDB();

        app.listen(PORT, Host, () => {
            console.log(`Server running at http://localhost:${PORT}`);
            console.log(`Server running at http://${Host}:${PORT}`);
            console.log(`Environment: ${process.env.NODE_ENV}`);
        });
    } catch (error) {
        console.error("Failed to start server:", error.message);
        process.exit(1);
    }
};

startServer();