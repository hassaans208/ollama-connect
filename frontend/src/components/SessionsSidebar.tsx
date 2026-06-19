import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Trash2, MessageSquare, X, Moon, Sun, Cpu } from "lucide-react";
import { listSessions, deleteSession, type SessionMeta } from "@/lib/api";

function timeAgo(ts: number) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export function SessionsSidebar({
  activeSessionId,
  activeModelName,
  onSelectSession,
  onNewChat,
  onChangeModel,
  onClose,
  theme,
  onToggleTheme,
}: {
  activeSessionId: string | null;
  activeModelName: string;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  onChangeModel: () => void;
  onClose?: () => void;
  theme: "dark" | "light";
  onToggleTheme: () => void;
}) {
  const [q, setQ] = useState("");
  const qc = useQueryClient();
  const { data: sessions = [] } = useQuery({
    queryKey: ["sessions"],
    queryFn: listSessions,
    refetchOnWindowFocus: false,
  });

  const filtered = useMemo(() => {
    if (!q.trim()) return sessions;
    const needle = q.toLowerCase();
    return sessions.filter(s => s.title.toLowerCase().includes(needle));
  }, [sessions, q]);

  const del = useMutation({
    mutationFn: deleteSession,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["sessions"] }),
  });

  return (
    <aside className="flex h-full w-full flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
      <div className="flex items-center justify-between px-4 py-3.5">
        <div className="flex items-center gap-2">
          <div
            className="flex h-7 w-7 items-center justify-center rounded-md"
            style={{ background: "var(--gradient-primary)" }}
          >
            <span className="text-[11px] font-bold" style={{ color: "oklch(0.15 0.03 200)" }}>A</span>
          </div>
          <span className="font-semibold tracking-tight">AvinerLLM</span>
        </div>
        {onClose && (
          <button onClick={onClose} className="md:hidden p-1 rounded hover:bg-sidebar-accent">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="px-3 pb-3">
        <button
          onClick={onNewChat}
          className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-sidebar-border bg-sidebar-accent/40 hover:bg-sidebar-accent px-3 py-2 text-sm font-medium transition-colors"
        >
          <Plus className="h-4 w-4" />
          New chat
        </button>
      </div>

      <div className="px-3 pb-2">
        <button
          onClick={onChangeModel}
          className="w-full flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
        >
          <Cpu className="h-3.5 w-3.5 text-primary" />
          <span className="truncate">{activeModelName}</span>
          <span className="ml-auto text-[10px] uppercase tracking-wide">change</span>
        </button>
      </div>

      <div className="px-3 pb-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Search sessions"
            className="w-full rounded-md bg-sidebar-accent/40 border border-sidebar-border pl-8 pr-2 py-1.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/60"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-3">
        {filtered.length === 0 ? (
          <div className="px-3 py-6 text-center text-xs text-muted-foreground">
            No sessions yet
          </div>
        ) : (
          <ul className="space-y-0.5">
            {filtered.map((s: SessionMeta) => {
              const active = s.id === activeSessionId;
              return (
                <li key={s.id}>
                  <div
                    className={`group flex items-start gap-2 rounded-md px-2.5 py-2 cursor-pointer transition-colors ${
                      active
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "hover:bg-sidebar-accent/60"
                    }`}
                    onClick={() => onSelectSession(s.id)}
                  >
                    <MessageSquare className="h-3.5 w-3.5 mt-0.5 shrink-0 text-muted-foreground" />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm truncate">{s.title || "Untitled"}</div>
                      <div className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1.5">
                        <span>{s.model}</span>
                        <span>·</span>
                        <span>{s.message_count} msgs</span>
                        <span>·</span>
                        <span>{timeAgo(s.last_active)}</span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); del.mutate(s.id); }}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-opacity"
                      aria-label="Delete session"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="border-t border-sidebar-border px-3 py-2.5 flex items-center justify-between">
        <span className="text-[11px] text-muted-foreground">Signed in via magic link</span>
        <button
          onClick={onToggleTheme}
          className="p-1.5 rounded-md hover:bg-sidebar-accent text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
      </div>
    </aside>
  );
}
