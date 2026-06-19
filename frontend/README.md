# Frontend — Ollama APIs connected to Backend (Private AI Chat)

A fast, private AI chat workspace UI built on **TanStack Start**, talking to the Laravel backend's Ollama API endpoints. Access is gated via secure, token-based magic links rather than a traditional login form.

> 🧡 This frontend was scaffolded and built with **[Lovable](https://lovable.dev)** (see the `@lovable.dev/vite-tanstack-config` dev dependency in `package.json`).

---

## Tech Stack

| Component | Version |
|---|---|
| React | ^19.2.0 |
| TanStack Start | ^1.167.50 |
| TanStack Router | ^1.168.25 |
| TanStack Query | ^5.83.0 |
| Vite | ^7.3.1 |
| Tailwind CSS | ^4.2.1 |
| Radix UI | various (shadcn-style primitives) |
| Zod + React Hook Form | form validation |
| react-markdown + remark-gfm | chat message rendering |
| TypeScript | ^5.8.3 |

---

## Prerequisites

- Node.js (LTS recommended — v22+ to match the backend's documented environment)
- npm
- The Laravel backend running and reachable (see [backend/README.md](../backend/README.md))

---

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure the API base URL

Unlike a typical `.env`-driven setup, this project resolves its backend URL in code, in [`src/lib/api.ts`](./src/lib/api.ts):

```ts
export const API_BASE_URL =
  (typeof window !== "undefined" && (window as any).__API_BASE_URL__) ||
  "http://localhost:8000/api";
```

To point at a different backend (e.g. local development), either:
- Update the fallback string directly, **or**
- Inject `window.__API_BASE_URL__` before the app boots (e.g. via a small inline `<script>` in `index.html` or your hosting environment), which takes priority over the hardcoded fallback.

### 3. Run the dev server

```bash
npm run dev
```

### 4. Build for production

```bash
npm run build
```

### 5. Preview a production build

```bash
npm run preview
```

---

## Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Production build |
| `npm run build:dev` | Build in development mode |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |
| `npm run format` | Format all files with Prettier |

---

## Authentication: Magic Link Tokens

There's no login form. Instead, access is granted via a `token` query parameter appended to the URL (e.g. `https://app.example.com/?token=xyz123`).

Flow, handled in [`src/lib/api.ts`](./src/lib/api.ts) and consumed in [`src/routes/index.tsx`](./src/routes/index.tsx):

1. On load, `bootstrapTokenFromURL()` checks the URL for a `token` param.
2. If found, it's saved to `sessionStorage` under the key `your_token`, and stripped from the URL via `window.history.replaceState` (so it doesn't linger in browser history or get shared accidentally).
3. If no token is present (or already stored from a previous visit), `getToken()` reads it back from `sessionStorage`.
4. All authenticated API calls attach it as `Authorization: Bearer <token>` via `authHeaders()`.
5. If there's no valid token, the UI renders `<AccessDenied />` instead of the chat app — with a `onDevToken` callback for manually pasting a token during local development.

```tsx
// src/routes/index.tsx (simplified)
const t = bootstrapTokenFromURL();
if (!hasToken) return <AccessDenied onDevToken={acceptDevToken} />;
return <ChatApp />;
```

> Tokens live in `sessionStorage`, not `localStorage` — they're cleared when the browser tab closes. Use `clearToken()` to log out manually.

---

## API Layer (`src/lib/api.ts`)

This file is the single integration point between the UI and the backend. It currently ships with a **mock mode** that can fully drive the UI without a live backend — useful for frontend development in isolation.

```ts
export const USE_MOCK = false;
```

| Setting | Behavior |
|---|---|
| `USE_MOCK = true` | All API functions resolve against an in-memory/`localStorage`-backed mock store, with simulated network delay and canned assistant replies (`REPLY_BANK`) |
| `USE_MOCK = false` | All API functions hit the real backend at `API_BASE_URL` |

### Exposed functions

| Function | Backend Endpoint | Description |
|---|---|---|
| `getModels()` | `GET /models` | Fetch available Ollama models |
| `sendChat(req)` | `POST /chat` | Send a message, get an assistant reply |
| `listSessions()` | `GET /sessions` | List chat session metadata |
| `getSession(id)` | `GET /sessions/{id}` | Fetch full session detail (with messages) |
| `deleteSession(id)` | `DELETE /sessions/{id}` | Delete a session |

These map directly to the Laravel routes documented in [backend/README.md](../backend/README.md#api-routes).

### Key types

- `ModelInfo` — id, name, description, enabled flag, context window
- `ChatMessage` — role (`user` / `assistant`), content, timestamp, optional file attachments, token count
- `SessionMeta` / `SessionDetail` — session list item vs. full session with messages
- `ChatRequest` / `ChatResponse` — request/response shape for `/chat`

### Local storage keys used

| Key | Purpose |
|---|---|
| `your_token` | Auth token (sessionStorage) |
| `your_sessions_v1` | Mock session store (localStorage, mock mode only) |
| `your_active_session` | Currently active session ID |
| `your_active_model` | Currently selected model ID |

---

## Project Structure (relevant parts)

```
frontend/
├── src/
│   ├── lib/
│   │   └── api.ts          # API layer, auth token handling, types, mock store
│   ├── routes/
│   │   └── index.tsx        # Entry route — token gate → ChatApp
│   ├── components/
│   │   ├── AccessDenied.tsx
│   │   └── ChatApp.tsx
├── package.json
└── vite.config.ts
```

---

## Switching Off Mock Mode

When wiring up the real backend, double check:
1. `USE_MOCK` is `false` in `src/lib/api.ts`
2. `API_BASE_URL` points at your running Laravel instance's `/api` path
3. The backend's `verify.app.token` middleware (currently a pass-through stub — see [backend/README.md](../backend/README.md#authentication-middleware)) is configured to actually validate the Bearer token this app sends

---

## Related Docs

- [Setup Ollama README](../README.md) — Ollama / LM Studio / Qwen Code local AI stack setup
- [Backend README](../backend/README.md) — Laravel API setup
