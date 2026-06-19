import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Menu, Cpu, Hash, Sparkles } from "lucide-react";
import { SessionsSidebar } from "./SessionsSidebar";
import { ModelPicker } from "./ModelPicker";
import { ChatComposer, type PendingFile } from "./ChatComposer";
import { MessageBubble, TypingBubble } from "./MessageBubble";
import {
  ACTIVE_MODEL_KEY,
  ACTIVE_SESSION_KEY,
  getModels,
  getSession,
  sendChat,
  uuid,
  type ChatMessage,
  type ModelInfo,
} from "@/lib/api";

export function ChatApp() {
  const qc = useQueryClient();
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    if (typeof window === "undefined") return "dark";
    return (localStorage.getItem("aviner_theme") as "dark" | "light") || "dark";
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

  const [modelId, setModelId] = useState<string | null>(() =>
    typeof window === "undefined" ? null : localStorage.getItem(ACTIVE_MODEL_KEY)
  );
  const [showPicker, setShowPicker] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(() =>
    typeof window === "undefined" ? null : localStorage.getItem(ACTIVE_SESSION_KEY)
  );
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [tokensUsed, setTokensUsed] = useState(0);
  const [pending, setPending] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const currentModel: ModelInfo | undefined = useMemo(
    () => models.find(m => m.id === modelId),
    [models, modelId]
  );

  // First-load model bootstrap: open picker if no model selected
  useEffect(() => {
    if (!modelId && models.length > 0) setShowPicker(true);
  }, [modelId, models]);

  // Auto-resume last session
  useEffect(() => {
    if (!sessionId) return;
    let cancelled = false;
    getSession(sessionId).then(s => {
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
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, pending]);

  function selectModel(m: ModelInfo) {
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

  async function loadSession(id: string) {
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

  async function handleSend(text: string, files: PendingFile[]) {
    if (!modelId) { setShowPicker(true); return; }
    const sid = sessionId || uuid();
    if (!sessionId) {
      setSessionId(sid);
      localStorage.setItem(ACTIVE_SESSION_KEY, sid);
    }
    const userMsg: ChatMessage = {
      id: uuid(),
      role: "user",
      content: text,
      timestamp: Date.now(),
      files: files.map(f => ({ name: f.name, type: f.type })),
    };
    setMessages(prev => [...prev, userMsg]);
    setPending(true);
    try {
      const res = await sendChat({
        model: modelId,
        sessionId: sid,
        message: text,
        files: files.map(f => ({ name: f.name, type: f.type, data: f.data })),
      });
      const asst: ChatMessage = {
        id: uuid(),
        role: "assistant",
        content: res.reply,
        timestamp: Date.now(),
        tokens: res.tokens_used,
      };
      setMessages(prev => [...prev, asst]);
      setTokensUsed(t => t + res.tokens_used);
      qc.invalidateQueries({ queryKey: ["sessions"] });
    } catch (e) {
      const asst: ChatMessage = {
        id: uuid(),
        role: "assistant",
        content: "Connection error. Please try again.",
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, asst]);
    } finally {
      setPending(false);
    }
  }

  const activeModelName = currentModel?.name || "Select model";

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
      {/* Desktop sidebar */}
      <div className="hidden md:flex md:w-72 lg:w-80 shrink-0">
        <SessionsSidebar
          activeSessionId={sessionId}
          activeModelName={activeModelName}
          onSelectSession={loadSession}
          onNewChat={newChat}
          onChangeModel={() => setShowPicker(true)}
          theme={theme}
          onToggleTheme={() => setTheme(t => t === "dark" ? "light" : "dark")}
        />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <div className="absolute inset-0 bg-background/70 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="relative w-72 max-w-[80%] h-full">
            <SessionsSidebar
              activeSessionId={sessionId}
              activeModelName={activeModelName}
              onSelectSession={loadSession}
              onNewChat={newChat}
              onChangeModel={() => { setShowPicker(true); setSidebarOpen(false); }}
              onClose={() => setSidebarOpen(false)}
              theme={theme}
              onToggleTheme={() => setTheme(t => t === "dark" ? "light" : "dark")}
            />
          </div>
        </div>
      )}

      {/* Main */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top status bar */}
        <header className="flex items-center justify-between gap-3 px-4 py-3 border-b border-border bg-background/80 backdrop-blur">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-1.5 rounded-md hover:bg-secondary"
              aria-label="Open sidebar"
            >
              <Menu className="h-4 w-4" />
            </button>
            <button
              onClick={() => setShowPicker(true)}
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1 text-xs hover:border-primary/60 transition-colors"
            >
              <Cpu className="h-3 w-3 text-primary" />
              <span>{activeModelName}</span>
            </button>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
            {sessionId && (
              <span className="hidden sm:inline-flex items-center gap-1">
                <Hash className="h-3 w-3" />
                {sessionId.slice(0, 8)}
              </span>
            )}
            <span className="inline-flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-primary" />
              {tokensUsed.toLocaleString()} tokens
            </span>
            <span className="hidden sm:inline-flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" style={{ boxShadow: "0 0 8px var(--primary)" }} />
              connected
            </span>
          </div>
        </header>

        {/* Body */}
        {showPicker ? (
          <div className="flex-1 overflow-y-auto">
            <ModelPicker selected={modelId} onSelect={selectModel} />
          </div>
        ) : (
          <>
            <div ref={scrollRef} className="flex-1 overflow-y-auto">
              {messages.length === 0 ? (
                <EmptyState modelName={activeModelName} />
              ) : (
                <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">
                  {messages.map(m => <MessageBubble key={m.id} msg={m} />)}
                  {pending && <TypingBubble />}
                </div>
              )}
            </div>
            <ChatComposer onSend={handleSend} disabled={pending} />
          </>
        )}
      </main>
    </div>
  );
}

function EmptyState({ modelName }: { modelName: string }) {
  const prompts = [
    "Explain the difference between TCP and UDP",
    "Write a TypeScript debounce function",
    "Summarize this article in 3 bullets",
    "Brainstorm names for a new SaaS",
  ];
  return (
    <div className="h-full flex flex-col items-center justify-center px-4 py-10 text-center">
      <div
        className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl"
        style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-glow)" }}
      >
        <Sparkles className="h-7 w-7" style={{ color: "oklch(0.15 0.03 200)" }} />
      </div>
      <h2 className="text-2xl font-semibold tracking-tight">How can I help you today?</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Chatting with <span className="text-foreground">{modelName}</span> · Ask anything or attach a file.
      </p>
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-xl">
        {prompts.map(p => (
          <div
            key={p}
            className="rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-left text-muted-foreground hover:border-primary/50 hover:text-foreground transition-colors cursor-default"
          >
            {p}
          </div>
        ))}
      </div>
    </div>
  );
}
