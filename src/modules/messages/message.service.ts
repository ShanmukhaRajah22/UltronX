import { Types } from "mongoose";
import { apiError } from "../../Utils/apiResponse.js";
import { runUltronXAgent } from "../../ai/agent.js";
import type { UltronXMessage } from "../../ai/model.js";
import { MessageRepository } from "./message.repo.js";
import { chatRepositary } from "../chat/chat.repo.js";
import { normalizeMessageContent } from "../../Utils/message-content.js";

export class MessageService {
    private messageRepo = new MessageRepository();
    private chatRepo = new chatRepositary();
    private async ownedChat(chatId: string, userId: string) {
        if (!Types.ObjectId.isValid(chatId)) throw apiError(400, "Invalid chat ID");
        const chat = await this.chatRepo.findByUserAndChatId({ chatId: new Types.ObjectId(chatId), userId: new Types.ObjectId(userId) });
        if (!chat) throw apiError(404, "Chat not found");
    }
    private async ownedMessage(messageId: string, userId: string) {
        const message = await this.messageRepo.findById(messageId);
        if (!message) throw apiError(404, "Message not found");
        await this.ownedChat(message.chatId.toString(), userId);
        return message;
    }
    private history(history: Array<{ role: string; content: string }>): UltronXMessage[] {
        return history.map((message) => ({ role: message.role === "assistant" ? "assistant" : message.role === "system" ? "system" : "user", content: normalizeMessageContent(message.content) }));
    }
    /**
     * Sends a message to an owned chat and persists the user and assistant messages.
     * @param data - Chat, user, and message content identifiers.
     * @returns The persisted user message and AI response message.
     */
    async sendMessage(data: { chatId: string; content: string; userId: string }) {
        if (!data.content?.trim()) throw apiError(400, "Message content is required");
        await this.ownedChat(data.chatId, data.userId);
        const history = await this.messageRepo.findByChatId(data.chatId);
        const userMessage = await this.messageRepo.create({ chatId: data.chatId, role: "user", content: normalizeMessageContent(data.content) });
        const response = await runUltronXAgent([...this.history(history), { role: "user", content: data.content.trim() }], { userId: data.userId, chatId: data.chatId });
        const aiMessage = await this.messageRepo.create({ chatId: data.chatId, role: "assistant", content: normalizeMessageContent(response) });
        return { userMessage, aiMessage };
    }
    /**
     * Retrieves all messages from a chat owned by the user.
     * @param chatId - Chat identifier.
     * @param userId - Authenticated user identifier.
     * @returns The chat's normalized messages in creation order.
     */
    async getMessages(chatId: string, userId: string) {
        await this.ownedChat(chatId, userId);
        const messages = await this.messageRepo.findByChatId(chatId);
        return messages.map((message) => ({ ...message, content: normalizeMessageContent(message.content) }));
    }
    /**
     * Retrieves one message after verifying its chat belongs to the user.
     * @param messageId - Message identifier.
     * @param userId - Authenticated user identifier.
     * @returns The normalized message.
     */
    async getMessage(messageId: string, userId: string) {
        const message = await this.ownedMessage(messageId, userId);
        return { ...message, content: normalizeMessageContent(message.content) };
    }
    /**
     * Updates message content after ownership validation.
     * @param messageId - Message identifier.
     * @param userId - Authenticated user identifier.
     * @param data - Optional replacement content.
     * @returns The updated normalized message.
     */
    async updateMessage(messageId: string, userId: string, data: { content?: string }) {
        await this.ownedMessage(messageId, userId);
        const updated = await this.messageRepo.updateById(messageId, {
            content: data.content === undefined ? undefined : normalizeMessageContent(data.content),
        });
        if (!updated) throw apiError(404, "Message not found");
        return { ...updated, content: normalizeMessageContent(updated.content) };
    }
    /**
     * Deletes a message after ownership validation.
     * @param messageId - Message identifier.
     * @param userId - Authenticated user identifier.
     * @returns A deletion confirmation.
     */
    async deleteMessage(messageId: string, userId: string) { await this.ownedMessage(messageId, userId); await this.messageRepo.deleteById(messageId); return { deleted: true }; }
    /**
     * Streams an AI response and persists the completed exchange.
     * @param data - Chat, user, and message content identifiers.
     * @param emit - Sends named SSE events to the connected client.
     * @param isConnected - Indicates whether the client remains connected.
     * @returns The persisted user and assistant messages.
     */
    async streamMessage(data: { chatId: string; content: string; userId: string }, emit: (event: string, payload: unknown) => void, isConnected: () => boolean) {
        if (!data.content?.trim()) throw apiError(400, "Message content is required");
        await this.ownedChat(data.chatId, data.userId);
        const history = await this.messageRepo.findByChatId(data.chatId);
        const userMessage = await this.messageRepo.create({ chatId: data.chatId, role: "user", content: normalizeMessageContent(data.content) });
        let fullContent = "";
        const response = await runUltronXAgent([...this.history(history), { role: "user", content: data.content.trim() }], { userId: data.userId, chatId: data.chatId }, {
            onToken: (token) => { if (isConnected()) { fullContent += token; emit("token", token); } },
            onToolStart: (name, input) => { if (isConnected()) emit("tool_start", { name, input }); },
            onToolResult: (name, result) => { if (isConnected()) emit("tool_result", { name, result }); },
        });
        if (!fullContent) fullContent = response;
        fullContent = normalizeMessageContent(fullContent);
        const aiMessage = await this.messageRepo.create({ chatId: data.chatId, role: "assistant", content: fullContent });
        if (isConnected()) emit("final", { messageId: aiMessage._id, content: fullContent });
        return { userMessage, aiMessage };
    }
}
export const messageService = new MessageService();
