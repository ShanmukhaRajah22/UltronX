import { Types } from "mongoose";
import { apiError } from "../../Utils/apiResponse.js";
import { runUltronXAgent } from "../../ai/agent.js";
import type { UltronXMessage } from "../../ai/model.js";
import { MessageRepository } from "./message.repo.js";
import { chatRepositary } from "../chat/chat.repo.js";

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
        return history.map((message) => ({ role: message.role === "assistant" ? "assistant" : message.role === "system" ? "system" : "user", content: message.content }));
    }
    async sendMessage(data: { chatId: string; content: string; userId: string }) {
        if (!data.content?.trim()) throw apiError(400, "Message content is required");
        await this.ownedChat(data.chatId, data.userId);
        const history = await this.messageRepo.findByChatId(data.chatId);
        const userMessage = await this.messageRepo.create({ chatId: data.chatId, role: "user", content: data.content.trim() });
        const response = await runUltronXAgent([...this.history(history), { role: "user", content: data.content.trim() }], { userId: data.userId, chatId: data.chatId });
        const aiMessage = await this.messageRepo.create({ chatId: data.chatId, role: "assistant", content: response });
        return { userMessage, aiMessage };
    }
    async getMessages(chatId: string, userId: string) { await this.ownedChat(chatId, userId); return this.messageRepo.findByChatId(chatId); }
    async getMessage(messageId: string, userId: string) { return this.ownedMessage(messageId, userId); }
    async updateMessage(messageId: string, userId: string, data: { content?: string }) {
        await this.ownedMessage(messageId, userId);
        const updated = await this.messageRepo.updateById(messageId, data);
        if (!updated) throw apiError(404, "Message not found");
        return updated;
    }
    async deleteMessage(messageId: string, userId: string) { await this.ownedMessage(messageId, userId); await this.messageRepo.deleteById(messageId); return { deleted: true }; }
    async streamMessage(data: { chatId: string; content: string; userId: string }, emit: (event: string, payload: unknown) => void, isConnected: () => boolean) {
        if (!data.content?.trim()) throw apiError(400, "Message content is required");
        await this.ownedChat(data.chatId, data.userId);
        const history = await this.messageRepo.findByChatId(data.chatId);
        const userMessage = await this.messageRepo.create({ chatId: data.chatId, role: "user", content: data.content.trim() });
        let fullContent = "";
        const response = await runUltronXAgent([...this.history(history), { role: "user", content: data.content.trim() }], { userId: data.userId, chatId: data.chatId }, {
            onToken: (token) => { if (isConnected()) { fullContent += token; emit("token", token); } },
            onToolStart: (name, input) => { if (isConnected()) emit("tool_start", { name, input }); },
            onToolResult: (name, result) => { if (isConnected()) emit("tool_result", { name, result }); },
        });
        if (!fullContent) fullContent = response;
        const aiMessage = await this.messageRepo.create({ chatId: data.chatId, role: "assistant", content: fullContent });
        if (isConnected()) emit("final", { messageId: aiMessage._id, content: fullContent });
        return { userMessage, aiMessage };
    }
}
export const messageService = new MessageService();
