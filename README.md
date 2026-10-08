# UltronX API

UltronX is a backend-only AI companion API built with TypeScript, Express, MongoDB, and OpenRouter. It provides JWT authentication, user-owned chats, AI-powered messages, streaming responses, web/search tools, and user-scoped memory.

## Features

- User registration and login
- JWT authentication through an HTTP-only cookie or Bearer token
- User-owned chats and messages
- Cross-user access protection
- AI responses through OpenRouter
- Streaming AI responses over Server-Sent Events (SSE)
- Tools for time, web search, webpage reading, and user-scoped memory
- Request IDs and rate limiting
- Swagger API documentation

## Requirements

- [Bun](https://bun.sh/)
- MongoDB
- OpenRouter API key
- Tavily API key

## Installation

Clone the repository and install dependencies:

```bash
bun install
```

Create an environment file:

```powershell
Copy-Item .env.example .env
```

Update `.env` with your local configuration:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/ultronx
PORT=4000
NODE_ENV=development

JWT_SECRET=replace_this_with_a_long_random_secret
JWT_EXPIRES_IN=7d

OPENROUTER_API_KEY=your_openrouter_api_key
OPENROUTER_MODEL=openrouter/free

TAVILY_API_KEY=your_tavily_api_key

RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
AI_RATE_LIMIT_MAX=20
```

Make sure MongoDB is running, then start the development server:

```bash
bun run dev
```

The API will be available at:

```text
http://localhost:4000
```

## API basics

### Base URL

All versioned API endpoints use:

```text
http://localhost:4000/api/v1
```

The health check and Swagger documentation are not under `/api/v1`:

```text
http://localhost:4000/health
http://localhost:4000/docs
```

### Request headers

For JSON requests, use:

```http
Content-Type: application/json
```

Protected endpoints require authentication. Send the token as:

```http
Authorization: Bearer <jwt-token>
```

The register and login endpoints also set an HTTP-only `accessToken` cookie. Postman can send this cookie automatically on later requests if cookie handling is enabled.

### Standard success response

Most successful JSON responses use this structure:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Success",
  "data": {}
}
```

### Standard error response

Errors use this structure:

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Error description",
  "requestId": "request-id"
}
```

In development, the response may also include a `stack` property.

## Endpoints

### Health

#### Check API health

```http
GET /health
```

Full URL:

```text
http://localhost:4000/health
```

Authentication: Not required

Request body: None

Example response:

```json
{
  "success": true,
  "message": "UltronX API is healthy"
}
```

---

## Users

### Register a user

```http
POST /api/v1/users/register
```

Authentication: Not required

Request body:

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

Validation:

- `name` is required and must contain 2–50 characters.
- `email` must be a valid email address.
- `password` is required and must contain 8–100 characters.

Example response (`201 Created`):

```json
{
  "success": true,
  "statusCode": 201,
  "message": "Account created successfully",
  "data": {
    "id": "user-id",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

Possible errors: `400` invalid input, `409` email already registered.

### Log in

```http
POST /api/v1/users/login
```

Authentication: Not required

Request body:

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

Example response:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "user-id",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "token": "jwt-token"
  }
}
```

The response also sets the HTTP-only `accessToken` cookie.

Possible errors: `400` invalid input, `401` invalid credentials.

### Get the current user's profile

```http
GET /api/v1/users/me
```

Authentication: Required

Request body: None

Example request header:

```http
Authorization: Bearer <jwt-token>
```

Possible errors: `401` missing, invalid, or expired token.

---

## Chats

### Create a chat

```http
POST /api/v1/chats
```

Authentication: Required

Request body:

```json
{
  "content": "Help me plan a study schedule"
}
```

The API also accepts `message` instead of `content`:

```json
{
  "message": "Help me plan a study schedule"
}
```

The first message is used to generate the chat title.

Example response (`201 Created`):

```json
{
  "success": true,
  "statusCode": 201,
  "message": "Chat title generated and saved successfully",
  "data": {
    "chatId": "66f123456789abcdef123456",
    "title": "Study Schedule Planning"
  }
}
```

Save the returned `chatId`; it is required for message requests.

Possible errors: `400` missing message content, `401` unauthenticated, `500` AI or configuration error.

### List the current user's chats

```http
GET /api/v1/chats
```

Authentication: Required

Request body: None

Returns only chats belonging to the authenticated user.

### Update a chat

```http
PATCH /api/v1/chats/:chatId
```

Example URL:

```text
http://localhost:4000/api/v1/chats/66f123456789abcdef123456
```

Authentication: Required

Request body:

```json
{
  "title": "My Study Chat",
  "archived": false
}
```

Both fields are optional, so this is also valid:

```json
{
  "archived": true
}
```

Possible errors: `401` unauthenticated, `404` chat not found.

### Delete a chat

```http
DELETE /api/v1/chats/:chatId
```

Authentication: Required

Request body: None

Example response:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Chat deleted successfully",
  "data": {
    "deleted": true
  }
}
```

Possible errors: `401` unauthenticated, `404` chat not found.

---

## Messages

### Send a message

```http
POST /api/v1/messages
```

Authentication: Required

Request body:

```json
{
  "chatId": "66f123456789abcdef123456",
  "content": "What should I study today?"
}
```

Example response (`201 Created`):

```json
{
  "success": true,
  "statusCode": 201,
  "message": "Message sent successfully",
  "data": {
    "userMessage": {
      "_id": "user-message-id",
      "chatId": "66f123456789abcdef123456",
      "role": "user",
      "content": "What should I study today?"
    },
    "aiMessage": {
      "_id": "assistant-message-id",
      "chatId": "66f123456789abcdef123456",
      "role": "assistant",
      "content": "Here is a suggested study plan..."
    }
  }
}
```

Possible errors: `400` missing or invalid input, `401` unauthenticated, `404` chat not found, `429` AI rate limit exceeded, `500` AI or configuration error.

### Stream a message using SSE

```http
POST /api/v1/messages/stream
```

Authentication: Required

Headers:

```http
Content-Type: application/json
Accept: text/event-stream
Authorization: Bearer <jwt-token>
```

Request body:

```json
{
  "chatId": "66f123456789abcdef123456",
  "content": "Explain quantum computing in simple terms"
}
```

This endpoint keeps the connection open and sends events as the AI works. Possible event types are:

```text
event: token
data: "Quantum"
```

```text
event: tool_start
data: {"name":"search","input":{}}
```

```text
event: tool_result
data: {"name":"search","result":{}}
```

```text
event: final
data: {"messageId":"assistant-message-id","content":"Complete response"}
```

```text
event: done
data: {"ok":true}
```

If the stream fails, it may send:

```text
event: error
data: {"message":"Streaming failed","requestId":"request-id"}
```

In Postman, keep the request open to view the streamed events.

Possible errors: `400` missing `chatId` or `content`, `401` unauthenticated, `404` chat not found, `429` AI rate limit exceeded.

### List messages in a chat

```http
GET /api/v1/messages/chat/:chatId
```

Example URL:

```text
http://localhost:4000/api/v1/messages/chat/66f123456789abcdef123456
```

Authentication: Required

Request body: None

Returns messages only when the chat belongs to the authenticated user.

Possible errors: `400` invalid chat ID, `401` unauthenticated, `404` chat not found.

### Get one message

```http
GET /api/v1/messages/:messageId
```

Example URL:

```text
http://localhost:4000/api/v1/messages/66f987654321abcdef654321
```

Authentication: Required

Request body: None

Possible errors: `401` unauthenticated, `404` message not found or not owned by the user.

### Update a message

```http
PATCH /api/v1/messages/:messageId
```

Authentication: Required

Request body:

```json
{
  "content": "Updated message content"
}
```

Possible errors: `401` unauthenticated, `404` message not found or not owned by the user.

### Delete a message

```http
DELETE /api/v1/messages/:messageId
```

Authentication: Required

Request body: None

Example response:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Message deleted successfully",
  "data": {
    "deleted": true
  }
}
```

Possible errors: `401` unauthenticated, `404` message not found or not owned by the user.

## Recommended Postman test order

1. `GET /health`
2. `POST /api/v1/users/register`
3. `POST /api/v1/users/login`
4. Copy the `data.token` value from the login response.
5. Add `Authorization: Bearer <token>` to protected requests.
6. `GET /api/v1/users/me`
7. `POST /api/v1/chats`
8. Save the returned `data.chatId`.
9. `GET /api/v1/chats`
10. `POST /api/v1/messages`
11. `GET /api/v1/messages/chat/:chatId`
12. `GET /api/v1/messages/:messageId`
13. `PATCH /api/v1/messages/:messageId`
14. `PATCH /api/v1/chats/:chatId`
15. `POST /api/v1/messages/stream`
16. Test the delete endpoints last.

## Rate limits

The default limits are:

- General API requests: 100 requests per 15 minutes
- AI message requests: 20 requests per 15 minutes

These values can be changed with `RATE_LIMIT_WINDOW_MS`, `RATE_LIMIT_MAX`, and `AI_RATE_LIMIT_MAX`.

## Swagger documentation

Interactive API documentation is available at:

```text
http://localhost:4000/docs
```

## Project structure

```text
src/
├── ai/             OpenRouter provider and agent loop
├── middleware/     Authentication, rate limiting, request IDs, and errors
├── modules/
│   ├── users/      Registration, login, and profiles
│   ├── chat/       Chat creation and management
│   └── messages/   Standard and streaming AI messages
├── tools/          Time, search, webpage, and memory tools
└── docs.ts        OpenAPI document
```

## Production notes

- Never commit `.env` or API keys.
- Use a strong, randomly generated `JWT_SECRET`.
- Run MongoDB with a persistent production configuration.
- Use HTTPS in production.
- The in-memory rate limiter is intended for a single backend instance.
