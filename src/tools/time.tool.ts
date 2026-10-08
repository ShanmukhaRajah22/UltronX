import { z } from "zod";
import type { UltronXTool } from "./types.js";

const timeSchema = z.object({
    timezone: z.string().describe("IANA timezone, e.g. Asia/Kolkata"),
});

export const timeTool: UltronXTool<typeof timeSchema> = {
    name: "time",
    description: "Get the current time in a specific IANA timezone.",
    schema: timeSchema,
    /** Returns the current time in the requested IANA timezone. */
    async execute({ timezone }) {
        const time = new Date().toLocaleString("en-US", {
            timeZone: timezone,
        });
        return `Current time in ${timezone}: ${time}`;
    },
};
