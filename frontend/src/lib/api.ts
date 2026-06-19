// API layer — mock now, swap API_BASE_URL to wire real backend.
export const API_BASE_URL =
  (typeof window !== "undefined" && (window as any).__API_BASE_URL__) ||
  "http://localhost:8000/api";

export const USE_MOCK = false;

const TOKEN_KEY = "aviner_token";

export function bootstrapTokenFromURL(): string | null {
  if (typeof window === "undefined") return null;
  const url = new URL(window.location.href);
  const t = url.searchParams.get("token");
  if (t) {
    sessionStorage.setItem(TOKEN_KEY, t);
    url.searchParams.delete("token");
    window.history.replaceState({}, "", url.toString());
  }
  return sessionStorage.getItem(TOKEN_KEY);
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(TOKEN_KEY);
}

export function clearToken() {
  sessionStorage.removeItem(TOKEN_KEY);
}

function authHeaders(): HeadersInit {
  const t = getToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
}

// ---------- Types ----------
export interface ModelInfo {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  context?: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  files?: { name: string; type: string }[];
  tokens?: number;
}

export interface SessionMeta {
  id: string;
  title: string;
  model: string;
  message_count: number;
  last_active: number;
}

export interface SessionDetail extends SessionMeta {
  messages: ChatMessage[];
}

export interface ChatRequest {
  model: string;
  sessionId: string;
  message: string;
  files?: { name: string; type: string; data: string }[];
}
export interface ChatResponse {
  success: boolean;
  sessionId: string;
  reply: string;
  tokens_used: number;
}

// ---------- Mock store ----------
const MOCK_MODELS: ModelInfo[] = [
  { id: "llama3", name: "Mock - LLaMA 3 8B", description: "API NOT CONNECTED - Meta's general-purpose 8B model. Balanced speed and quality.", enabled: true, context: "8K" },
  { id: "llama3-70b", name: "Mock - LLaMA 3 70B", description: "API NOT CONNECTED - Higher reasoning, slower throughput. Best for complex tasks.", enabled: true, context: "8K" },
  { id: "mistral", name: "Mock - Mistral 7B", description: "API NOT CONNECTED - Efficient and sharp. Strong at concise answers.", enabled: true, context: "8K" },
  { id: "codellama", name: "Mock - Code LLaMA 13B", description: "API NOT CONNECTED - Specialized for code generation and explanation.", enabled: true, context: "16K" },
  { id: "phi3", name: "Mock - Phi-3 Mini", description: "API NOT CONNECTED - Microsoft's compact reasoning model. Ultra-fast.", enabled: true, context: "4K" },
  { id: "gemma2", name: "Mock - Gemma 2 9B", description: "API NOT CONNECTED - Google's open lightweight model.", enabled: false, context: "8K" },
];

const SESSIONS_KEY = "aviner_sessions_v1";

function loadSessions(): Record<string, SessionDetail> {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(localStorage.getItem(SESSIONS_KEY) || "{}"); }
  catch { return {}; }
}
function saveSessions(s: Record<string, SessionDetail>) {
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(s));
}

export function uuid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0, v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function delay<T>(value: T, min = 800, max = 1500): Promise<T> {
  const ms = min + Math.random() * (max - min);
  return new Promise(res => setTimeout(() => res(value), ms));
}

const REPLY_BANK: { match: RegExp; replies: string[] }[] = [
  {
    match: /\b(hi|hello|hey|yo)\b/i,
    replies: [
      "Hey! 👋 What can I help you build today?",
      "Hello — happy to chat. What's on your mind?",
      "Hi there. Ask me anything.",
    ],
  },
  {
    match: /\bcode|function|bug|error|typescript|javascript|python\b/i,
    replies: [
      "Here's one way to approach it:\n\n```ts\nfunction sum(a: number, b: number) {\n  return a + b;\n}\n```\n\nLet me know if you want me to walk through edge cases.",
      "**Diagnosis:** likely a scoping issue.\n\n1. Check the closure boundary\n2. Verify async ordering\n3. Add a guard for `undefined`\n\nWant me to draft a fix?",
      "Try this pattern:\n\n```python\ndef debounce(fn, wait=0.2):\n    last = [0]\n    def wrapped(*a, **kw):\n        now = time.time()\n        if now - last[0] > wait:\n            last[0] = now\n            return fn(*a, **kw)\n    return wrapped\n```",
    ],
  },
  {
    match: /\b(explain|how|why|what)\b/i,
    replies: [
      "Great question. Here's a quick breakdown:\n\n- **Concept**: it's a model that maps inputs to outputs.\n- **Mechanism**: layered transforms, weighted attention.\n- **Use case**: anywhere sequence understanding matters.\n\nWant me to go deeper on any of these?",
      "Short version: it's about *signal preservation under transformation*. The longer story involves linear algebra, but for everyday use the intuition above is enough.",
    ],
  },
  {
    match: /.*/,
    replies: [
      "Got it. Here's my take:\n\n> A clear, useful response should be specific, not generic.\n\nGive me a bit more detail and I'll sharpen this further.",
      "Interesting. A few angles worth considering:\n\n1. The most direct interpretation\n2. A pragmatic next step\n3. What you'd verify first\n\nWhich one do you want me to expand?",
      "Working on it. The short answer: **yes, with caveats**. The long answer is in the trade-offs — say the word and I'll lay them out.",
    ],
  },
];

function mockReply(message: string, files?: { name: string }[]): string {
  if (files && files.length) {
    return `File received: **${files.map(f => f.name).join(", ")}**\n\nI'll keep this in context for your follow-up questions.`;
  }
  for (const b of REPLY_BANK) {
    if (b.match.test(message)) {
      return b.replies[Math.floor(Math.random() * b.replies.length)];
    }
  }
  return "Acknowledged.";
}

// ---------- API surface ----------
export async function getModels(): Promise<ModelInfo[]> {
  if (USE_MOCK) return delay(MOCK_MODELS, 200, 500);
  const r = await fetch(`${API_BASE_URL}/models`, { headers: authHeaders() });
  const j = await r.json();
  return j.data;
}

export async function sendChat(req: ChatRequest): Promise<ChatResponse> {
  if (USE_MOCK) {
    const sessions = loadSessions();
    const sessionId = req.sessionId || uuid();
    const existing = sessions[sessionId];
    const userMsg: ChatMessage = {
      id: uuid(),
      role: "user",
      content: req.message,
      timestamp: Date.now(),
      files: req.files?.map(f => ({ name: f.name, type: f.type })),
    };
    const reply = mockReply(req.message, req.files);
    const tokens = Math.floor(40 + Math.random() * 160);
    const asstMsg: ChatMessage = {
      id: uuid(),
      role: "assistant",
      content: reply,
      timestamp: Date.now() + 1,
      tokens,
    };
    const session: SessionDetail = existing
      ? {
          ...existing,
          model: req.model,
          message_count: existing.message_count + 2,
          last_active: Date.now(),
          messages: [...existing.messages, userMsg, asstMsg],
        }
      : {
          id: sessionId,
          title: req.message.slice(0, 60),
          model: req.model,
          message_count: 2,
          last_active: Date.now(),
          messages: [userMsg, asstMsg],
        };
    sessions[sessionId] = session;
    saveSessions(sessions);
    return delay({ success: true, sessionId, reply, tokens_used: tokens });
  }
  const r = await fetch(`${API_BASE_URL}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(req),
  });
  return r.json();
}

export async function listSessions(): Promise<SessionMeta[]> {
  if (USE_MOCK) {
    const s = loadSessions();
    const arr: SessionMeta[] = Object.values(s).map(({ messages, ...m }) => m);
    arr.sort((a, b) => b.last_active - a.last_active);
    return delay(arr, 100, 250);
  }
  const r = await fetch(`${API_BASE_URL}/sessions`, { headers: authHeaders() });
  const j = await r.json();
  return j.data;
}

export async function getSession(id: string): Promise<SessionDetail | null> {
  if (USE_MOCK) {
    const s = loadSessions();
    return delay(s[id] ?? null, 100, 250);
  }
  const r = await fetch(`${API_BASE_URL}/sessions/${id}`, { headers: authHeaders() });
  const j = await r.json();
  return j.data;
}

export async function deleteSession(id: string): Promise<void> {
  if (USE_MOCK) {
    const s = loadSessions();
    delete s[id];
    saveSessions(s);
    return delay(undefined, 80, 200);
  }
  await fetch(`${API_BASE_URL}/sessions/${id}`, { method: "DELETE", headers: authHeaders() });
}

export const ACTIVE_SESSION_KEY = "aviner_active_session";
export const ACTIVE_MODEL_KEY = "aviner_active_model";
