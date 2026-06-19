import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { useState, useMemo, useRef, useEffect } from "react";
import { ShieldAlert, Mail, KeyRound, X, Plus, Cpu, Search, MessageSquare, Trash2, Sun, Moon, Sparkles, Check, Paperclip, ArrowUp, Image, FileText, User, Bot, Menu, Hash } from "lucide-react";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
const API_BASE_URL = typeof window !== "undefined" && window.__API_BASE_URL__ || "http://localhost:8001/api";
const TOKEN_KEY = "aviner_token";
function bootstrapTokenFromURL() {
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
function getToken() {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(TOKEN_KEY);
}
function authHeaders() {
  const t = getToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
}
function uuid() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0, v = c === "x" ? r : r & 3 | 8;
    return v.toString(16);
  });
}
async function getModels() {
  const r = await fetch(`${API_BASE_URL}/models`, { headers: authHeaders() });
  const j = await r.json();
  return j.data;
}
async function sendChat(req) {
  const r = await fetch(`${API_BASE_URL}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(req)
  });
  return r.json();
}
async function listSessions() {
  const r = await fetch(`${API_BASE_URL}/sessions`, { headers: authHeaders() });
  const j = await r.json();
  return j.data;
}
async function getSession(id) {
  const r = await fetch(`${API_BASE_URL}/sessions/${id}`, { headers: authHeaders() });
  const j = await r.json();
  return j.data;
}
async function deleteSession(id) {
  await fetch(`${API_BASE_URL}/sessions/${id}`, { method: "DELETE", headers: authHeaders() });
}
const ACTIVE_SESSION_KEY = "aviner_active_session";
const ACTIVE_MODEL_KEY = "aviner_active_model";
const DEV_TOKEN = "devtest27901";
function AccessDenied({ onDevToken }) {
  const [val, setVal] = useState("");
  const [err, setErr] = useState(null);
  function submit(e) {
    e.preventDefault();
    if (val.trim() === DEV_TOKEN) {
      onDevToken(val.trim());
    } else {
      setErr("Invalid dev token");
    }
  }
  return /* @__PURE__ */ jsx(
    "div",
    {
      className: "flex min-h-screen items-center justify-center p-6",
      style: { background: "var(--gradient-hero)" },
      children: /* @__PURE__ */ jsxs(
        "div",
        {
          className: "max-w-md w-full rounded-2xl border border-border bg-card p-8 text-center",
          style: { boxShadow: "var(--shadow-card)" },
          children: [
            /* @__PURE__ */ jsx(
              "div",
              {
                className: "mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-xl",
                style: { background: "var(--gradient-primary)", boxShadow: "var(--shadow-glow)" },
                children: /* @__PURE__ */ jsx(ShieldAlert, { className: "h-7 w-7", style: { color: "oklch(0.15 0.03 200)" } })
              }
            ),
            /* @__PURE__ */ jsx("h1", { className: "text-xl font-semibold tracking-tight text-foreground", children: "Access Denied" }),
            /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "We couldn't find an access token. Please open AvinerLLM from the magic link we sent to your email." }),
            /* @__PURE__ */ jsxs("div", { className: "mt-5 flex items-center justify-center gap-2 text-xs text-muted-foreground", children: [
              /* @__PURE__ */ jsx(Mail, { className: "h-3.5 w-3.5" }),
              /* @__PURE__ */ jsx("span", { children: "Check your inbox for your access link" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "my-6 flex items-center gap-3", children: [
              /* @__PURE__ */ jsx("div", { className: "h-px flex-1 bg-border" }),
              /* @__PURE__ */ jsx("span", { className: "text-[10px] uppercase tracking-wider text-muted-foreground", children: "Dev access" }),
              /* @__PURE__ */ jsx("div", { className: "h-px flex-1 bg-border" })
            ] }),
            /* @__PURE__ */ jsxs("form", { onSubmit: submit, className: "space-y-2 text-left", children: [
              /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-1.5 text-xs text-muted-foreground", children: [
                /* @__PURE__ */ jsx(KeyRound, { className: "h-3 w-3" }),
                " Dev token"
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    value: val,
                    onChange: (e) => {
                      setVal(e.target.value);
                      setErr(null);
                    },
                    placeholder: "Enter dev token",
                    className: "flex-1 rounded-md border border-border bg-input/40 px-3 py-2 text-sm outline-none focus:border-primary"
                  }
                ),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    type: "submit",
                    className: "rounded-md px-4 py-2 text-sm font-medium",
                    style: {
                      background: "var(--gradient-primary)",
                      color: "oklch(0.15 0.03 200)",
                      boxShadow: "var(--shadow-glow)"
                    },
                    children: "Enter"
                  }
                )
              ] }),
              err && /* @__PURE__ */ jsx("p", { className: "text-xs text-destructive", children: err })
            ] })
          ]
        }
      )
    }
  );
}
function timeAgo(ts) {
  const s = Math.floor((Date.now() - ts) / 1e3);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}
function SessionsSidebar({
  activeSessionId,
  activeModelName,
  onSelectSession,
  onNewChat,
  onChangeModel,
  onClose,
  theme,
  onToggleTheme
}) {
  const [q, setQ] = useState("");
  const qc = useQueryClient();
  const { data: sessions = [] } = useQuery({
    queryKey: ["sessions"],
    queryFn: listSessions,
    refetchOnWindowFocus: false
  });
  const filtered = useMemo(() => {
    if (!q.trim()) return sessions;
    const needle = q.toLowerCase();
    return sessions.filter((s) => s.title.toLowerCase().includes(needle));
  }, [sessions, q]);
  const del = useMutation({
    mutationFn: deleteSession,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["sessions"] })
  });
  return /* @__PURE__ */ jsxs("aside", { className: "flex h-full w-full flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between px-4 py-3.5", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(
          "div",
          {
            className: "flex h-7 w-7 items-center justify-center rounded-md",
            style: { background: "var(--gradient-primary)" },
            children: /* @__PURE__ */ jsx("span", { className: "text-[11px] font-bold", style: { color: "oklch(0.15 0.03 200)" }, children: "A" })
          }
        ),
        /* @__PURE__ */ jsx("span", { className: "font-semibold tracking-tight", children: "AvinerLLM" })
      ] }),
      onClose && /* @__PURE__ */ jsx("button", { onClick: onClose, className: "md:hidden p-1 rounded hover:bg-sidebar-accent", children: /* @__PURE__ */ jsx(X, { className: "h-4 w-4" }) })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "px-3 pb-3", children: /* @__PURE__ */ jsxs(
      "button",
      {
        onClick: onNewChat,
        className: "w-full inline-flex items-center justify-center gap-2 rounded-lg border border-sidebar-border bg-sidebar-accent/40 hover:bg-sidebar-accent px-3 py-2 text-sm font-medium transition-colors",
        children: [
          /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4" }),
          "New chat"
        ]
      }
    ) }),
    /* @__PURE__ */ jsx("div", { className: "px-3 pb-2", children: /* @__PURE__ */ jsxs(
      "button",
      {
        onClick: onChangeModel,
        className: "w-full flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors",
        children: [
          /* @__PURE__ */ jsx(Cpu, { className: "h-3.5 w-3.5 text-primary" }),
          /* @__PURE__ */ jsx("span", { className: "truncate", children: activeModelName }),
          /* @__PURE__ */ jsx("span", { className: "ml-auto text-[10px] uppercase tracking-wide", children: "change" })
        ]
      }
    ) }),
    /* @__PURE__ */ jsx("div", { className: "px-3 pb-2", children: /* @__PURE__ */ jsxs("div", { className: "relative", children: [
      /* @__PURE__ */ jsx(Search, { className: "absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" }),
      /* @__PURE__ */ jsx(
        "input",
        {
          value: q,
          onChange: (e) => setQ(e.target.value),
          placeholder: "Search sessions",
          className: "w-full rounded-md bg-sidebar-accent/40 border border-sidebar-border pl-8 pr-2 py-1.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/60"
        }
      )
    ] }) }),
    /* @__PURE__ */ jsx("div", { className: "flex-1 overflow-y-auto px-2 pb-3", children: filtered.length === 0 ? /* @__PURE__ */ jsx("div", { className: "px-3 py-6 text-center text-xs text-muted-foreground", children: "No sessions yet" }) : /* @__PURE__ */ jsx("ul", { className: "space-y-0.5", children: filtered.map((s) => {
      const active = s.id === activeSessionId;
      return /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsxs(
        "div",
        {
          className: `group flex items-start gap-2 rounded-md px-2.5 py-2 cursor-pointer transition-colors ${active ? "bg-sidebar-accent text-sidebar-accent-foreground" : "hover:bg-sidebar-accent/60"}`,
          onClick: () => onSelectSession(s.id),
          children: [
            /* @__PURE__ */ jsx(MessageSquare, { className: "h-3.5 w-3.5 mt-0.5 shrink-0 text-muted-foreground" }),
            /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
              /* @__PURE__ */ jsx("div", { className: "text-sm truncate", children: s.title || "Untitled" }),
              /* @__PURE__ */ jsxs("div", { className: "text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1.5", children: [
                /* @__PURE__ */ jsx("span", { children: s.model }),
                /* @__PURE__ */ jsx("span", { children: "·" }),
                /* @__PURE__ */ jsxs("span", { children: [
                  s.message_count,
                  " msgs"
                ] }),
                /* @__PURE__ */ jsx("span", { children: "·" }),
                /* @__PURE__ */ jsx("span", { children: timeAgo(s.last_active) })
              ] })
            ] }),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: (e) => {
                  e.stopPropagation();
                  del.mutate(s.id);
                },
                className: "opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-opacity",
                "aria-label": "Delete session",
                children: /* @__PURE__ */ jsx(Trash2, { className: "h-3.5 w-3.5" })
              }
            )
          ]
        }
      ) }, s.id);
    }) }) }),
    /* @__PURE__ */ jsxs("div", { className: "border-t border-sidebar-border px-3 py-2.5 flex items-center justify-between", children: [
      /* @__PURE__ */ jsx("span", { className: "text-[11px] text-muted-foreground", children: "Signed in via magic link" }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: onToggleTheme,
          className: "p-1.5 rounded-md hover:bg-sidebar-accent text-muted-foreground hover:text-foreground transition-colors",
          "aria-label": "Toggle theme",
          children: theme === "dark" ? /* @__PURE__ */ jsx(Sun, { className: "h-4 w-4" }) : /* @__PURE__ */ jsx(Moon, { className: "h-4 w-4" })
        }
      )
    ] })
  ] });
}
function ModelPicker({
  selected,
  onSelect
}) {
  const { data: models = [], isLoading } = useQuery({
    queryKey: ["models"],
    queryFn: getModels
  });
  return /* @__PURE__ */ jsxs("div", { className: "mx-auto w-full max-w-4xl px-4 py-10", children: [
    /* @__PURE__ */ jsxs("div", { className: "text-center mb-8", children: [
      /* @__PURE__ */ jsx(
        "div",
        {
          className: "mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl",
          style: { background: "var(--gradient-primary)", boxShadow: "var(--shadow-glow)" },
          children: /* @__PURE__ */ jsx(Sparkles, { className: "h-6 w-6", style: { color: "oklch(0.15 0.03 200)" } })
        }
      ),
      /* @__PURE__ */ jsx("h1", { className: "text-2xl font-semibold tracking-tight", children: "Choose a model" }),
      /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "Pick the LLM you'd like to chat with. You can switch any time." })
    ] }),
    isLoading ? /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: Array.from({ length: 4 }).map((_, i) => /* @__PURE__ */ jsx("div", { className: "h-28 rounded-xl border border-border bg-card animate-pulse" }, i)) }) : /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: models.map((m) => {
      const isSelected = selected === m.id;
      return /* @__PURE__ */ jsxs(
        "button",
        {
          disabled: !m.enabled,
          onClick: () => onSelect(m),
          className: `group text-left rounded-xl border p-4 transition-all ${isSelected ? "border-primary bg-card" : "border-border bg-card hover:border-primary/50"} ${!m.enabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`,
          style: isSelected ? { boxShadow: "var(--shadow-glow)" } : void 0,
          children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-3", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2.5", children: [
                /* @__PURE__ */ jsx("div", { className: "flex h-8 w-8 items-center justify-center rounded-md bg-secondary", children: /* @__PURE__ */ jsx(Cpu, { className: "h-4 w-4 text-primary" }) }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("div", { className: "font-medium text-foreground", children: m.name }),
                  m.context && /* @__PURE__ */ jsxs("div", { className: "text-[11px] text-muted-foreground", children: [
                    m.context,
                    " context"
                  ] })
                ] })
              ] }),
              isSelected && /* @__PURE__ */ jsx("div", { className: "flex h-5 w-5 items-center justify-center rounded-full bg-primary", children: /* @__PURE__ */ jsx(Check, { className: "h-3 w-3", style: { color: "oklch(0.15 0.03 200)" } }) }),
              !m.enabled && /* @__PURE__ */ jsx("span", { className: "text-[10px] uppercase tracking-wide text-muted-foreground", children: "Soon" })
            ] }),
            /* @__PURE__ */ jsx("p", { className: "mt-3 text-sm text-muted-foreground line-clamp-2", children: m.description })
          ]
        },
        m.id
      );
    }) })
  ] });
}
const ACCEPT = ".pdf,.txt,.docx,image/png,image/jpeg,image/jpg";
function fileIcon(type) {
  if (type.startsWith("image/")) return /* @__PURE__ */ jsx(Image, { className: "h-3 w-3" });
  return /* @__PURE__ */ jsx(FileText, { className: "h-3 w-3" });
}
async function toBase64(file) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(String(r.result).split(",")[1] || "");
    r.onerror = rej;
    r.readAsDataURL(file);
  });
}
function ChatComposer({
  onSend,
  disabled
}) {
  const [text, setText] = useState("");
  const [files, setFiles] = useState([]);
  const fileRef = useRef(null);
  const taRef = useRef(null);
  function autoresize() {
    const ta = taRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 220) + "px";
  }
  async function handleFiles(list) {
    if (!list) return;
    const next = [];
    for (const f of Array.from(list)) {
      const data = await toBase64(f);
      next.push({ name: f.name, type: f.type || "application/octet-stream", data, size: f.size });
    }
    setFiles((prev) => [...prev, ...next]);
  }
  function submit() {
    const t = text.trim();
    if (!t && files.length === 0) return;
    if (disabled) return;
    onSend(t, files);
    setText("");
    setFiles([]);
    requestAnimationFrame(() => {
      autoresize();
      taRef.current?.focus();
    });
  }
  function onKey(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }
  return /* @__PURE__ */ jsxs("div", { className: "w-full max-w-3xl mx-auto px-4 pb-4", children: [
    /* @__PURE__ */ jsxs(
      "div",
      {
        className: "rounded-2xl border border-border bg-card transition-colors focus-within:border-primary/60",
        style: { boxShadow: "var(--shadow-card)" },
        children: [
          files.length > 0 && /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-1.5 px-3 pt-3", children: files.map((f, i) => /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1.5 rounded-md border border-border bg-secondary px-2 py-1 text-xs", children: [
            fileIcon(f.type),
            /* @__PURE__ */ jsx("span", { className: "max-w-[160px] truncate", children: f.name }),
            /* @__PURE__ */ jsx(
              "button",
              {
                className: "text-muted-foreground hover:text-destructive",
                onClick: () => setFiles((prev) => prev.filter((_, idx) => idx !== i)),
                "aria-label": "Remove file",
                children: /* @__PURE__ */ jsx(X, { className: "h-3 w-3" })
              }
            )
          ] }, i)) }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-end gap-2 p-2", children: [
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => fileRef.current?.click(),
                className: "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors",
                "aria-label": "Attach files",
                type: "button",
                children: /* @__PURE__ */ jsx(Paperclip, { className: "h-4 w-4" })
              }
            ),
            /* @__PURE__ */ jsx(
              "input",
              {
                ref: fileRef,
                type: "file",
                multiple: true,
                accept: ACCEPT,
                className: "hidden",
                onChange: (e) => {
                  handleFiles(e.target.files);
                  e.target.value = "";
                }
              }
            ),
            /* @__PURE__ */ jsx(
              "textarea",
              {
                ref: taRef,
                rows: 1,
                value: text,
                placeholder: "Message AvinerLLM…",
                onChange: (e) => {
                  setText(e.target.value);
                  autoresize();
                },
                onKeyDown: onKey,
                className: "flex-1 resize-none bg-transparent px-1 py-2 text-[0.9375rem] outline-none placeholder:text-muted-foreground max-h-[220px]"
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: submit,
                disabled: disabled || !text.trim() && files.length === 0,
                className: "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed",
                style: {
                  background: "var(--gradient-primary)",
                  color: "oklch(0.15 0.03 200)",
                  boxShadow: !disabled && (text.trim() || files.length > 0) ? "var(--shadow-glow)" : void 0
                },
                "aria-label": "Send",
                children: /* @__PURE__ */ jsx(ArrowUp, { className: "h-4 w-4" })
              }
            )
          ] })
        ]
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: "mt-2 text-center text-[10px] text-muted-foreground", children: [
      "AvinerLLM may produce inaccurate information. Press ",
      /* @__PURE__ */ jsx("kbd", { className: "px-1 py-0.5 rounded bg-secondary border border-border", children: "Enter" }),
      " to send · ",
      /* @__PURE__ */ jsx("kbd", { className: "px-1 py-0.5 rounded bg-secondary border border-border", children: "Shift+Enter" }),
      " for newline"
    ] })
  ] });
}
function formatTime(ts) {
  return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
function MessageBubble({ msg }) {
  const isUser = msg.role === "user";
  return /* @__PURE__ */ jsxs("div", { className: `flex gap-3 animate-message-in ${isUser ? "flex-row-reverse" : ""}`, children: [
    /* @__PURE__ */ jsx(
      "div",
      {
        className: `flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${isUser ? "bg-secondary" : ""}`,
        style: !isUser ? { background: "var(--gradient-primary)" } : void 0,
        children: isUser ? /* @__PURE__ */ jsx(User, { className: "h-4 w-4 text-foreground" }) : /* @__PURE__ */ jsx(Bot, { className: "h-4 w-4", style: { color: "oklch(0.15 0.03 200)" } })
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: `flex flex-col gap-1 max-w-[80%] ${isUser ? "items-end" : "items-start"}`, children: [
      /* @__PURE__ */ jsxs(
        "div",
        {
          className: isUser ? "rounded-2xl rounded-tr-sm bg-secondary px-4 py-2.5 text-secondary-foreground" : "rounded-2xl rounded-tl-sm bg-card border border-border px-4 py-2.5 text-card-foreground",
          children: [
            msg.files && msg.files.length > 0 && /* @__PURE__ */ jsx("div", { className: "mb-2 flex flex-wrap gap-1.5", children: msg.files.map((f, i) => /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1 rounded-md bg-background/60 border border-border px-2 py-0.5 text-xs text-muted-foreground", children: [
              /* @__PURE__ */ jsx(Paperclip, { className: "h-3 w-3" }),
              f.name
            ] }, i)) }),
            isUser ? /* @__PURE__ */ jsx("p", { className: "whitespace-pre-wrap text-[0.9375rem] leading-relaxed", children: msg.content }) : /* @__PURE__ */ jsx("div", { className: "prose-chat", children: /* @__PURE__ */ jsx(ReactMarkdown, { remarkPlugins: [remarkGfm], children: msg.content }) })
          ]
        }
      ),
      /* @__PURE__ */ jsxs("span", { className: "text-[10px] text-muted-foreground px-1", children: [
        formatTime(msg.timestamp),
        msg.tokens ? ` · ${msg.tokens} tok` : ""
      ] })
    ] })
  ] });
}
function TypingBubble() {
  return /* @__PURE__ */ jsxs("div", { className: "flex gap-3 animate-message-in", children: [
    /* @__PURE__ */ jsx(
      "div",
      {
        className: "flex h-8 w-8 shrink-0 items-center justify-center rounded-md",
        style: { background: "var(--gradient-primary)" },
        children: /* @__PURE__ */ jsx(Bot, { className: "h-4 w-4", style: { color: "oklch(0.15 0.03 200)" } })
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: "rounded-2xl rounded-tl-sm bg-card border border-border px-4 py-3", children: [
      /* @__PURE__ */ jsx("span", { className: "typing-dot" }),
      /* @__PURE__ */ jsx("span", { className: "typing-dot" }),
      /* @__PURE__ */ jsx("span", { className: "typing-dot" })
    ] })
  ] });
}
function ChatApp() {
  const qc = useQueryClient();
  const [theme, setTheme] = useState(() => {
    if (typeof window === "undefined") return "dark";
    return localStorage.getItem("aviner_theme") || "dark";
  });
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "light") {
      root.classList.add("light");
      root.classList.remove("dark");
    } else {
      root.classList.remove("light");
    }
    localStorage.setItem("aviner_theme", theme);
  }, [theme]);
  const { data: models = [] } = useQuery({ queryKey: ["models"], queryFn: getModels });
  const [modelId, setModelId] = useState(
    () => typeof window === "undefined" ? null : localStorage.getItem(ACTIVE_MODEL_KEY)
  );
  const [showPicker, setShowPicker] = useState(false);
  const [sessionId, setSessionId] = useState(
    () => typeof window === "undefined" ? null : localStorage.getItem(ACTIVE_SESSION_KEY)
  );
  const [messages, setMessages] = useState([]);
  const [tokensUsed, setTokensUsed] = useState(0);
  const [pending, setPending] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const currentModel = useMemo(
    () => models.find((m) => m.id === modelId),
    [models, modelId]
  );
  useEffect(() => {
    if (!modelId && models.length > 0) setShowPicker(true);
  }, [modelId, models]);
  useEffect(() => {
    if (!sessionId) return;
    let cancelled = false;
    getSession(sessionId).then((s) => {
      if (cancelled) return;
      if (s) {
        setMessages(s.messages);
        if (!modelId) {
          setModelId(s.model);
          localStorage.setItem(ACTIVE_MODEL_KEY, s.model);
        }
      } else {
        setSessionId(null);
        localStorage.removeItem(ACTIVE_SESSION_KEY);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);
  const scrollRef = useRef(null);
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, pending]);
  function selectModel(m) {
    setModelId(m.id);
    localStorage.setItem(ACTIVE_MODEL_KEY, m.id);
    setShowPicker(false);
  }
  function newChat() {
    setSessionId(null);
    setMessages([]);
    setTokensUsed(0);
    localStorage.removeItem(ACTIVE_SESSION_KEY);
    setSidebarOpen(false);
  }
  async function loadSession(id) {
    setSidebarOpen(false);
    const s = await getSession(id);
    if (!s) return;
    setSessionId(id);
    localStorage.setItem(ACTIVE_SESSION_KEY, id);
    setMessages(s.messages);
    setTokensUsed(s.messages.reduce((a, m) => a + (m.tokens || 0), 0));
    if (s.model) {
      setModelId(s.model);
      localStorage.setItem(ACTIVE_MODEL_KEY, s.model);
    }
  }
  async function handleSend(text, files) {
    if (!modelId) {
      setShowPicker(true);
      return;
    }
    const sid = sessionId || uuid();
    if (!sessionId) {
      setSessionId(sid);
      localStorage.setItem(ACTIVE_SESSION_KEY, sid);
    }
    const userMsg = {
      id: uuid(),
      role: "user",
      content: text,
      timestamp: Date.now(),
      files: files.map((f) => ({ name: f.name, type: f.type }))
    };
    setMessages((prev) => [...prev, userMsg]);
    setPending(true);
    try {
      const res = await sendChat({
        model: modelId,
        sessionId: sid,
        message: text,
        files: files.map((f) => ({ name: f.name, type: f.type, data: f.data }))
      });
      const asst = {
        id: uuid(),
        role: "assistant",
        content: res.reply,
        timestamp: Date.now(),
        tokens: res.tokens_used
      };
      setMessages((prev) => [...prev, asst]);
      setTokensUsed((t) => t + res.tokens_used);
      qc.invalidateQueries({ queryKey: ["sessions"] });
    } catch (e) {
      const asst = {
        id: uuid(),
        role: "assistant",
        content: "Connection error. Please try again.",
        timestamp: Date.now()
      };
      setMessages((prev) => [...prev, asst]);
    } finally {
      setPending(false);
    }
  }
  const activeModelName = currentModel?.name || "Select model";
  return /* @__PURE__ */ jsxs("div", { className: "flex h-screen w-full overflow-hidden bg-background text-foreground", children: [
    /* @__PURE__ */ jsx("div", { className: "hidden md:flex md:w-72 lg:w-80 shrink-0", children: /* @__PURE__ */ jsx(
      SessionsSidebar,
      {
        activeSessionId: sessionId,
        activeModelName,
        onSelectSession: loadSession,
        onNewChat: newChat,
        onChangeModel: () => setShowPicker(true),
        theme,
        onToggleTheme: () => setTheme((t) => t === "dark" ? "light" : "dark")
      }
    ) }),
    sidebarOpen && /* @__PURE__ */ jsxs("div", { className: "md:hidden fixed inset-0 z-40 flex", children: [
      /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-background/70 backdrop-blur-sm", onClick: () => setSidebarOpen(false) }),
      /* @__PURE__ */ jsx("div", { className: "relative w-72 max-w-[80%] h-full", children: /* @__PURE__ */ jsx(
        SessionsSidebar,
        {
          activeSessionId: sessionId,
          activeModelName,
          onSelectSession: loadSession,
          onNewChat: newChat,
          onChangeModel: () => {
            setShowPicker(true);
            setSidebarOpen(false);
          },
          onClose: () => setSidebarOpen(false),
          theme,
          onToggleTheme: () => setTheme((t) => t === "dark" ? "light" : "dark")
        }
      ) })
    ] }),
    /* @__PURE__ */ jsxs("main", { className: "flex-1 flex flex-col min-w-0", children: [
      /* @__PURE__ */ jsxs("header", { className: "flex items-center justify-between gap-3 px-4 py-3 border-b border-border bg-background/80 backdrop-blur", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setSidebarOpen(true),
              className: "md:hidden p-1.5 rounded-md hover:bg-secondary",
              "aria-label": "Open sidebar",
              children: /* @__PURE__ */ jsx(Menu, { className: "h-4 w-4" })
            }
          ),
          /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => setShowPicker(true),
              className: "inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1 text-xs hover:border-primary/60 transition-colors",
              children: [
                /* @__PURE__ */ jsx(Cpu, { className: "h-3 w-3 text-primary" }),
                /* @__PURE__ */ jsx("span", { children: activeModelName })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 text-[11px] text-muted-foreground", children: [
          sessionId && /* @__PURE__ */ jsxs("span", { className: "hidden sm:inline-flex items-center gap-1", children: [
            /* @__PURE__ */ jsx(Hash, { className: "h-3 w-3" }),
            sessionId.slice(0, 8)
          ] }),
          /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1", children: [
            /* @__PURE__ */ jsx(Sparkles, { className: "h-3 w-3 text-primary" }),
            tokensUsed.toLocaleString(),
            " tokens"
          ] }),
          /* @__PURE__ */ jsxs("span", { className: "hidden sm:inline-flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsx("span", { className: "h-1.5 w-1.5 rounded-full bg-primary", style: { boxShadow: "0 0 8px var(--primary)" } }),
            "connected"
          ] })
        ] })
      ] }),
      showPicker ? /* @__PURE__ */ jsx("div", { className: "flex-1 overflow-y-auto", children: /* @__PURE__ */ jsx(ModelPicker, { selected: modelId, onSelect: selectModel }) }) : /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx("div", { ref: scrollRef, className: "flex-1 overflow-y-auto", children: messages.length === 0 ? /* @__PURE__ */ jsx(EmptyState, { modelName: activeModelName }) : /* @__PURE__ */ jsxs("div", { className: "max-w-3xl mx-auto px-4 py-6 space-y-5", children: [
          messages.map((m) => /* @__PURE__ */ jsx(MessageBubble, { msg: m }, m.id)),
          pending && /* @__PURE__ */ jsx(TypingBubble, {})
        ] }) }),
        /* @__PURE__ */ jsx(ChatComposer, { onSend: handleSend, disabled: pending })
      ] })
    ] })
  ] });
}
function EmptyState({ modelName }) {
  const prompts = [
    "Explain the difference between TCP and UDP",
    "Write a TypeScript debounce function",
    "Summarize this article in 3 bullets",
    "Brainstorm names for a new SaaS"
  ];
  return /* @__PURE__ */ jsxs("div", { className: "h-full flex flex-col items-center justify-center px-4 py-10 text-center", children: [
    /* @__PURE__ */ jsx(
      "div",
      {
        className: "mb-5 flex h-14 w-14 items-center justify-center rounded-2xl",
        style: { background: "var(--gradient-primary)", boxShadow: "var(--shadow-glow)" },
        children: /* @__PURE__ */ jsx(Sparkles, { className: "h-7 w-7", style: { color: "oklch(0.15 0.03 200)" } })
      }
    ),
    /* @__PURE__ */ jsx("h2", { className: "text-2xl font-semibold tracking-tight", children: "How can I help you today?" }),
    /* @__PURE__ */ jsxs("p", { className: "mt-2 text-sm text-muted-foreground", children: [
      "Chatting with ",
      /* @__PURE__ */ jsx("span", { className: "text-foreground", children: modelName }),
      " · Ask anything or attach a file."
    ] }),
    /* @__PURE__ */ jsx("div", { className: "mt-6 grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-xl", children: prompts.map((p) => /* @__PURE__ */ jsx(
      "div",
      {
        className: "rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-left text-muted-foreground hover:border-primary/50 hover:text-foreground transition-colors cursor-default",
        children: p
      },
      p
    )) })
  ] });
}
function Index() {
  const [ready, setReady] = useState(false);
  const [hasToken, setHasToken] = useState(false);
  useEffect(() => {
    const t = bootstrapTokenFromURL();
    setHasToken(!!t);
    setReady(true);
  }, []);
  function acceptDevToken(token) {
    sessionStorage.setItem("aviner_token", token);
    setHasToken(true);
  }
  if (!ready) {
    return /* @__PURE__ */ jsx("div", { className: "min-h-screen bg-background" });
  }
  if (!hasToken) return /* @__PURE__ */ jsx(AccessDenied, { onDevToken: acceptDevToken });
  return /* @__PURE__ */ jsx(ChatApp, {});
}
export {
  Index as component
};
