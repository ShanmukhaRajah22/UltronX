import { tavily } from "@tavily/core"
import { z } from "zod";
import type { UltronXTool } from "./types.js";

const searchSchema = z.object({ query: z.string().min(2) });
export const searchTool: UltronXTool<typeof searchSchema> = {
    name: "search",
    description: "Search the web for current information.",
    schema: searchSchema,
    /** Searches the web and returns a bounded set of result excerpts. */
    async execute({ query }) {
        const apiKey = process.env.TAVILY_API_KEY;
        if (!apiKey) throw new Error("TAVILY_API_KEY is not configured");
        const result = await tavily({ apiKey }).search(query, { maxResults: 4 });
        return result.results.map((item) => ({ title: item.title, url: item.url, content: item.content }));
    },
};
export default searchTool;