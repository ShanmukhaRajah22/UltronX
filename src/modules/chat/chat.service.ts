import { chatRepositary } from "./chat.repo.js";
import { createTitle } from "./chat.utils.js";

export class ChatService {
    private chatRepo = new chatRepositary();

    async generateChat(data: { userId: string; content: string }) {
        if (!data.userId || !data.content?.trim()) throw new Error("Message content is required");
        const title = await createTitle(data.content);

        const chat = await this.chatRepo.createChat({
            userId: data.userId,
            title: title,
        });

        return {
            chatId: chat._id,
            title: chat.title,
        };
    }

    async listChats(userId: string) {
        return this.chatRepo.getUserChats(userId);
    }

    async updateChat(chatId: string, userId: string, input: { title?: string; archived?: boolean }) {
        const chat = await this.chatRepo.updateChat(chatId, userId, input);
        if (!chat) throw new Error("Chat not found");
        return chat;
    }

    async deleteChat(chatId: string, userId: string) {
        const chat = await this.chatRepo.deleteChat(chatId, userId);
        if (!chat) throw new Error("Chat not found");
        return { deleted: true };
    }
}

export const chatService = new ChatService();