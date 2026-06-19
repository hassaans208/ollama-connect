import { useRef, useState, type KeyboardEvent } from "react";
import { Paperclip, ArrowUp, X, FileText, Image as ImageIcon } from "lucide-react";

export interface PendingFile {
  name: string;
  type: string;
  data: string; // base64
  size: number;
}

const ACCEPT = ".pdf,.txt,.docx,image/png,image/jpeg,image/jpg";

function fileIcon(type: string) {
  if (type.startsWith("image/")) return <ImageIcon className="h-3 w-3" />;
  return <FileText className="h-3 w-3" />;
}

async function toBase64(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(String(r.result).split(",")[1] || "");
    r.onerror = rej;
    r.readAsDataURL(file);
  });
}

export function ChatComposer({
  onSend,
  disabled,
}: {
  onSend: (text: string, files: PendingFile[]) => void;
  disabled?: boolean;
}) {
  const [text, setText] = useState("");
  const [files, setFiles] = useState<PendingFile[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);

  function autoresize() {
    const ta = taRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 220) + "px";
  }

  async function handleFiles(list: FileList | null) {
    if (!list) return;
    const next: PendingFile[] = [];
    for (const f of Array.from(list)) {
      const data = await toBase64(f);
      next.push({ name: f.name, type: f.type || "application/octet-stream", data, size: f.size });
    }
    setFiles(prev => [...prev, ...next]);
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

  function onKey(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }

  return (
    <div className="w-full max-w-3xl mx-auto px-4 pb-4">
      <div
        className="rounded-2xl border border-border bg-card transition-colors focus-within:border-primary/60"
        style={{ boxShadow: "var(--shadow-card)" }}
      >
        {files.length > 0 && (
          <div className="flex flex-wrap gap-1.5 px-3 pt-3">
            {files.map((f, i) => (
              <span key={i} className="inline-flex items-center gap-1.5 rounded-md border border-border bg-secondary px-2 py-1 text-xs">
                {fileIcon(f.type)}
                <span className="max-w-[160px] truncate">{f.name}</span>
                <button
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() => setFiles(prev => prev.filter((_, idx) => idx !== i))}
                  aria-label="Remove file"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}
        <div className="flex items-end gap-2 p-2">
          <button
            onClick={() => fileRef.current?.click()}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
            aria-label="Attach files"
            type="button"
          >
            <Paperclip className="h-4 w-4" />
          </button>
          <input
            ref={fileRef}
            type="file"
            multiple
            accept={ACCEPT}
            className="hidden"
            onChange={e => { handleFiles(e.target.files); e.target.value = ""; }}
          />
          <textarea
            ref={taRef}
            rows={1}
            value={text}
            placeholder="Message AvinerLLM…"
            onChange={e => { setText(e.target.value); autoresize(); }}
            onKeyDown={onKey}
            className="flex-1 resize-none bg-transparent px-1 py-2 text-[0.9375rem] outline-none placeholder:text-muted-foreground max-h-[220px]"
          />
          <button
            onClick={submit}
            disabled={disabled || (!text.trim() && files.length === 0)}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: "var(--gradient-primary)",
              color: "oklch(0.15 0.03 200)",
              boxShadow: !disabled && (text.trim() || files.length > 0) ? "var(--shadow-glow)" : undefined,
            }}
            aria-label="Send"
          >
            <ArrowUp className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="mt-2 text-center text-[10px] text-muted-foreground">
        AvinerLLM may produce inaccurate information. Press <kbd className="px-1 py-0.5 rounded bg-secondary border border-border">Enter</kbd> to send · <kbd className="px-1 py-0.5 rounded bg-secondary border border-border">Shift+Enter</kbd> for newline
      </div>
    </div>
  );
}
