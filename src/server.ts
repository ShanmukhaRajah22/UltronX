import "dotenv/config";

import app from "./app.js";
import { connectToDb } from "./config/database.js";

const PORT = Number(process.env.PORT ?? 4000);

/** Connects to MongoDB, starts the HTTP server, and registers graceful shutdown. */
const startServer = async (): Promise<void> => {
    try {
        await connectToDb();

        const server = app.listen(PORT, () => {
            console.log(`UltronX API running on http://localhost:${PORT}`);
        });
        const shutdown = async () => {
            server.close();
            await import("mongoose").then(({ default: mongoose }) => mongoose.connection.close());
        };
        process.once("SIGTERM", shutdown);
        process.once("SIGINT", shutdown);
    } catch (error) {
        console.error("Failed to start UltronX:", error);
        process.exit(1);
    }
};

startServer();