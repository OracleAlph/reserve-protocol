import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { TrajectoryChart } from "@/components/trajectory-chart";
import { RecoveryChart } from "@/components/recovery-chart";
import { RebaseCard } from "@/components/rebase-card";
import { Stat } from "@/components/section";
import { DETERMINANT_PANEL } from "@/lib/protocol/content";
import {
  fitRecoveryRateConstant,
  formatRateConstant,
  formatRecoveryK,
  halfLifeYears,
  panelInventory,
  PATTERN_LABEL,
  rebaseForVisit,
  restingValue,
  seriesAxes,
  visitAxes,
  visitsChronological,
} from "@/lib/protocol/compute";
import { useProtocolStore } from "@/lib/protocol/store";
import { formatKg, formatMs } from "@/lib/utils";

export const Route = createFileRoute("/series/$personId")({
  component: SeriesDetail,
});

function SeriesDetail() {
  const { personId } = Route.useParams();
  const navigate = useNavigate();
  const person = useProtocolStore((s) => s.people.find((p) => p.id === personId));
  const allVisits = useProtocolStore((s) => s.visits);
  const allLoaded = useProtocolStore((s) => s.loadedBouts);
  const allPanels = useProtocolStore((s) => s.panelReadings);
  const removePerson = useProtocolStore((s) => s.removePerson);
  const removeVisit = useProtocolStore((s) => s.removeVisit);
  const visits = useMemo(
    () => visitsChronological(allVisits.filter((v) => v.personId === personId)),
    [allVisits, personId],
  );
  const loadedBouts = useMemo(
    () => allLoaded.filter((b) => b.personId === personId),
    [allLoaded, personId],
  );
  const panelReadings = useMemo(
    () => allPanels.filter((r) => r.personId === personId),
    [allPanels, personId],
  );

  if (!person) {
    return (
      <div>
        <h1 className="font-display text-2xl">Series not found</h1>
        <Button asChild className="mt-4" variant="outline">
          <Link to="/series">All series</Link>
        </Button>
      </div>
    );
  }

  const axes = seriesAxes(person.id, visits, person.criteria);
  const last = axes.visits.at(-1);
  const lastBout = [...loadedBouts].sort((a, b) => b.isoDate.localeCompare(a.isoDate))[0];
  const lastRecovery =
    lastBout && restingValue(lastBout) != null
      ? fitRecoveryRateConstant(restingValue(lastBout)!, lastBout.samples)
      : null;
  const lastPanel = [...panelReadings].sort((a, b) => b.isoDate.localeCompare(a.isoDate))[0];
  const lastInv = lastPanel ? panelInventory(lastPanel.values) : null;
  const exportJson = () => {
    const blob = new Blob(
      [JSON.stringify({ person, visits, loadedBouts, panelReadings }, null, 2)],
      { type: "application/json" },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${person.label.replace(/\s+/g, "-").toLowerCase()}-reserve.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[0.65rem] font-medium uppercase tracking-[0.18em] text-ink-subtle">
            {person.criteria.courseId}
          </p>
          <h1 className="font-display text-3xl font-medium">{person.label}</h1>
          {person.notes ? <p className="mt-2 max-w-xl text-sm text-ink-muted">{person.notes}</p> : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={exportJson}>
            Export JSON
          </Button>
          <Button asChild variant="outline">
            <Link to="/loaded">Loaded bout</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/panel">Panel</Link>
          </Button>
          <Button asChild>
            <Link to="/visit" search={{ personId: person.id }}>
              New visit
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)]">
          <Stat label="Level (last)" value={formatMs(last?.gait.level ?? null)} tone="teal" />
        </div>
        <div className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)]">
          <Stat
            label="Slope"
            value={
              axes.gaitSlope.kind === "rate-constant"
                ? formatRateConstant(axes.gaitSlope.k)
                : axes.gaitSlope.kind === "two-point"
                  ? `${axes.gaitSlope.twoPointPerYear?.toFixed(3)} m/s·yr⁻¹`
                  : "—"
            }
            hint={
              axes.gaitSlope.kind === "rate-constant"
                ? halfLifeYears(axes.gaitSlope.k) ?? "Non-negative k."
                : axes.gaitSlope.kind === "two-point"
                  ? "Two-point change rate — not a rate constant."
                  : "Need three visits on the original course."
            }
          />
        </div>
        <div className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)]">
          <Stat
            label="Dispersion (last)"
            value={last ? `${last.gait.belowCount} of ${last.gait.values.length}` : "—"}
            hint="Trials below the fixed criterion."
            tone={last && last.gait.belowCount > 0 ? "rust" : "sage"}
          />
        </div>
        <div className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)]">
          <Stat
            label="Return k"
            value={lastRecovery ? formatRecoveryK(lastRecovery.k) : "—"}
            hint={
              lastBout == null
                ? "No loaded bout yet."
                : lastRecovery?.halfLifeHours != null
                  ? `t½ ${lastRecovery.halfLifeHours.toFixed(2)} h · hours-scale`
                  : "Need three samples away from rest."
            }
            tone={lastRecovery && lastRecovery.k < 0 ? "teal" : "ink"}
          />
        </div>
      </div>

      <div className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)] sm:p-6">
        <h2 className="font-display text-lg font-medium">Gait against the unmoved line</h2>
        <p className="mb-4 mt-1 text-sm text-ink-muted">
          Criterion {person.criteria.gaitCriterionMs} m/s. Same marked course. Same time of day
          within ninety minutes.
        </p>
        <TrajectoryChart visits={visits} criteria={person.criteria} />
      </div>

      <div className="overflow-x-auto rounded-xl bg-surface shadow-[var(--shadow-border)]">
        <table className="w-full min-w-[40rem] text-left text-sm">
          <thead className="border-b border-line text-[0.65rem] uppercase tracking-[0.14em] text-ink-subtle">
            <tr>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Level</th>
              <th className="px-4 py-3 font-medium">Below C</th>
              <th className="px-4 py-3 font-medium">Chair</th>
              <th className="px-4 py-3 font-medium">Grip</th>
              <th className="px-4 py-3 font-medium">Original</th>
              <th className="px-4 py-3 font-medium">Pattern</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {visits.map((visit) => {
              const va = visitAxes(visit, person.criteria);
              const rebase = rebaseForVisit(visit, visits, person.criteria);
              return (
                <tr key={visit.id} className="border-b border-line/80 last:border-0">
                  <td className="px-4 py-3 tabular-nums">
                    <Link
                      to="/visit/$visitId"
                      params={{ visitId: visit.id }}
                      className="font-medium text-teal underline-offset-4 hover:underline"
                    >
                      {visit.isoDate}
                    </Link>
                    <span className="ml-2 text-ink-subtle">{visit.localTime}</span>
                  </td>
                  <td className="px-4 py-3 tabular-nums">{formatMs(va.gait.level)}</td>
                  <td className="px-4 py-3 tabular-nums">
                    {va.gait.belowCount}/{va.gait.values.length}
                  </td>
                  <td className="px-4 py-3">
                    {visit.chair.completed === false
                      ? "Fail"
                      : visit.chair.timeSec != null
                        ? `${visit.chair.timeSec.toFixed(1)} s`
                        : "—"}
                  </td>
                  <td className="px-4 py-3 tabular-nums">{formatKg(va.grip.level)}</td>
                  <td className="px-4 py-3">
                    {visit.rebase.completedOriginalCourse === false ? "No" : visit.rebase.completedOriginalCourse ? "Yes" : "—"}
                  </td>
                  <td className="px-4 py-3">{PATTERN_LABEL[rebase.reading]}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      className="text-xs text-ink-subtle hover:text-rust"
                      onClick={() => removeVisit(visit.id)}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {lastBout ? (
        <div className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)] sm:p-6">
          <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[0.65rem] uppercase tracking-[0.16em] text-ink-subtle">
                Tier Two · last loaded bout
              </p>
              <h2 className="font-display text-lg font-medium">
                {lastBout.marker} · {lastBout.isoDate}
              </h2>
              <p className="mt-1 text-sm text-ink-muted">{lastBout.bout.description}</p>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link to="/loaded">All loaded bouts</Link>
            </Button>
          </div>
          <RecoveryChart bout={lastBout} />
        </div>
      ) : null}

      {lastPanel && lastInv ? (
        <div className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)] sm:p-6">
          <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[0.65rem] uppercase tracking-[0.16em] text-ink-subtle">
                Tier Three · last panel
              </p>
              <h2 className="font-display text-lg font-medium">{lastPanel.isoDate}</h2>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link to="/panel">Open panel</Link>
            </Button>
          </div>
          <p className="text-sm text-ink-muted">
            Validated present: {lastInv.validatedPresent.join(", ") || "none"}. Validated blank:{" "}
            {lastInv.validatedMissing.join(", ") || "none"}. Candidates do not veto.
          </p>
          <ul className="mt-3 grid gap-1 text-sm">
            {Object.entries(lastPanel.values)
              .filter(([, v]) => v.trim())
              .map(([id, value]) => {
                const measure = DETERMINANT_PANEL.flatMap((d) => d.measures).find((m) => m.id === id);
                return (
                  <li key={id} className="flex flex-wrap justify-between gap-2">
                    <span className="text-ink-muted">{measure?.name ?? id}</span>
                    <span className="tabular-nums">{value}</span>
                  </li>
                );
              })}
          </ul>
        </div>
      ) : null}

      {visits.length > 0 ? (
        <div className="grid gap-3">
          <h2 className="font-display text-lg font-medium">Rebase across visits</h2>
          {visits.map((visit, i) => {
            const rebase = rebaseForVisit(visit, visits, person.criteria);
            if (rebase.reading === "preserved" && i < visits.length - 1) return null;
            return (
              <div key={visit.id}>
                <p className="mb-2 text-xs uppercase tracking-[0.14em] text-ink-subtle">
                  {visit.isoDate}
                </p>
                <RebaseCard classification={rebase} />
              </div>
            );
          })}
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2 border-t border-line pt-4">
        <Button asChild variant="outline">
          <Link to="/series">All series</Link>
        </Button>
        <Button
          variant="ghost"
          className="text-rust"
          onClick={() => {
            if (confirm("Remove this series and its visits from this device?")) {
              removePerson(person.id);
              void navigate({ to: "/series" });
            }
          }}
        >
          Remove series
        </Button>
      </div>
    </div>
  );
}
