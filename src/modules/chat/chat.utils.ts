import { structuredOpenRouter, type MiraMessage } from "../../ai/model.js";
import { z } from "zod";

export const createTitle = async (firstMessage: string) => {
    const schema = z.object({ title: z.string().min(1).max(100) });
    const messages: MiraMessage[] = [
        { role: "system", content: "Generate a concise, descriptive chat title. Return only the requested structured data." },
        { role: "user", content: firstMessage },
    ];
    const structured = await structuredOpenRouter(messages, "chat_title", schema);
    if (structured) return structured.title.trim();
    return firstMessage.trim().replace(/\s+/g, " ").slice(0, 80) || "New Chat";
};