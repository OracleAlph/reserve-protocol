import { Link } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { RebaseCard } from "@/components/rebase-card";
import { Stat } from "@/components/section";
import {
  allGaitTrials,
  blankFields,
  classifyGaitDelta,
  formatRateConstant,
  halfLifeYears,
  rebaseForVisit,
  seriesAxes,
  visitAxes,
} from "@/lib/protocol/compute";
import { DETERMINANT_LABEL, type Person, type Visit } from "@/lib/protocol/types";
import { CONDITION_FIELDS, HOLES } from "@/lib/protocol/content";
import { formatKg, formatMs, kgToLb } from "@/lib/utils";

export function VisitReading({
  person,
  visit,
  visits,
}: {
  person: Person;
  visit: Visit;
  visits: Visit[];
}) {
  const series = seriesAxes(person.id, visits, person.criteria);
  const axes = visitAxes(visit, person.criteria);
  const first = series.visits[0] ?? null;
  const rebase = rebaseForVisit(visit, visits, person.criteria);
  const delta = classifyGaitDelta(
    axes.gait.level,
    first && first.visitId !== visit.id ? first.gait.level : null,
  );
  const trials = allGaitTrials(visit, person.criteria);
  const blanks = blankFields(visit);
  const hole = HOLES.find((h) => h.id === visit.determinantGuess);
  const slope = series.gaitSlope;
  const enters = axes.entersSlope;

  return (
    <div className="grid gap-5">
      <div className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)] sm:p-6">
        <p className="text-[0.65rem] font-medium uppercase tracking-[0.18em] text-ink-subtle">
          This visit · {visit.isoDate} · {visit.localTime}
        </p>
        <h2 className="mt-1 font-display text-2xl font-medium">
          {person.label}
        </h2>
        <p className="mt-1 text-sm text-ink-muted">
          Course {person.criteria.gaitCourseM} m · criterion {person.criteria.gaitCriterionMs} m/s ·{" "}
          {person.criteria.courseId}
        </p>
        <div className="mt-6 grid gap-6 sm:grid-cols-3">
          <Stat
            label="Level"
            value={formatMs(axes.gait.level)}
            hint="Median of the trials. Not the mean."
            tone="teal"
          />
          <Stat
            label="Dispersion"
            value={
              axes.gait.values.length
                ? `${axes.gait.belowCount} of ${axes.gait.values.length} below C`
                : "—"
            }
            hint={
              axes.gait.range != null
                ? `Range ${axes.gait.range.toFixed(2)} m/s. ${
                    axes.gait.levelClears
                      ? "Level still clears the line."
                      : axes.gait.levelClears === false
                        ? "Level does not clear the line."
                        : ""
                  }`
                : "Three trials make dispersion computable."
            }
            tone={axes.gait.belowCount > 0 ? "rust" : "sage"}
          />
          <Stat
            label="Slope"
            value={
              !enters
                ? "Excluded"
                : slope.kind === "rate-constant"
                  ? formatRateConstant(slope.k)
                  : slope.kind === "two-point"
                    ? `${slope.twoPointPerYear?.toFixed(3) ?? "—"} m/s·yr⁻¹`
                    : "Need 2+"
            }
            hint={
              !enters
                ? "If a field is blank, the visit cannot enter a slope calculation."
                : slope.kind === "rate-constant"
                  ? `Rate constant across ${slope.n} visits. ${halfLifeYears(slope.k) ?? "Rising or flat."}`
                  : slope.kind === "two-point"
                    ? "Observed two-point change rate. Named as such — not a rate constant."
                    : "A single measurement yields a level and nothing else."
            }
          />
        </div>
      </div>

      <div className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)] sm:p-6">
        <h3 className="font-display text-lg font-medium">Trials against the fixed criterion</h3>
        <p className="mt-1 text-sm text-ink-muted">
          Compare every trial against the criterion you set at the first visit and have not changed since.
        </p>
        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          {trials.map((t) => (
            <div
              key={t.i}
              className="flex items-center justify-between rounded-md bg-bg-elevated px-3 py-3"
            >
              <span className="text-sm text-ink-muted">Trial {t.i + 1}</span>
              <span className="tabular-nums font-medium">
                {t.time != null ? `${t.time.toFixed(2)} s` : "—"}{" "}
                <span className="text-ink-subtle">·</span> {formatMs(t.speed)}
              </span>
              {t.clears == null ? (
                <Badge variant="outline">blank</Badge>
              ) : t.clears ? (
                <Badge variant="sage">clears</Badge>
              ) : (
                <Badge variant="rust">below</Badge>
              )}
            </div>
          ))}
        </div>
        <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <p>
            <span className="text-ink-subtle">Chair rise · </span>
            {visit.chair.completed === false
              ? "Not completed — a failure is data, not a missing value."
              : visit.chair.completed
                ? `${visit.chair.timeSec?.toFixed(1) ?? "—"} s, completed`
                : "Blank"}
          </p>
          <p>
            <span className="text-ink-subtle">Grip median · </span>
            {formatKg(axes.grip.level)}
            {axes.grip.level != null ? ` (${kgToLb(axes.grip.level).toFixed(0)} lb)` : ""}
            {person.criteria.gripCriterionKg != null
              ? ` · ${axes.grip.belowCount} of ${axes.grip.values.length} below ${person.criteria.gripCriterionKg.toFixed(1)} kg`
              : " · no grip criterion held"}
          </p>
        </div>
        {delta.note ? (
          <p className="mt-4 border-t border-line pt-4 text-sm text-ink-muted">{delta.note}</p>
        ) : null}
      </div>

      <RebaseCard classification={rebase} />

      {visit.rebase.completedOriginalCourse === false ? (
        <div className="rounded-xl border border-rust/30 bg-rust-soft/50 p-5">
          <p className="text-[0.65rem] font-medium uppercase tracking-[0.16em] text-rust">
            Original course not completed
          </p>
          <p className="mt-2 text-sm">
            Fail against the original criterion. Substitute named separately:{" "}
            <span className="font-medium">{visit.rebase.substituteTask || "unnamed"}</span>. Do not
            overwrite the old criterion. A shorter hallway is not a stable gait speed.
          </p>
        </div>
      ) : null}

      {blanks.length > 0 ? (
        <div className="rounded-xl bg-amber-soft/60 p-5 text-sm">
          <p className="font-medium">Blank means unknown; it does not mean normal.</p>
          <p className="mt-1 text-ink-muted">{blanks.join(" · ")}</p>
        </div>
      ) : null}

      <div className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)] sm:p-6">
        <h3 className="font-display text-lg font-medium">Condition of measurement</h3>
        <p className="mt-1 text-sm text-ink-muted">Five fields. The whole cost.</p>
        <dl className="mt-4 grid gap-3 sm:grid-cols-2">
          {CONDITION_FIELDS.map((f) => (
            <div key={f.key}>
              <dt className="text-xs uppercase tracking-[0.14em] text-ink-subtle">{f.label}</dt>
              <dd className="mt-1 text-sm">{visit.condition[f.key] || "—"}</dd>
            </div>
          ))}
        </dl>
        {visit.labsThisVisit.trim() ? (
          <p className="mt-4 border-t border-line pt-4 text-sm">
            <span className="text-ink-subtle">Labs this visit · </span>
            {visit.labsThisVisit}
          </p>
        ) : null}
      </div>

      <div className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)] sm:p-6">
        <p className="text-[0.65rem] font-medium uppercase tracking-[0.16em] text-ink-subtle">
          Determinant named
        </p>
        <h3 className="mt-1 font-display text-lg font-medium">
          {DETERMINANT_LABEL[visit.determinantGuess]}
        </h3>
        <p className="mt-1 text-sm text-ink-muted">Guessing is allowed. Changing the guess later is the point.</p>
        {hole ? (
          <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-ink-subtle">First lever</p>
              <p className="mt-1">{hole.firstLever}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-ink-subtle">Do not start here</p>
              <p className="mt-1">{hole.doNot}</p>
            </div>
          </div>
        ) : null}
        <p className="mt-4 flex flex-wrap gap-4 text-sm">
          <Link to="/effect" className="font-medium text-teal underline-offset-4 hover:underline">
            Open the hole map
          </Link>
          <Link to="/panel" className="font-medium text-teal underline-offset-4 hover:underline">
            Open the determinant panel
          </Link>
        </p>
      </div>
    </div>
  );
}
