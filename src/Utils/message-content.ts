/** Converts escaped line breaks and tabs into displayable message formatting. */
export const normalizeMessageContent = (content: string): string =>
    content
        .replace(/\\r\\n/g, "\n")
        .replace(/\\n/g, "\n")
        .replace(/\\t/g, "\t")
        .trim();
