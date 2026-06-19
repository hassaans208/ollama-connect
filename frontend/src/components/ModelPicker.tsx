import { useQuery } from "@tanstack/react-query";
import { Check, Cpu, Sparkles } from "lucide-react";
import { getModels, type ModelInfo } from "@/lib/api";

export function ModelPicker({
  selected,
  onSelect,
}: {
  selected: string | null;
  onSelect: (m: ModelInfo) => void;
}) {
  const { data: models = [], isLoading } = useQuery({
    queryKey: ["models"],
    queryFn: getModels,
  });

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10">
      <div className="text-center mb-8">
        <div
          className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl"
          style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-glow)" }}
        >
          <Sparkles className="h-6 w-6" style={{ color: "oklch(0.15 0.03 200)" }} />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">Choose a model</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Pick the LLM you'd like to chat with. You can switch any time.
        </p>
      </div>
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 rounded-xl border border-border bg-card animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {models.map(m => {
            const isSelected = selected === m.id;
            return (
              <button
                key={m.id}
                disabled={!m.enabled}
                onClick={() => onSelect(m)}
                className={`group text-left rounded-xl border p-4 transition-all ${
                  isSelected
                    ? "border-primary bg-card"
                    : "border-border bg-card hover:border-primary/50"
                } ${!m.enabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
                style={isSelected ? { boxShadow: "var(--shadow-glow)" } : undefined}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-secondary">
                      <Cpu className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium text-foreground">{m.name}</div>
                      {m.context && (
                        <div className="text-[11px] text-muted-foreground">{m.context} context</div>
                      )}
                    </div>
                  </div>
                  {isSelected && (
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                      <Check className="h-3 w-3" style={{ color: "oklch(0.15 0.03 200)" }} />
                    </div>
                  )}
                  {!m.enabled && (
                    <span className="text-[10px] uppercase tracking-wide text-muted-foreground">Soon</span>
                  )}
                </div>
                <p className="mt-3 text-sm text-muted-foreground line-clamp-2">{m.description}</p>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
