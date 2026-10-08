import type { CreateChatInput, UpdateChatInput } from "./chat.types.js";
import { ChatModel } from "./chat.model.js";
import { Types } from "mongoose";

export class chatRepositary {
    private chatModel = ChatModel
    createChat = async (input: CreateChatInput) => {
        const chat = await this.chatModel.create({
            userId: input.userId,
            title: input.title,
        })
        return chat
    }

    getUserChats = async (userId: string, options?: {
        cursor?: string;
        limit?: number;
    }) => {
        const chats = await this.chatModel.find({ userId }).sort({ updatedAt: -1 });
        return chats
    }

    updateChat = async (
        chatId: string,
        userId: string,
        input: UpdateChatInput
    ) => {
        const chat = await this.chatModel.findOneAndUpdate({ _id: chatId, userId }, { $set: input }, { new: true });
        return chat
    }

    deleteChat = async (chatId: string, userId: string) => {
        return await this.chatModel.findOneAndDelete({ _id: chatId, userId });
    }

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