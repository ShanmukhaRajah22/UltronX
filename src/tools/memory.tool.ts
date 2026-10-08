import { z } from "zod";
import { MemoryModel } from "../modules/memory/memory.model.js";
import type { UltronXTool } from "./types.js";

const memorySchema = z.object({
    type: z.enum(["fact", "preference", "goal", "project", "instruction", "language", "interaction_style"]),
    content: z.string().min(1).max(1000),
    importance: z.number().min(0).max(1),
    confidence: z.number().min(0).max(1),
});

/**
 * Retrieves the most relevant memories saved for one user.
 * @param userId - ID of the user whose memories should be loaded.
 * @returns The user's memories ordered by importance, confidence, and recency.
 */
export async function getRelevantMemories(userId: string) {
    return MemoryModel.find({ userId })
        .sort({ importance: -1, confidence: -1, updatedAt: -1 })
        .limit(20)
        .lean();
}

export const saveMemoryTool: UltronXTool<typeof memorySchema> = {
    name: "memory",
    description: "Save a stable, useful long-term fact, preference, goal, project, instruction, language, or interaction style about the user.",
    schema: memorySchema,
    /**
     * Saves a validated long-term memory scoped to the current user.
     * @param input - Memory type, content, importance, and confidence.
     * @param context - Authenticated user and current chat identifiers.
     * @returns The saved memory's identifier and public fields.
     */
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
