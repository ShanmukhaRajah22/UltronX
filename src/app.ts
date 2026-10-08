import express from "express";
import helmet from "helmet";

import userRoutes from "./modules/users/user.routes.js";
import chatRoutes from "./modules/chat/chat.routes.js";
import messageRoutes from "./modules/messages/message.routes.js";
import { notFoundHandler } from "./middleware/not-found.js";
import { errorHandler } from "./middleware/error-handler.js";

import cookieParser from "cookie-parser";
import swaggerUi from "swagger-ui-express";
import { openApiDocument } from "./docs.js";
import { requestId } from "./middleware/request-id.js";
import { rateLimit } from "./middleware/rate-limit.js";

const app = express();
app.use(requestId);
app.use(express.json({ limit: "1mb" }));
app.use(helmet());

app.use(cookieParser());

app.use(express.urlencoded({ extended: true }));
app.use(rateLimit(Number(process.env.RATE_LIMIT_WINDOW_MS || 900000), Number(process.env.RATE_LIMIT_MAX || 100)));
app.use("/docs", swaggerUi.serve, swaggerUi.setup(openApiDocument));



/** Returns the liveness status of the API process. */
app.get("/health", (_req, res) => {
    res.status(200).json({
        success: true,
        message: "UltronX API is healthy",
    });
});

app.use("/api/v1/users", userRoutes);
app.use("/api/v1/chats", chatRoutes);
app.use("/api/v1/messages", messageRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;