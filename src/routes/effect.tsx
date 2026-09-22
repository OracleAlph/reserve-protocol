import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { HOLES } from "@/lib/protocol/content";
import type { Determinant } from "@/lib/protocol/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/effect")({ component: EffectPage });

function EffectPage() {
  const [open, setOpen] = useState<Determinant>("I");
  const hole = HOLES.find((h) => h.id === open) ?? HOLES[0]!;

  return (
    <div className="grid gap-8">
      <header>
        <p className="text-[0.65rem] font-medium uppercase tracking-[0.18em] text-ink-subtle">
          Maps measurement to the intervention layer without writing a dose
        </p>
        <h1 className="mt-2 font-display text-4xl font-medium leading-tight">
          What to do with a hole
        </h1>
        <p className="mt-4 max-w-2xl text-ink-muted">
          Name the determinant before you name the tool. This page does not select treatment.
          The protocol does not select treatment until reliability, condition effects and
          incremental prediction beyond level are shown.
        </p>
      </header>

      <div className="flex flex-wrap gap-2">
        {HOLES.map((h) => (
          <button
            key={h.id}
            type="button"
            onClick={() => setOpen(h.id)}
            className={cn(
              "min-h-11 rounded-sm px-4 text-sm font-medium transition-colors duration-150",
              open === h.id ? "bg-teal text-teal-fg" : "bg-surface text-ink hover:bg-teal-soft",
            )}
          >
            {h.id} · {h.name}
          </button>
        ))}
      </div>

      <section className="rounded-xl bg-surface p-6 shadow-[var(--shadow-border)]">
        <p className="text-[0.65rem] uppercase tracking-[0.16em] text-ink-subtle">
          {hole.evidence}
        </p>
        <h2 className="mt-2 font-display text-2xl font-medium">
          {hole.id} · {hole.name}
        </h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <div className="rounded-lg bg-sage-soft/70 p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-sage">First lever</p>
            <p className="mt-2 text-sm">{hole.firstLever}</p>
          </div>
          <div className="rounded-lg bg-rust-soft/70 p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-rust">Do not start here</p>
            <p className="mt-2 text-sm">{hole.doNot}</p>
          </div>
        </div>
      </section>

      <section className="overflow-x-auto rounded-xl bg-surface shadow-[var(--shadow-border)]">
        <table className="w-full min-w-[36rem] text-left text-sm">
          <thead className="border-b border-line text-[0.65rem] uppercase tracking-[0.14em] text-ink-subtle">
            <tr>
              <th className="px-4 py-3 font-medium">Hole</th>
              <th className="px-4 py-3 font-medium">First lever the framework names</th>
              <th className="px-4 py-3 font-medium">Do not start here</th>
            </tr>
          </thead>
          <tbody>
            {HOLES.map((h) => (
              <tr
                key={h.id}
                className={cn(
                  "border-b border-line/80 last:border-0",
                  open === h.id && "bg-teal-soft/40",
                )}
              >
                <td className="px-4 py-3 font-medium">
                  {h.id} · {h.name}
                </td>
                <td className="px-4 py-3 text-ink-muted">{h.firstLever}</td>
                <td className="px-4 py-3 text-ink-muted">{h.doNot}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)]">
          <h2 className="font-display text-xl font-medium">One-person check on precedence</h2>
          <p className="mt-3 text-sm text-ink-muted">
            If I is clearly deficient and an intervention aimed at III to V is given anyway,
            record the effect. The framework predicts attenuation of at least 30 percent. One
            well-documented attenuation, or its absence, is useful.
          </p>
        </div>
        <div className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)]">
          <h2 className="font-display text-xl font-medium">One-person check on the governor</h2>
          <p className="mt-3 text-sm text-ink-muted">
            Low RMSSD or high chronic cortisol at the start of a training block. Compare
            trainability of I against people with intact V. The framework predicts reduced
            trainability.
          </p>
        </div>
      </section>

      <p className="text-sm text-ink-muted">
        Clinic minimum when VO₂ is unavailable: marked-course gait speed, grip, and a stated stair
        test — two flights, same building, time and conversation at the top. Conversation at the
        top is the load, not the charm.
      </p>

      <div className="flex flex-wrap gap-2">
        <Button asChild>
          <Link to="/visit">Take a visit</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/panel">Open the determinant panel</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/compute">Keep the clocks apart</Link>
        </Button>
      </div>
    </div>
  );
}
