import { Router } from "express";
import { generateChat, listChats, updateChat, deleteChat } from "./chat.controller.js";
import { authenticate } from "../../middleware/auth.js";

const router = Router();

/** Creates a chat for the authenticated user. */
router.post(
    "/",
    authenticate,
    generateChat
);
/** Lists chats for the authenticated user. */
router.get("/", authenticate, listChats);
/** Updates an owned chat. */
router.patch("/:chatId", authenticate, updateChat);
/** Deletes an owned chat. */
router.delete("/:chatId", authenticate, deleteChat);

export default router;