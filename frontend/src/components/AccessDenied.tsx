import { useState } from "react";
import { Mail, ShieldAlert, KeyRound } from "lucide-react";

const DEV_TOKEN = "devtest27901";

export function AccessDenied({ onDevToken }: { onDevToken: (token: string) => void }) {
  const [val, setVal] = useState("");
  const [err, setErr] = useState<string | null>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (val.trim() === DEV_TOKEN) {
      onDevToken(val.trim());
    } else {
      setErr("Invalid dev token");
    }
  }

  return (
    <div
      className="flex min-h-screen items-center justify-center p-6"
      style={{ background: "var(--gradient-hero)" }}
    >
      <div
        className="max-w-md w-full rounded-2xl border border-border bg-card p-8 text-center"
        style={{ boxShadow: "var(--shadow-card)" }}
      >
        <div
          className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-xl"
          style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-glow)" }}
        >
          <ShieldAlert className="h-7 w-7" style={{ color: "oklch(0.15 0.03 200)" }} />
        </div>
        <h1 className="text-xl font-semibold tracking-tight text-foreground">Access Denied</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          We couldn't find an access token. Please open AvinerLLM from the magic link
          we sent to your email.
        </p>
        <div className="mt-5 flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Mail className="h-3.5 w-3.5" />
          <span>Check your inbox for your access link</span>
        </div>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Dev access</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <form onSubmit={submit} className="space-y-2 text-left">
          <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <KeyRound className="h-3 w-3" /> Dev token
          </label>
          <div className="flex gap-2">
            <input
              value={val}
              onChange={(e) => { setVal(e.target.value); setErr(null); }}
              placeholder="Enter dev token"
              className="flex-1 rounded-md border border-border bg-input/40 px-3 py-2 text-sm outline-none focus:border-primary"
            />
            <button
              type="submit"
              className="rounded-md px-4 py-2 text-sm font-medium"
              style={{
                background: "var(--gradient-primary)",
                color: "oklch(0.15 0.03 200)",
                boxShadow: "var(--shadow-glow)",
              }}
            >
              Enter
            </button>
          </div>
          {err && <p className="text-xs text-destructive">{err}</p>}
        </form>
      </div>
    </div>
  );
}
