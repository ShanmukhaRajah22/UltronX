import { structuredOpenRouter, type UltronXMessage } from "../../ai/model.js";
import { z } from "zod";

/** Generates a concise chat title from the first user message. */
export const createTitle = async (firstMessage: string) => {
    const schema = z.object({ title: z.string().min(1).max(100) });
    const messages: UltronXMessage[] = [
        { role: "system", content: "Generate a concise, descriptive chat title. Return only the requested structured data." },
        { role: "user", content: firstMessage },
    ];
    const structured = await structuredOpenRouter(messages, "chat_title", schema);
    if (structured) return structured.title.trim();
    return firstMessage.trim().replace(/\s+/g, " ").slice(0, 80) || "New Chat";
};