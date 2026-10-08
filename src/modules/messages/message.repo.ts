import { Types } from "mongoose";
import { Message, type IMessage, type MessageRole } from "./message.model.js";

interface CreateMessageData {
    chatId: Types.ObjectId | string;
    role: MessageRole;
    content: string;
    toolCallId?: string;
    toolName?: string;
}

export class MessageRepository {
    /** Persists a message in a chat. */
    async create(data: CreateMessageData): Promise<IMessage> {
        return Message.create({
            chatId: data.chatId,
            role: data.role,
            content: data.content,
            toolCallId: data.toolCallId,
            toolName: data.toolName,
        });
    }

    /** Finds one message by its identifier. */
    async findById(
        messageId: string | Types.ObjectId
    ): Promise<IMessage | null> {
        return Message.findById(messageId);
    }

    /** Retrieves all messages for a chat in creation order. */
    async findByChatId(
        chatId: string | Types.ObjectId
    ): Promise<IMessage[]> {
        return Message.find({
            chatId,
        })
            .sort({ createdAt: 1 })
            .lean();
    }

    /** Retrieves a bounded recent message history in creation order. */
    async findRecentByChatId(
        chatId: string | Types.ObjectId,
        limit: number
    ): Promise<IMessage[]> {
        const messages = await Message.find({
            chatId,
        })
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean();

        return messages.reverse();
    }

    /** Counts messages belonging to a chat. */
    async countByChatId(
        chatId: string | Types.ObjectId
    ): Promise<number> {
        return Message.countDocuments({
            chatId,
        });
    }

    /** Deletes every message belonging to a chat. */
    async deleteByChatId(
        chatId: string | Types.ObjectId
    ): Promise<void> {
        await Message.deleteMany({
            chatId,
        });
    }

    /** Deletes one message by its identifier. */
    async deleteById(
        messageId: string | Types.ObjectId
    ): Promise<void> {
        await Message.findByIdAndDelete(messageId);
    }

    /** Updates the supplied fields on one message. */
    async updateById(
        messageId: string | Types.ObjectId,
        data: { content?: string }
    ): Promise<IMessage | null> {
        return Message.findByIdAndUpdate(
            messageId,
            { $set: data },
            { new: true }
        );
    }
}
