import { z } from "zod";
import { MemoryModel } from "../modules/memory/memory.model.js";
import type { UltronXTool } from "./types.js";

const memorySchema = z.object({
    type: z.enum(["fact", "preference", "goal", "project", "instruction", "language", "interaction_style"]),
    content: z.string().min(1).max(1000),
    importance: z.number().min(0).max(1),
    confidence: z.number().min(0).max(1),
});

export const saveMemoryTool: UltronXTool<typeof memorySchema> = {
    name: "memory",
    description: "Save a stable, useful long-term fact, preference, goal, project, instruction, language, or interaction style about the user.",
    schema: memorySchema,
    async execute({ type, content, importance, confidence }, context) {
        const memory = await MemoryModel.create({
            userId: context.userId,
            chatId: context.chatId,
            type,
            content,
            importance,
            confidence,
        });
        return { id: memory._id.toString(), type, content, importance, confidence };
    },
};
