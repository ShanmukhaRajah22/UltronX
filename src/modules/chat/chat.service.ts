import { chatRepositary } from "./chat.repo.js";
import { createTitle } from "./chat.utils.js";

export class ChatService {
    private chatRepo = new chatRepositary();

    /**
     * Creates a user-owned chat with an AI-generated title.
     * @param data - Authenticated user ID and first message content.
     * @returns The new chat ID and generated title.
     */
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

    /**
     * Lists chats owned by a user.
     * @param userId - Authenticated user identifier.
     * @returns The user's chats.
     */
    async listChats(userId: string) {
        return this.chatRepo.getUserChats(userId);
    }

    /**
     * Updates a chat after restricting the query to its owner.
     * @param chatId - Chat identifier.
     * @param userId - Authenticated user identifier.
     * @param input - Mutable chat fields.
     * @returns The updated chat.
     */
    async updateChat(chatId: string, userId: string, input: { title?: string; archived?: boolean }) {
        const chat = await this.chatRepo.updateChat(chatId, userId, input);
        if (!chat) throw new Error("Chat not found");
        return chat;
    }

    /**
     * Deletes a chat owned by the user.
     * @param chatId - Chat identifier.
     * @param userId - Authenticated user identifier.
     * @returns A deletion confirmation.
     */
    async deleteChat(chatId: string, userId: string) {
        const chat = await this.chatRepo.deleteChat(chatId, userId);
        if (!chat) throw new Error("Chat not found");
        return { deleted: true };
    }
}

export const chatService = new ChatService();