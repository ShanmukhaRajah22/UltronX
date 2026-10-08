import { Router } from "express";
import { generateChat, listChats, updateChat, deleteChat } from "./chat.controller.js";
import { authenticate } from "../../middleware/auth.js";

const router = Router();

router.post(
    "/",
    authenticate,
    generateChat
);
router.get("/", authenticate, listChats);
router.patch("/:chatId", authenticate, updateChat);
router.delete("/:chatId", authenticate, deleteChat);

export default router;