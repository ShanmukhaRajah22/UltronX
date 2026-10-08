import type { CreateChatInput, UpdateChatInput } from "./chat.types.js";
import { ChatModel } from "./chat.model.js";
import { Types } from "mongoose";

export class chatRepositary {
    private chatModel = ChatModel
    /** Persists a new chat for a user. */
    createChat = async (input: CreateChatInput) => {
        const chat = await this.chatModel.create({
            userId: input.userId,
            title: input.title,
        })
        return chat
    }

    /** Retrieves chats owned by a user, newest first. */
    getUserChats = async (userId: string, options?: {
        cursor?: string;
        limit?: number;
    }) => {
        const chats = await this.chatModel.find({ userId }).sort({ updatedAt: -1 });
        return chats
    }

    /** Updates one chat only when its owner matches the user ID. */
    updateChat = async (
        chatId: string,
        userId: string,
        input: UpdateChatInput
    ) => {
        const chat = await this.chatModel.findOneAndUpdate({ _id: chatId, userId }, { $set: input }, { new: true });
        return chat
    }

    /** Deletes one chat only when its owner matches the user ID. */
    deleteChat = async (chatId: string, userId: string) => {
        return await this.chatModel.findOneAndDelete({ _id: chatId, userId });
    }

    /** Finds a chat scoped to both its chat ID and owning user ID. */
    findByUserAndChatId = async (data: {
        chatId: Types.ObjectId,
        userId: Types.ObjectId,
    }) => {
        return await this.chatModel.findOne({
            userId: data.userId,
            _id: data.chatId
        })
    }
}