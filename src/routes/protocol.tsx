import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { InstrumentBadge } from "@/components/instrument-badge";
import {
  CITATIONS,
  CLINIC_CARD_STEPS,
  CONDITION_FIELDS,
  CROSS_CUTTING,
  DETERMINANT_PANEL,
  OBJECT,
  OPERATING_RULE,
  QUANTITIES,
  RULES,
  STATUS_LINE,
  TIER_LEGEND,
  TIER_ONE_DETAIL,
  TIER_TWO_DETAIL,
  TIERS,
  WHAT_THIS_IS_NOT,
} from "@/lib/protocol/content";
import { GAIT_MDC95, MUTCD_CLEARANCE_MS, MUTCD_COMBINED_MS, MUTCD_EDITION, MUTCD_EDITION_YEAR, MUTCD_SECTION } from "@/lib/protocol/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/protocol")({ component: ProtocolPage });

function ProtocolPage() {
  const [tier, setTier] = useState<(typeof TIERS)[number]["id"]>("one");
  const [det, setDet] = useState<(typeof DETERMINANT_PANEL)[number]["id"]>("I");
  const panel = DETERMINANT_PANEL.find((d) => d.id === det) ?? DETERMINANT_PANEL[0]!;

  return (
    <article className="grid gap-10">
      <header>
        <Badge variant="outline">{STATUS_LINE}</Badge>
        <h1 className="mt-4 font-display text-4xl font-medium leading-tight">
          The measurement specification
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-ink-muted">{OBJECT}</p>
        <p className="mt-3 max-w-2xl text-sm text-ink-muted">
          A framework without an instrument is a position. A framework with one is a program,
          because other people can run it and report back. This file fills limitation five of the
          Life paper.
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          <Button asChild>
            <Link to="/visit">Run Tier One</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/loaded">Run Tier Two</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/panel">Open Tier Three</Link>
          </Button>
        </div>
      </header>

      <section>
        <h2 className="font-display text-2xl font-medium">Six quantities, kept apart</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {QUANTITIES.map((q, i) => (
            <div key={q.name} className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)]">
              <p className="text-[0.65rem] uppercase tracking-[0.16em] text-teal">
                {String(i + 1).padStart(2, "0")} · {q.clock}
              </p>
              <h3 className="mt-2 font-display text-xl font-medium">{q.name}</h3>
              <p className="mt-2 text-sm text-ink-muted">{q.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-display text-2xl font-medium">The eight rules</h2>
        <p className="mt-2 max-w-2xl text-sm text-ink-muted">
          Every procedure follows from these. They are drawn from the published paper and the four
          measurement manuscripts.
        </p>
        <ol className="mt-6 grid gap-4">
          {RULES.map((rule) => (
            <li
              key={rule.n}
              className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)] sm:p-6"
            >
              <p className="font-display text-2xl text-teal tabular-nums">{rule.n}</p>
              <h3 className="mt-1 font-display text-xl font-medium">{rule.title}</h3>
              <p className="mt-1 text-xs uppercase tracking-[0.14em] text-ink-subtle">
                {rule.source}
              </p>
              <p className="mt-3 text-sm">{rule.body}</p>
              <p className="mt-3 border-t border-line pt-3 text-sm text-ink-muted">
                {rule.practice}
              </p>
            </li>
          ))}
        </ol>
        <p className="mt-4 rounded-lg bg-teal-soft/70 px-4 py-3 text-sm">{OPERATING_RULE}</p>
      </section>

      <section>
        <h2 className="font-display text-2xl font-medium">Three tiers</h2>
        <p className="mt-2 max-w-2xl text-sm text-ink-muted">
          Each is complete in itself. Tier One data are a strict subset of Tier Three and can be
          pooled with them. A clinic that can only run Tier One should run Tier One rather than
          nothing.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {TIERS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTier(t.id)}
              className={cn(
                "min-h-11 rounded-sm px-4 text-sm font-medium transition-colors duration-150",
                tier === t.id ? "bg-teal text-teal-fg" : "bg-surface text-ink hover:bg-teal-soft",
              )}
            >
              {t.id === "one" ? "One · clinic" : t.id === "two" ? "Two · loaded" : "Three · panel"}
            </button>
          ))}
        </div>

        {tier === "one" ? (
          <div className="mt-4 grid gap-4">
            <div className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)] sm:p-6">
              <h3 className="font-display text-xl font-medium">{TIERS[0].name}</h3>
              <p className="mt-1 text-xs uppercase tracking-[0.14em] text-ink-subtle">
                {TIERS[0].time} · {TIERS[0].kit}
              </p>
              <p className="mt-3 text-sm text-ink-muted">{TIERS[0].body}</p>
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)]">
                <h4 className="font-display text-lg font-medium">What is measured</h4>
                <ul className="mt-3 grid gap-3">
                  {TIER_ONE_DETAIL.measured.map((m) => (
                    <li key={m.name}>
                      <p className="text-sm font-medium">{m.name}</p>
                      <p className="mt-1 text-sm text-ink-muted">{m.body}</p>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)]">
                <h4 className="font-display text-lg font-medium">What is computed</h4>
                <ul className="mt-3 grid gap-2 text-sm text-ink-muted">
                  {TIER_ONE_DETAIL.computed.map((line) => (
                    <li key={line} className="border-t border-line pt-2 first:border-0 first:pt-0">
                      {line}
                    </li>
                  ))}
                </ul>
                <Button asChild className="mt-5">
                  <Link to="/visit">Open the clinic card</Link>
                </Button>
              </div>
            </div>
          </div>
        ) : null}

        {tier === "two" ? (
          <div className="mt-4 grid gap-4">
            <div className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)] sm:p-6">
              <h3 className="font-display text-xl font-medium">{TIERS[1].name}</h3>
              <p className="mt-1 text-xs uppercase tracking-[0.14em] text-ink-subtle">
                {TIERS[1].time} · {TIERS[1].kit}
              </p>
              <p className="mt-3 text-sm text-ink-muted">{TIERS[1].body}</p>
              <p className="mt-3 text-sm text-ink-muted">{TIER_TWO_DETAIL.setting}</p>
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)]">
                <h4 className="font-display text-lg font-medium">{TIER_TWO_DETAIL.load.title}</h4>
                <ol className="mt-3 grid gap-2">
                  {TIER_TWO_DETAIL.load.requirements.map((req, i) => (
                    <li key={req} className="flex gap-3 text-sm">
                      <span className="font-display text-teal tabular-nums">{i + 1}</span>
                      <span>{req}</span>
                    </li>
                  ))}
                </ol>
                <p className="mt-4 text-sm text-ink-muted">{TIER_TWO_DETAIL.load.note}</p>
              </div>
              <div className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)]">
                <h4 className="font-display text-lg font-medium">{TIER_TWO_DETAIL.recovery.title}</h4>
                <ol className="mt-3 grid gap-3">
                  {TIER_TWO_DETAIL.recovery.steps.map((step, i) => (
                    <li key={step} className="flex gap-3 text-sm text-ink-muted">
                      <span className="font-display text-teal tabular-nums">{i + 1}</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
                <p className="mt-4 text-sm">{TIER_TWO_DETAIL.recovery.note}</p>
              </div>
            </div>
            <div className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)]">
              <h4 className="font-display text-lg font-medium">Markers the same logic covers</h4>
              <p className="mt-2 text-sm text-ink-muted">
                Any marker with a resting value and a load response. The specification does not
                name the bout.
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {TIER_TWO_DETAIL.markers.map((m) => (
                  <div key={m.name} className="rounded-lg bg-bg-elevated p-4">
                    <p className="text-sm font-medium">
                      {m.name}
                      {m.unit ? <span className="ml-2 text-ink-subtle">{m.unit}</span> : null}
                    </p>
                    <p className="mt-1 text-sm text-ink-muted">{m.why}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)]">
              <h4 className="font-display text-lg font-medium">
                Condition-of-measurement record · five fields
              </h4>
              <p className="mt-2 text-sm text-ink-muted">
                This is the minimum reporting standard, and its whole cost is five fields.
              </p>
              <ol className="mt-4 grid gap-2 sm:grid-cols-2">
                {CONDITION_FIELDS.map((f, i) => (
                  <li key={f.key} className="rounded-lg bg-bg-elevated px-4 py-3">
                    <p className="text-sm font-medium">
                      <span className="mr-2 font-display text-teal tabular-nums">{i + 1}</span>
                      {f.label}
                    </p>
                    <p className="mt-1 text-xs text-ink-subtle">{f.hint}</p>
                  </li>
                ))}
              </ol>
              <Button asChild className="mt-5">
                <Link to="/loaded">Record a loaded bout</Link>
              </Button>
            </div>
          </div>
        ) : null}

        {tier === "three" ? (
          <div className="mt-4 grid gap-4">
            <div className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)] sm:p-6">
              <h3 className="font-display text-xl font-medium">{TIERS[2].name}</h3>
              <p className="mt-1 text-xs uppercase tracking-[0.14em] text-ink-subtle">
                {TIERS[2].time} · {TIERS[2].kit}
              </p>
              <p className="mt-3 text-sm text-ink-muted">{TIERS[2].body}</p>
              <p className="mt-3 text-sm text-ink-muted">
                Nothing here is new; the contribution is the interval, the condition record and the
                fixed criteria. Tiers follow the source literature for the component test, not for
                reserve estimation.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {TIER_LEGEND.map((item) => (
                <div
                  key={item.status}
                  className="flex min-h-11 items-center gap-2 rounded-sm bg-surface px-3 py-2 shadow-[var(--shadow-border)]"
                >
                  <InstrumentBadge status={item.status} />
                  <span className="text-xs text-ink-muted">{item.rule}</span>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {DETERMINANT_PANEL.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setDet(d.id)}
                  className={cn(
                    "min-h-11 rounded-sm px-4 text-sm font-medium transition-colors duration-150",
                    det === d.id ? "bg-teal text-teal-fg" : "bg-surface text-ink hover:bg-teal-soft",
                  )}
                >
                  {d.id} · {d.name}
                </button>
              ))}
            </div>
            <div className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)] sm:p-6">
              <p className="text-[0.65rem] uppercase tracking-[0.16em] text-ink-subtle">
                {panel.evidence}
              </p>
              <h4 className="mt-1 font-display text-2xl font-medium">
                {panel.id} · {panel.name}
              </h4>
              <p className="mt-3 max-w-3xl text-sm text-ink-muted">{panel.thesis}</p>
              <div className="mt-5 overflow-x-auto">
                <table className="w-full min-w-[40rem] text-left text-sm">
                  <thead className="border-b border-line text-[0.65rem] uppercase tracking-[0.14em] text-ink-subtle">
                    <tr>
                      <th className="px-3 py-3 font-medium">Measure</th>
                      <th className="px-3 py-3 font-medium">How</th>
                      <th className="px-3 py-3 font-medium">Interval / condition</th>
                      <th className="px-3 py-3 font-medium">Tier</th>
                    </tr>
                  </thead>
                  <tbody>
                    {panel.measures.map((m) => (
                      <tr key={m.id} className="border-b border-line/80 last:border-0">
                        <td className="px-3 py-3 font-medium">{m.name}</td>
                        <td className="px-3 py-3 text-ink-muted">{m.how}</td>
                        <td className="px-3 py-3 text-ink-muted">{m.interval}</td>
                        <td className="px-3 py-3">
                          <InstrumentBadge status={m.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {panel.clinicMinimum ? (
                <p className="mt-4 rounded-lg bg-sage-soft/70 px-4 py-3 text-sm">
                  {panel.clinicMinimum}
                </p>
              ) : null}
              {panel.note ? (
                <p className="mt-3 rounded-lg bg-amber-soft/70 px-4 py-3 text-sm">{panel.note}</p>
              ) : null}
            </div>
            <p className="rounded-xl bg-surface px-5 py-4 text-sm text-ink-muted shadow-[var(--shadow-border)]">
              {CROSS_CUTTING}
            </p>
            <div>
              <Button asChild>
                <Link to="/panel">Record the determinant panel</Link>
              </Button>
            </div>
          </div>
        ) : null}
      </section>

      <section>
        <h2 className="font-display text-2xl font-medium">The one-page clinic card</h2>
        <ol className="mt-4 grid gap-2">
          {CLINIC_CARD_STEPS.map((step, i) => (
            <li
              key={step}
              className="flex gap-3 rounded-lg bg-surface px-4 py-3 text-sm shadow-[var(--shadow-border)]"
            >
              <span className="font-display text-lg text-teal tabular-nums">{i + 1}</span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
        <p className="mt-4 text-sm text-ink-muted">
          The reserve is not in any single number on the card. It is in the distance between what
          the person can still do and what their week still asks — and in how many of the three
          trials fell below a line that has not moved.
        </p>
      </section>

      <section className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)] sm:p-6">
        <h2 className="font-display text-xl font-medium">Fixed criteria</h2>
        <ul className="mt-3 grid gap-3 text-sm text-ink-muted">
          <li>
            <span className="font-medium text-ink">Gait. </span>
            MUTCD {MUTCD_EDITION} ({MUTCD_EDITION_YEAR}), §{MUTCD_SECTION}, sets pedestrian
            clearance on {MUTCD_CLEARANCE_MS} m/s (3.5 ft/s) and the combined interval on{" "}
            {MUTCD_COMBINED_MS} m/s (3.0 ft/s). The higher figure is a design assumption, not a
            clinical threshold. It is used here only because it does not move.
          </li>
          <li>
            <span className="font-medium text-ink">Chair rise. </span>
            Binary: completed without hands, or not. A failure is data.
          </li>
          <li>
            <span className="font-medium text-ink">Grip. </span>
            No validated everyday-task criterion was found. Twenty pounds is an operating
            convention. Rice, Leonard and Carter found only weak correlation with container-opening
            force (r from −.179 to .333). A clinic that wants a grip criterion must state its own
            and hold it.
          </li>
          <li>
            <span className="font-medium text-ink">Meaningful change, gait. </span>
            Small 0.04–0.06 m/s; substantial 0.08–0.14 m/s (Perera et al., 2006). MDC95 ={" "}
            {GAIT_MDC95} m/s (Middleton et al., 2015). Performance falls only when the visit-median
            declines by more than {GAIT_MDC95} m/s from the first visit, or a trial newly drops
            below the fixed {MUTCD_CLEARANCE_MS} m/s criterion. Anything smaller is no change.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="font-display text-2xl font-medium">What this specification does not do</h2>
        <ul className="mt-4 grid gap-2">
          {WHAT_THIS_IS_NOT.map((line) => (
            <li
              key={line}
              className="rounded-lg border border-line bg-bg-elevated px-4 py-3 text-sm"
            >
              {line}
            </li>
          ))}
        </ul>
      </section>

      <section className="text-xs text-ink-subtle">
        <h2 className="font-display text-sm font-medium text-ink">Sources</h2>
        <ul className="mt-2 grid gap-1">
          {CITATIONS.map((c) => (
            <li key={c.id}>{c.text}</li>
          ))}
        </ul>
      </section>
    </article>
  );
}
