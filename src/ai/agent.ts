import { z } from "zod";
import { openRouterChat, type UltronXMessage } from "./model.js";
import { readUrl } from "../tools/WebPageReader.tool.js";
import { saveMemoryTool } from "../tools/memory.tool.js";
import { searchTool } from "../tools/search.tool.js";
import { timeTool } from "../tools/time.tool.js";
import type { UltronXTool } from "../tools/types.js";
import { normalizeMessageContent } from "../Utils/message-content.js";
import { getRelevantMemories } from "../tools/memory.tool.js";

const tools: UltronXTool[] = [timeTool, searchTool, readUrl, saveMemoryTool];
const toolDefinitions = tools.map((tool) => ({
    type: "function",
    function: { name: tool.name, description: tool.description, parameters: z.toJSONSchema(tool.schema) },
}));
const systemPrompt = "You are UltronX, a concise helpful AI companion. Use tools only when useful. Save only stable, useful user memories.";

export type AgentCallbacks = { onToken?: (token: string) => void; onToolStart?: (name: string, input: unknown) => void; onToolResult?: (name: string, result: unknown) => void };

/**
 * Runs the UltronX agent with conversation history, user memory, and tools.
 * @param history - Previous messages for the current chat.
 * @param context - Authenticated user and current chat identifiers.
 * @param callbacks - Optional callbacks for streaming agent events.
 * @returns The assistant's final response text.
 */
export async function runUltronXAgent(history: UltronXMessage[], context: { userId: string; chatId: string }, callbacks: AgentCallbacks = {}) {
    const memories = await getRelevantMemories(context.userId);
    const memoryContext = memories.length
        ? memories.map((memory) => `- [${memory.type}] ${memory.content}`).join("\n")
        : "No stored memories for this user.";
    const messages: UltronXMessage[] = [
        { role: "system", content: systemPrompt },
        { role: "system", content: `User Memory:\n${memoryContext}` },
        ...history,
    ];
    for (let iteration = 0; iteration < 5; iteration += 1) {
        const response = await openRouterChat(messages, { tools: toolDefinitions });
        const content = normalizeMessageContent(response.content || "");
        if (content) callbacks.onToken?.(content);
        if (!response.tool_calls?.length) return content;
        messages.push({ role: "assistant", content, tool_calls: response.tool_calls });
        for (const call of response.tool_calls) {
            const tool = tools.find((candidate) => candidate.name === call.function.name);
            if (!tool) throw new Error(`Unknown tool requested: ${call.function.name}`);
            const input = tool.schema.parse(JSON.parse(call.function.arguments));
            callbacks.onToolStart?.(tool.name, input);
            const result = await tool.execute(input, context);
            callbacks.onToolResult?.(tool.name, result);
            messages.push({ role: "tool", tool_call_id: call.id, content: JSON.stringify(result) });
        }
    }
    throw new Error("AI tool iteration limit exceeded");
}
