import type { Request, Response } from "express";
import { asyncHandler } from "../../Utils/async-handler.js";
import { apiSuccess, apiError } from "../../Utils/apiResponse.js";
import { messageService } from "./message.service.js";

export const getMessages = asyncHandler(async (req: Request, res: Response) =>
    apiSuccess(res, await messageService.getMessages(req.params.chatId as string, req.user.userId), "Messages fetched successfully"));
export const getMessage = asyncHandler(async (req: Request, res: Response) =>
    apiSuccess(res, await messageService.getMessage(req.params.messageId as string, req.user.userId), "Message fetched successfully"));
export const updateMessage = asyncHandler(async (req: Request, res: Response) =>
    apiSuccess(res, await messageService.updateMessage(req.params.messageId as string, req.user.userId, { content: req.body.content }), "Message updated successfully"));
export const deleteMessage = asyncHandler(async (req: Request, res: Response) =>
    apiSuccess(res, await messageService.deleteMessage(req.params.messageId as string, req.user.userId), "Message deleted successfully"));
export const sendMessage = asyncHandler(async (req: Request, res: Response) =>
    apiSuccess(res, await messageService.sendMessage({ chatId: req.body.chatId, content: req.body.content, userId: req.user.userId }), "Message sent successfully", 201));

export const streamMessage = asyncHandler(async (req: Request, res: Response) => {
    const { chatId, content } = req.body;
    if (!chatId || !content) throw apiError(400, "Chat ID and content are required");
    let connected = true;
    req.on("close", () => { connected = false; });
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();
    const emit = (event: string, payload: unknown) => {
        if (connected && !res.writableEnded) res.write(`event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`);
    };
    try {
        await messageService.streamMessage({ chatId, content, userId: req.user.userId }, emit, () => connected);
        emit("done", { ok: true });
    } catch (error) {
        if (connected) emit("error", { message: error instanceof Error ? error.message : "Streaming failed", requestId: req.requestId });
    } finally {
        if (!res.writableEnded) res.end();
    }
});
