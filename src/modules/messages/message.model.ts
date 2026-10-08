import { Schema, model, Types, type InferSchemaType } from "mongoose";

const messageSchema = new Schema({
    chatId: { type: Schema.Types.ObjectId, ref: "Chat", required: true, index: true },
    role: { type: String, enum: ["user", "assistant", "system", "tool"], required: true },
    content: { type: String, required: true },
    toolCallId: String,
    toolName: String,
}, { timestamps: true });

export type MessageRole = "user" | "assistant" | "system" | "tool";
export type IMessage = InferSchemaType<typeof messageSchema> & { _id: Types.ObjectId };
export const Message = model("Message", messageSchema);
