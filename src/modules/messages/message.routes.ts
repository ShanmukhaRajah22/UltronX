import { Router } from "express";
import {
    getMessages,
    getMessage,
    updateMessage,
    deleteMessage,
    sendMessage,
    streamMessage,
} from "./message.controller.js";
import { authenticate } from "../../middleware/auth.js";
import { rateLimit } from "../../middleware/rate-limit.js";

const router = Router();

/** Lists messages for an owned chat. */
router.get("/chat/:chatId", authenticate, getMessages);
/** Retrieves one owned message. */
router.get("/:messageId", authenticate, getMessage);
/** Sends a non-streaming AI message. */
router.post("/", authenticate, rateLimit(Number(process.env.RATE_LIMIT_WINDOW_MS || 900000), Number(process.env.AI_RATE_LIMIT_MAX || 20)), sendMessage);
/** Sends an AI message over SSE. */
router.post("/stream", authenticate, rateLimit(Number(process.env.RATE_LIMIT_WINDOW_MS || 900000), Number(process.env.AI_RATE_LIMIT_MAX || 20)), streamMessage);
/** Updates an owned message. */
router.patch("/:messageId", authenticate, updateMessage);
/** Deletes an owned message. */
router.delete("/:messageId", authenticate, deleteMessage);

export default router;