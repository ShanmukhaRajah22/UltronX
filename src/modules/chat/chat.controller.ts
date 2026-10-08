import type { Request, Response } from "express";
import { asyncHandler } from "../../Utils/async-handler.js";
import { apiSuccess } from "../../Utils/apiResponse.js";
import { chatService } from "./chat.service.js";

export const generateChat = asyncHandler(async (req: Request, res: Response) => {
    const content = req.body.content || req.body.message;
    return apiSuccess(res, await chatService.generateChat({ userId: req.user.userId, content }), "Chat title generated and saved successfully", 201);
});
export const listChats = asyncHandler(async (req: Request, res: Response) =>
    apiSuccess(res, await chatService.listChats(req.user.userId), "Chats fetched successfully"));
export const updateChat = asyncHandler(async (req: Request, res: Response) =>
    apiSuccess(res, await chatService.updateChat(req.params.chatId as string, req.user.userId, req.body), "Chat updated successfully"));
export const deleteChat = asyncHandler(async (req: Request, res: Response) =>
    apiSuccess(res, await chatService.deleteChat(req.params.chatId as string, req.user.userId), "Chat deleted successfully"));
