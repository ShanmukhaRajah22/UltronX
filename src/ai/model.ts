import { z } from "zod";

export type MiraMessage = {
    role: "system" | "user" | "assistant" | "tool";
    content: string;
    tool_call_id?: string;
    tool_calls?: OpenRouterToolCall[];
};

export type OpenRouterToolCall = {
    id: string;
    type: "function";
    function: { name: string; arguments: string };
};

type ChatOptions = {
    tools?: unknown[];
    responseFormat?: unknown;
};

const responseSchema = z.object({
    choices: z.array(z.object({
        message: z.object({
            content: z.string().nullable().optional(),
            tool_calls: z.array(z.object({
                id: z.string(),
                type: z.literal("function"),
                function: z.object({ name: z.string(), arguments: z.string() }),
            })).optional(),
        }),
    })).min(1),
});

export async function openRouterChat(messages: MiraMessage[], options: ChatOptions = {}) {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) throw new Error("OPENROUTER_API_KEY is not configured");
    const model = process.env.OPENROUTER_MODEL || "openrouter/free";
    if (model !== "openrouter/free") {
        throw new Error("Mira only permits the free OpenRouter router: openrouter/free");
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "http://localhost:4000",
            "X-Title": "Mira",
        },
        body: JSON.stringify({
            model,
            messages,
            temperature: 0.7,
            ...(options.tools ? { tools: options.tools, tool_choice: "auto" } : {}),
            ...(options.responseFormat ? { response_format: options.responseFormat } : {}),
        }),
    });
    if (!response.ok) {
        const detail = await response.text();
        throw new Error(`OpenRouter request failed (${response.status}): ${detail.slice(0, 500)}`);
    }
    const parsed = responseSchema.parse(await response.json());
    return parsed.choices[0]!.message;
}

export async function structuredOpenRouter<T>(
    messages: MiraMessage[],
    name: string,
    schema: z.ZodType<T>,
): Promise<T | null> {
    try {
        const jsonSchema = z.toJSONSchema(schema);
        const result = await openRouterChat(messages, {
            responseFormat: { type: "json_schema", json_schema: { name, strict: true, schema: jsonSchema } },
        });
        return schema.parse(JSON.parse(result.content || ""));
    } catch (error) {
        console.warn("Structured OpenRouter output unavailable; falling back to text:", error);
        return null;
    }
}
