import { Schema, model, type InferSchemaType } from "mongoose";

const memorySchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        chatId: {
            type: Schema.Types.ObjectId,
            ref: "Chat",
            required: true,
            index: true,
        },

        content: {
            type: String,
            required: true,
            trim: true,
        },

        type: {
            type: String,
            enum: ["fact", "preference", "goal", "project", "instruction", "language", "interaction_style"],
            default: "fact",
            index: true,
        },

        importance: {
            type: Number,
            min: 0,
            max: 1,
            default: 0.5,
        },
        confidence: {
            type: Number,
            min: 0,
            max: 1,
            default: 0.8,
        },
    },
    {
        timestamps: true,
    }
);

export type Memory = InferSchemaType<typeof memorySchema>;

export const MemoryModel = model("Memory", memorySchema);