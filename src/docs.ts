export const openApiDocument = {
    openapi: "3.0.3",
    info: { title: "UltronX API", version: "1.0.0", description: "UltronX AI companion backend" },
    servers: [{ url: "/api/v1" }],
    components: {
        securitySchemes: { bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" } },
        schemas: {
            User: { type: "object", properties: { id: { type: "string" }, name: { type: "string" }, email: { type: "string", format: "email" } } },
            Chat: { type: "object", properties: { _id: { type: "string" }, title: { type: "string" }, userId: { type: "string" } } },
            Message: { type: "object", properties: { _id: { type: "string" }, chatId: { type: "string" }, role: { type: "string" }, content: { type: "string" } } },
        },
    },
    paths: {
        "/users/register": { post: { summary: "Register", requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["name", "email", "password"], properties: { name: { type: "string" }, email: { type: "string" }, password: { type: "string", minLength: 8 } } } } } }, responses: { "201": { description: "Created" }, "409": { description: "Conflict" } } } },
        "/users/login": { post: { summary: "Login", requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["email", "password"], properties: { email: { type: "string", format: "email" }, password: { type: "string" } } } } } }, responses: { "200": { description: "Authenticated" }, "401": { description: "Invalid credentials" } } } },
        "/users/me": { get: { summary: "Current user", security: [{ bearerAuth: [] }], responses: { "200": { description: "Profile" } } } },
        "/chats": { get: { summary: "List owned chats", security: [{ bearerAuth: [] }], responses: { "200": { description: "Chats" } } }, post: { summary: "Create chat", security: [{ bearerAuth: [] }], requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["content"], properties: { content: { type: "string", description: "The first message used to generate the chat title" } }, example: { content: "Help me plan a study schedule" } } } } }, responses: { "201": { description: "Created" }, "400": { description: "Message content is required" } } } },
        "/chats/{chatId}": { patch: { summary: "Update owned chat", security: [{ bearerAuth: [] }], parameters: [{ name: "chatId", in: "path", required: true, schema: { type: "string" } }], responses: { "200": { description: "Updated" }, "404": { description: "Not found" } } }, delete: { summary: "Delete owned chat", security: [{ bearerAuth: [] }], parameters: [{ name: "chatId", in: "path", required: true, schema: { type: "string" } },], responses: { "200": { description: "Deleted" } } } },
        "/messages": { post: { summary: "Send message", security: [{ bearerAuth: [] }], requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["chatId", "content"], properties: { chatId: { type: "string" }, content: { type: "string" } } } } } }, responses: { "201": { description: "AI response" }, "401": { description: "Unauthenticated" }, "404": { description: "Chat not owned by user" }, "429": { description: "Rate limited" } } } },
        "/messages/stream": { post: { summary: "Stream message over SSE", security: [{ bearerAuth: [] }], requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["chatId", "content"], properties: { chatId: { type: "string" }, content: { type: "string" } } } } } }, responses: { "200": { description: "SSE token/tool/final/done events", content: { "text/event-stream": {} } }, "429": { description: "Rate limited" } } } },
        "/messages/chat/{chatId}": { get: { summary: "List chat messages", security: [{ bearerAuth: [] }], parameters: [{ name: "chatId", in: "path", required: true, schema: { type: "string" } }], responses: { "200": { description: "Messages" }, "404": { description: "Chat not owned by user" } } } },
    },
};
