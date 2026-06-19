import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Bot, User, Paperclip } from "lucide-react";
import type { ChatMessage } from "@/lib/api";

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function MessageBubble({ msg }: { msg: ChatMessage }) {
  const isUser = msg.role === "user";
  return (
    <div className={`flex gap-3 animate-message-in ${isUser ? "flex-row-reverse" : ""}`}>
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${
          isUser ? "bg-secondary" : ""
        }`}
        style={!isUser ? { background: "var(--gradient-primary)" } : undefined}
      >
        {isUser
          ? <User className="h-4 w-4 text-foreground" />
          : <Bot className="h-4 w-4" style={{ color: "oklch(0.15 0.03 200)" }} />}
      </div>
      <div className={`flex flex-col gap-1 max-w-[80%] ${isUser ? "items-end" : "items-start"}`}>
        <div
          className={
            isUser
              ? "rounded-2xl rounded-tr-sm bg-secondary px-4 py-2.5 text-secondary-foreground"
              : "rounded-2xl rounded-tl-sm bg-card border border-border px-4 py-2.5 text-card-foreground"
          }
        >
          {msg.files && msg.files.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-1.5">
              {msg.files.map((f, i) => (
                <span key={i} className="inline-flex items-center gap-1 rounded-md bg-background/60 border border-border px-2 py-0.5 text-xs text-muted-foreground">
                  <Paperclip className="h-3 w-3" />{f.name}
                </span>
              ))}
            </div>
          )}
          {isUser ? (
            <p className="whitespace-pre-wrap text-[0.9375rem] leading-relaxed">{msg.content}</p>
          ) : (
            <div className="prose-chat">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
            </div>
          )}
        </div>
        <span className="text-[10px] text-muted-foreground px-1">
          {formatTime(msg.timestamp)}
          {msg.tokens ? ` · ${msg.tokens} tok` : ""}
        </span>
      </div>
    </div>
  );
}

export function TypingBubble() {
  return (
    <div className="flex gap-3 animate-message-in">
      <div
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md"
        style={{ background: "var(--gradient-primary)" }}
      >
        <Bot className="h-4 w-4" style={{ color: "oklch(0.15 0.03 200)" }} />
      </div>
      <div className="rounded-2xl rounded-tl-sm bg-card border border-border px-4 py-3">
        <span className="typing-dot" />
        <span className="typing-dot" />
        <span className="typing-dot" />
      </div>
    </div>
  );
}
