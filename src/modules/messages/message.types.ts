import { z } from "zod";

export interface Message {
    chatId: string,
    content: string;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
}



export const memorySchema = z.object({
    type: z.enum([
        "fact",
        "preference",
        "goal",
        "project",
        "instruction",
        "language",
        "interaction_style",
    ]),

    content: z.string(),

    importance: z.number().min(0).max(1),

    confidence: z.number().min(0).max(1),
});

export const ultronxResponseSchema = z.object({
    response: z.string(),

    memory: memorySchema.nullable(),
});

export type UltronXResponse = z.infer<typeof ultronxResponseSchema>;