import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { PersonDialog } from "@/components/person-dialog";
import { Stat } from "@/components/section";
import { seriesAxes, visitsChronological } from "@/lib/protocol/compute";
import { useProtocolStore } from "@/lib/protocol/store";
import { formatMs } from "@/lib/utils";

export const Route = createFileRoute("/series/")({ component: SeriesIndex });

function SeriesIndex() {
  const hydrated = useProtocolStore((s) => s.hydrated);
  const people = useProtocolStore((s) => s.people);
  const visits = useProtocolStore((s) => s.visits);
  const restoreExamples = useProtocolStore((s) => s.restoreExamples);
  const [open, setOpen] = useState(false);

  if (!hydrated && people.length === 0) {
    return <p className="text-sm text-ink-muted">Loading series…</p>;
  }

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[0.65rem] font-medium uppercase tracking-[0.18em] text-ink-subtle">
            Longitudinal
          </p>
          <h1 className="font-display text-3xl font-medium">Series</h1>
          <p className="mt-2 max-w-xl text-sm text-ink-muted">
            Stored on this device. Two visits yield a slope contaminated by error. Enough yield a
            slope and a dispersion, which is the point.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => restoreExamples()}>
            Restore examples
          </Button>
          <Button onClick={() => setOpen(true)}>New series</Button>
        </div>
      </div>
      {people.length === 0 ? (
        <div className="rounded-xl bg-surface p-6 text-sm text-ink-muted shadow-[var(--shadow-border)]">
          No series yet. Open one, lock a course, and take the first visit.
        </div>
      ) : (
        <div className="grid gap-3">
          {people.map((person) => {
            const pv = visitsChronological(visits.filter((v) => v.personId === person.id));
            const axes = seriesAxes(person.id, pv, person.criteria);
            const last = axes.visits.at(-1);
            return (
              <Link
                key={person.id}
                to="/series/$personId"
                params={{ personId: person.id }}
                className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)] transition-[transform] duration-150 hover:-translate-y-0.5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="font-display text-xl font-medium">{person.label}</h2>
                    <p className="mt-1 text-sm text-ink-muted">
                      {person.criteria.courseId} · {person.criteria.gaitCourseM} m · C{" "}
                      {person.criteria.gaitCriterionMs} m/s
                      {person.criteriaLocked ? " · locked" : " · unlocked"}
                    </p>
                  </div>
                  <p className="text-sm text-ink-subtle tabular-nums">{pv.length} visits</p>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-3">
                  <Stat label="Last level" value={formatMs(last?.gait.level ?? null)} />
                  <Stat
                    label="Last below C"
                    value={last ? `${last.gait.belowCount}/${last.gait.values.length}` : "—"}
                    tone={last && last.gait.belowCount > 0 ? "rust" : "ink"}
                  />
                  <Stat
                    label="Slope"
                    value={
                      axes.gaitSlope.kind === "rate-constant"
                        ? `${axes.gaitSlope.k?.toFixed(3)} yr⁻¹`
                        : axes.gaitSlope.kind === "two-point"
                          ? "two-point"
                          : "—"
                    }
                  />
                </div>
              </Link>
            );
          })}
        </div>
      )}
      <PersonDialog open={open} onOpenChange={setOpen} />
    </div>
  );
}
