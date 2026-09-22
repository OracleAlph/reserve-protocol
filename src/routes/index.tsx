import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RebaseCard } from "@/components/rebase-card";
import { Stat } from "@/components/section";
import {
  CITATIONS,
  OBJECT,
  OPENING_CASE,
  QUANTITIES,
  STATUS_LINE,
} from "@/lib/protocol/content";
import {
  fitRecoveryRateConstant,
  formatRecoveryK,
  rebaseForVisit,
  restingValue,
  seriesAxes,
  visitsChronological,
} from "@/lib/protocol/compute";
import { EXAMPLE_PERSON_ID } from "@/lib/protocol/seed";
import { useProtocolStore } from "@/lib/protocol/store";
import { formatMs } from "@/lib/utils";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const hydrated = useProtocolStore((s) => s.hydrated);
  const people = useProtocolStore((s) => s.people);
  const visits = useProtocolStore((s) => s.visits);
  const loadedBouts = useProtocolStore((s) => s.loadedBouts);
  const person =
    people.find((p) => p.id === EXAMPLE_PERSON_ID) ?? people[0] ?? null;
  const seriesVisits = person
    ? visitsChronological(visits.filter((v) => v.personId === person.id))
    : [];
  const last = seriesVisits.at(-1) ?? null;
  const axes = person ? seriesAxes(person.id, visits, person.criteria) : null;
  const lastAxes = axes?.visits.at(-1) ?? null;
  const rebase =
    person && last ? rebaseForVisit(last, seriesVisits, person.criteria) : null;
  const lastBout = person
    ? loadedBouts
        .filter((b) => b.personId === person.id)
        .sort((a, b) => b.isoDate.localeCompare(a.isoDate))[0]
    : null;
  const recovery =
    lastBout && restingValue(lastBout) != null
      ? fitRecoveryRateConstant(restingValue(lastBout)!, lastBout.samples)
      : null;

  return (
    <div className="grid gap-10">
      <section className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
        <div>
          <Badge variant="outline">{STATUS_LINE}</Badge>
          <h1 className="mt-4 font-display text-[2.15rem] font-medium leading-[1.12] tracking-tight text-ink sm:text-5xl">
            Functional reserve is capacity minus demand.
          </h1>
          <p className="mt-5 max-w-xl text-lg text-ink-muted">{OBJECT}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link to="/visit">
                Open the clinic card
                <ArrowRight />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/protocol">Read the eight rules</Link>
            </Button>
          </div>
        </div>
        <blockquote className="rounded-xl bg-teal px-5 py-6 text-teal-fg sm:px-6">
          <p className="font-display text-2xl italic leading-snug">
            “{OPENING_CASE.quote}”
          </p>
          <p className="mt-4 text-sm text-teal-fg/80">{OPENING_CASE.body}</p>
        </blockquote>
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        {[
          {
            kicker: "Tier One",
            title: "The clinic card",
            body: "Fifteen minutes. Stopwatch, marked corridor, chair, dynamometer. Three trials, all recorded.",
            to: "/visit" as const,
          },
          {
            kicker: "Tier Two",
            title: "The loaded protocol",
            body: "A specified bout, two restings, sampling out to six hours. The quantity is the rate of return.",
            to: "/loaded" as const,
          },
          {
            kicker: "Tier Three",
            title: "The determinant panel",
            body: "Five determinants, mapped onto validated, candidate, and exploratory instruments. No composite.",
            to: "/panel" as const,
          },
        ].map((card) => (
          <Link
            key={card.title}
            to={card.to}
            className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)] transition-[transform,box-shadow] duration-150 hover:-translate-y-0.5"
          >
            <p className="text-[0.65rem] font-medium uppercase tracking-[0.18em] text-teal">
              {card.kicker}
            </p>
            <h2 className="mt-2 font-display text-xl font-medium">{card.title}</h2>
            <p className="mt-2 text-sm text-ink-muted">{card.body}</p>
          </Link>
        ))}
      </section>

      <section>
        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <p className="text-[0.65rem] font-medium uppercase tracking-[0.18em] text-ink-subtle">
              Teaching series
            </p>
            <h2 className="font-display text-2xl font-medium">
              {person?.label ?? "No series yet"}
            </h2>
          </div>
          {person ? (
            <Button asChild variant="outline" size="sm">
              <Link to="/series/$personId" params={{ personId: person.id }}>
                Open series
              </Link>
            </Button>
          ) : null}
        </div>
        {last && lastAxes && rebase ? (
          <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
            <div className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)]">
              <div className="grid grid-cols-3 gap-4">
                <Stat label="Level" value={formatMs(lastAxes.gait.level)} tone="teal" />
                <Stat
                  label="Below C"
                  value={`${lastAxes.gait.belowCount}/${lastAxes.gait.values.length}`}
                  tone={lastAxes.gait.belowCount > 0 ? "rust" : "sage"}
                />
                <Stat
                  label="Return k"
                  value={recovery ? formatRecoveryK(recovery.k) : "—"}
                  hint={
                    lastBout == null
                      ? "No loaded bout yet."
                      : recovery?.halfLifeHours != null
                        ? `t½ ${recovery.halfLifeHours.toFixed(1)} h`
                        : "Need three samples away from rest."
                  }
                />
              </div>
              <p className="mt-4 text-sm text-ink-muted">
                Last visit {last.isoDate}. Criterion {person?.criteria.gaitCriterionMs} m/s,
                never moved.
              </p>
            </div>
            <RebaseCard classification={rebase} />
          </div>
        ) : !hydrated ? (
          <p className="text-sm text-ink-muted">Loading stored visits…</p>
        ) : (
          <p className="text-sm text-ink-muted">
            Record a first visit. A single measurement is a point.
          </p>
        )}
      </section>

      <section className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)] sm:p-6">
        <h2 className="font-display text-xl font-medium">Six quantities, kept apart</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {QUANTITIES.map((q) => (
            <div key={q.name} className="border-t border-line pt-3">
              <p className="text-[0.65rem] uppercase tracking-[0.16em] text-ink-subtle">
                {q.clock}
              </p>
              <h3 className="mt-1 font-medium">{q.name}</h3>
              <p className="mt-1 text-sm text-ink-muted">{q.body}</p>
            </div>
          ))}
        </div>
      </section>

      <p className="text-xs text-ink-subtle">
        {CITATIONS[0]?.text} This instrument fills limitation five of that paper: the
        framework specifies what must be preserved and supplies no standardized instrument.
      </p>
    </div>
  );
}
