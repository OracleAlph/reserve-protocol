import { Badge } from "@/components/ui/badge";
import type { RebaseClassification } from "@/lib/protocol/types";
import { cn } from "@/lib/utils";

const TONE: Record<RebaseClassification["reading"], { badge: "sage" | "rust" | "amber" | "outline"; box: string }> = {
  preserved: { badge: "sage", box: "bg-sage-soft/60" },
  rebase: { badge: "rust", box: "bg-rust-soft/70" },
  "margin-narrowing": { badge: "amber", box: "bg-amber-soft/70" },
  "concordant-decline": { badge: "outline", box: "bg-bg-elevated" },
  unnamed: { badge: "outline", box: "bg-bg-elevated" },
  incomplete: { badge: "outline", box: "bg-bg-elevated" },
};

function Word({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[0.65rem] uppercase tracking-[0.16em] text-ink-subtle">{label}</p>
      <p className="mt-0.5 font-medium capitalize text-ink">{value}</p>
    </div>
  );
}

export function RebaseCard({
  classification,
  className,
}: {
  classification: RebaseClassification;
  className?: string;
}) {
  const tone = TONE[classification.reading];
  return (
    <div className={cn("rounded-lg p-4", tone.box, className)}>
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={tone.badge}>
          {classification.reading === "rebase" ? "Rebase" : classification.title.replace(/\.$/, "")}
        </Badge>
      </div>
      <h3 className="mt-3 font-display text-xl font-medium leading-snug">{classification.title}</h3>
      <p className="mt-2 text-sm text-ink-muted">{classification.body}</p>
      <div className="mt-4 grid grid-cols-3 gap-3 border-t border-line/80 pt-3 text-sm">
        <Word label="Performance" value={classification.performance} />
        <Word label="Self-report" value={classification.selfReport} />
        <Word label="Demand" value={classification.demand} />
      </div>
    </div>
  );
}
