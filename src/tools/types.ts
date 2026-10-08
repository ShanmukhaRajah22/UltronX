import type { z } from "zod";

export interface UltronXTool<TInput extends z.ZodTypeAny = z.ZodTypeAny> {
    name: string;
    description: string;
    schema: TInput;
    execute(input: z.infer<TInput>, context: { userId: string; chatId: string }): Promise<unknown>;
}