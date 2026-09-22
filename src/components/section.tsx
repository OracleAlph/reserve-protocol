import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Section({
  n,
  title,
  kicker,
  children,
  className,
}: {
  n?: string | number;
  title: string;
  kicker?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-xl bg-surface p-5 shadow-[var(--shadow-border)] sm:p-6",
        className,
      )}
    >
      <header className="mb-4 flex items-baseline gap-3 border-b border-line pb-3">
        {n != null ? (
          <span className="font-display text-2xl text-teal tabular-nums leading-none">{n}</span>
        ) : null}
        <div className="min-w-0">
          {kicker ? (
            <p className="text-[0.65rem] font-medium uppercase tracking-[0.18em] text-ink-subtle">
              {kicker}
            </p>
          ) : null}
          <h2 className="font-display text-xl font-medium leading-snug text-ink">{title}</h2>
        </div>
      </header>
      {children}
    </section>
  );
}

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-ink">{label}</span>
      {children}
      {hint ? <span className="text-xs text-ink-subtle">{hint}</span> : null}
    </div>
  );
}

export function Stat({
  label,
  value,
  hint,
  tone = "ink",
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "ink" | "teal" | "rust" | "sage" | "amber";
}) {
  const valueClass =
    tone === "rust"
      ? "text-rust"
      : tone === "sage"
        ? "text-sage"
        : tone === "teal"
          ? "text-teal"
          : tone === "amber"
            ? "text-amber"
            : "text-ink";
  return (
    <div className="min-w-0">
      <p className="text-[0.65rem] font-medium uppercase tracking-[0.16em] text-ink-subtle">
        {label}
      </p>
      <p className={cn("mt-1 font-display text-2xl tabular-nums leading-none", valueClass)}>
        {value}
      </p>
      {hint ? <p className="mt-1.5 text-xs text-ink-muted">{hint}</p> : null}
    </div>
  );
}
