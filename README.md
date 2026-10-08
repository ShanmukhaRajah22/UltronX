# UltronX

UltronX is a backend-only AI companion API built with TypeScript, Express, MongoDB, and OpenRouter's free model router.

## Features

- JWT authentication with cookie and Bearer token support
- User-owned chats and messages with cross-user access protection
- First-principles AI agent loop with a five-tool iteration limit
- Free OpenRouter integration using `openrouter/free`
- Tools for time, web search, webpage reading, and user-scoped memory
- SSE message streaming with tool and completion events
- Zod validation and structured chat-title generation
- Request IDs, rate limiting, graceful shutdown, and Swagger UI

## Requirements

- Bun
- MongoDB running locally
- OpenRouter API key
- Tavily API key for search

## Setup

```bash
bun install
Copy-Item .env.example .env
```

Update `.env` with your credentials, then start the API:

```bash
bun run dev
```

The server runs at `http://localhost:4000`.

## API

- Health check: `GET /health`
- Swagger documentation: `GET /docs`
- Authentication: `/api/v1/users`
- Chats: `/api/v1/chats`
- Messages: `/api/v1/messages`

Use the Swagger page to register, authenticate, create a chat, and send messages without a frontend.

## Environment

See [.env.example](./.env.example) for the complete configuration. AI requests use:

```env
OPENROUTER_MODEL=openrouter/free
```

## Project structure

```text
src/
├── ai/             OpenRouter provider and agent loop
├── middleware/     Auth, rate limiting, request IDs, and errors
├── modules/        Users, chats, messages, and memory
├── tools/          Agent tools
└── docs.ts         OpenAPI definition
```

## Production notes

- Keep secrets only in environment variables.
- Use a strong `JWT_SECRET`.
- Run MongoDB with a persistent production configuration.
- The in-memory rate limiter is intended for a single backend instance.
