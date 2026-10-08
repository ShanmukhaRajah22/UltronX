import { z } from "zod";
import type { MiraTool } from "./types.js";

const readUrlSchema = z.object({ url: z.string().url() });
export const readUrl: MiraTool<typeof readUrlSchema> = {
    name: "webpage_reader",
    description: "Read the text content of a webpage URL.",
    schema: readUrlSchema,
    async execute({ url }) {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Webpage returned HTTP ${response.status}`);
        const html = await response.text();
        return html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, "")
            .replace(/<[^>]+>/g, " ")
            .replace(/\s+/g, " ")
            .trim()
            .slice(0, 12000);
    }
};