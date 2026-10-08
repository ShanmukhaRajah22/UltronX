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

router.get("/chat/:chatId", authenticate, getMessages);
router.get("/:messageId", authenticate, getMessage);
router.post("/", authenticate, rateLimit(Number(process.env.RATE_LIMIT_WINDOW_MS || 900000), Number(process.env.AI_RATE_LIMIT_MAX || 20)), sendMessage);
router.post("/stream", authenticate, rateLimit(Number(process.env.RATE_LIMIT_WINDOW_MS || 900000), Number(process.env.AI_RATE_LIMIT_MAX || 20)), streamMessage);
router.patch("/:messageId", authenticate, updateMessage);
router.delete("/:messageId", authenticate, deleteMessage);

export default router;