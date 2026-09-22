import { differenceInCalendarDays, parseISO } from "date-fns";
import { DETERMINANT_PANEL } from "./content";
import { finiteNumbers } from "@/lib/utils";
import {
  GAIT_MDC95,
  GAIT_SMALL_MCID,
  GAIT_SUBSTANTIAL_MCID,
  type Criteria,
  type DemandAccount,
  type DemandTrend,
  type GaitChangeBand,
  type HoldsFalls,
  type LoadedBout,
  type RebaseClassification,
  type RebaseReading,
  type SeriesAxes,
  type TrialSet,
  type Visit,
  type VisitAxes,
} from "./types";

export function median(values: number[]): number | null {
  const xs = [...values].filter(Number.isFinite).sort((a, b) => a - b);
  if (xs.length === 0) return null;
  const mid = Math.floor(xs.length / 2);
  return xs.length % 2 === 1 ? xs[mid]! : (xs[mid - 1]! + xs[mid]!) / 2;
}

export function gaitSpeed(distanceM: number, timeSec: number | null): number | null {
  if (timeSec == null || timeSec <= 0 || distanceM <= 0) return null;
  return distanceM / timeSec;
}

export function trialSet(
  values: number[],
  criterion: number | null,
): TrialSet {
  const xs = values.filter(Number.isFinite);
  const level = median(xs);
  const belowCount =
    criterion == null ? 0 : xs.filter((v) => v < criterion).length;
  const range = xs.length >= 2 ? Math.max(...xs) - Math.min(...xs) : xs.length === 1 ? 0 : null;
  const levelClears =
    criterion == null || level == null ? null : level >= criterion;
  return { values: xs, level, belowCount, range, levelClears };
}

export function visitAxes(visit: Visit, criteria: Criteria): VisitAxes {
  const gaitSpeeds = visit.gaitTimesSec
    .map((t) => gaitSpeed(criteria.gaitCourseM, t))
    .filter((v): v is number => v != null);
  const gripValues = [
    ...visit.gripKg.left,
    ...visit.gripKg.right,
  ].filter((v): v is number => v != null);
  const gait = trialSet(gaitSpeeds, criteria.gaitCriterionMs);
  const grip = trialSet(gripValues, criteria.gripCriterionKg);
  const entersSlope = gait.values.length === 3;
  return {
    visitId: visit.id,
    isoDate: visit.isoDate,
    gait,
    grip,
    chairCompleted: visit.chair.completed,
    chairTimeSec: visit.chair.timeSec,
    entersSlope,
  };
}

/** Same line the series table and the determinant panel use for a visit's gait. */
export function gaitRecordLine(visit: Visit, criteria: Criteria): string {
  const axes = visitAxes(visit, criteria);
  const median =
    axes.gait.level == null || !Number.isFinite(axes.gait.level)
      ? "—"
      : `${axes.gait.level.toFixed(2)} m/s`;
  return `${median} median; ${axes.gait.belowCount} of ${axes.gait.values.length} below ${criteria.gaitCriterionMs}`;
}

function yearsBetween(fromIso: string, toIso: string): number {
  const from = parseISO(fromIso);
  const to = parseISO(toIso);
  return differenceInCalendarDays(to, from) / 365.25;
}

/** ln(x) = ln(A) + k t. Returns null unless three or more positive points. Rule 4. */
export function fitRateConstant(
  points: Array<{ tYears: number; x: number }>,
): { k: number; a: number; n: number } | null {
  const pts = points.filter((p) => p.x > 0 && Number.isFinite(p.x) && Number.isFinite(p.tYears));
  if (pts.length < 3) return null;
  const n = pts.length;
  const meanT = pts.reduce((s, p) => s + p.tYears, 0) / n;
  const meanLn = pts.reduce((s, p) => s + Math.log(p.x), 0) / n;
  let num = 0;
  let den = 0;
  for (const p of pts) {
    const dt = p.tYears - meanT;
    num += dt * (Math.log(p.x) - meanLn);
    den += dt * dt;
  }
  if (den === 0) return null;
  const k = num / den;
  const lnA = meanLn - k * meanT;
  return { k, a: Math.exp(lnA), n };
}

export function twoPointChangeRate(
  x1: number,
  x2: number,
  years: number,
): number | null {
  if (!Number.isFinite(x1) || !Number.isFinite(x2) || years <= 0) return null;
  return (x2 - x1) / years;
}

function slopeFor(
  axes: VisitAxes[],
  pick: (v: VisitAxes) => number | null,
): SeriesAxes["gaitSlope"] {
  const usable = axes
    .filter((v) => v.entersSlope && pick(v) != null)
    .map((v) => ({ t: v.isoDate, x: pick(v)! }));
  if (usable.length < 2) {
    return { kind: "none", k: null, twoPointPerYear: null, n: usable.length };
  }
  const t0 = usable[0]!.t;
  const points = usable.map((p) => ({
    tYears: yearsBetween(t0, p.t),
    x: p.x,
  }));
  if (usable.length === 2) {
    const rate = twoPointChangeRate(
      usable[0]!.x,
      usable[1]!.x,
      yearsBetween(usable[0]!.t, usable[1]!.t),
    );
    return { kind: "two-point", k: null, twoPointPerYear: rate, n: 2 };
  }
  const fit = fitRateConstant(points);
  return {
    kind: "rate-constant",
    k: fit?.k ?? null,
    twoPointPerYear: null,
    n: usable.length,
  };
}

export function seriesAxes(personId: string, visits: Visit[], criteria: Criteria): SeriesAxes {
  const ordered = [...visits]
    .filter((v) => v.personId === personId)
    .sort((a, b) => a.isoDate.localeCompare(b.isoDate) || a.localTime.localeCompare(b.localTime));
  const axes = ordered.map((v) => visitAxes(v, criteria));
  return {
    personId,
    visits: axes,
    gaitSlope: slopeFor(axes, (v) => v.gait.level),
    gripSlope: slopeFor(axes, (v) => v.grip.level),
  };
}

export function gaitChangeBand(deltaAbs: number): GaitChangeBand {
  if (deltaAbs < GAIT_SMALL_MCID.lo) return "not-a-change";
  if (deltaAbs < GAIT_MDC95) {
    if (deltaAbs >= GAIT_SUBSTANTIAL_MCID.lo) return "substantial";
    return "small";
  }
  return "above-mdc";
}

export function classifyGaitDelta(current: number | null, previous: number | null): {
  delta: number | null;
  band: GaitChangeBand | null;
  note: string;
} {
  if (current == null || previous == null) {
    return { delta: null, band: null, note: "Need two visit levels to name a change." };
  }
  const delta = current - previous;
  const abs = Math.abs(delta);
  const band = gaitChangeBand(abs);
  const dir = delta < 0 ? "slower" : delta > 0 ? "faster" : "unchanged";
  if (abs < GAIT_MDC95) {
    return {
      delta,
      band: abs < GAIT_SMALL_MCID.lo ? "not-a-change" : band,
      note: `${dir}: |Δ| ${abs.toFixed(2)} m/s from the first visit is smaller than the 0.14 m/s MDC95. No change.`,
    };
  }
  return {
    delta,
    band,
    note: `${dir}: |Δ| ${abs.toFixed(2)} m/s from the first visit exceeds the 0.14 m/s MDC95. This is large enough to be a change.`,
  };
}

function nonempty(s: string | null | undefined): boolean {
  return Boolean(s && s.trim().length > 0);
}

/**
 * Crude demand index so the rebase pattern has something to read.
 * Stairs and outdoor walking raise demand; handing off or stopping a task lowers it.
 */
export function demandIndex(d: DemandAccount): number {
  const stairs = d.stairFlights ?? 0;
  const dist = parseLooseNumber(d.distanceWalkedOutside) ?? 0;
  const handed = nonempty(d.handedOff) ? 3 : 0;
  const stopped = nonempty(d.stopped) ? 3 : 0;
  const pressure = nonempty(d.timePressure) ? 1 : 0;
  const loads = nonempty(d.loadsCarried) ? 1 : 0;
  return stairs + dist + loads + pressure - handed - stopped;
}

export function parseLooseNumber(raw: string): number | null {
  if (!raw) return null;
  const m = raw.replace(",", ".").match(/-?\d+(\.\d+)?/);
  return m ? Number(m[0]) : null;
}

export function classifyDemand(current: DemandAccount, previous: DemandAccount | null): DemandTrend {
  if (!previous) {
    const hasAny =
      current.stairFlights != null ||
      nonempty(current.distanceWalkedOutside) ||
      nonempty(current.handedOff) ||
      nonempty(current.stopped) ||
      nonempty(current.loadsCarried) ||
      nonempty(current.timePressure);
    return hasAny ? "holds" : "uncertain";
  }
  const a = demandIndex(previous);
  const b = demandIndex(current);
  const newOffload = nonempty(current.handedOff) && current.handedOff !== previous.handedOff;
  const newStop = nonempty(current.stopped) && current.stopped !== previous.stopped;
  if (newOffload || newStop || b <= a - 1) return "falls";
  if (b >= a + 1) return "rises";
  return "holds";
}

export function classifyPerformance(
  current: VisitAxes,
  first: VisitAxes | null,
  completedOriginal: boolean | null,
): HoldsFalls {
  if (completedOriginal === false) return "falls";
  if (current.gait.level == null) return "uncertain";
  if (!first || first.visitId === current.visitId || first.gait.level == null) {
    return "holds";
  }
  const medianDecline = first.gait.level - current.gait.level;
  const exceedsMdc = medianDecline > GAIT_MDC95;
  const newlyBelowCriterion = current.gait.belowCount > first.gait.belowCount;
  if (exceedsMdc || newlyBelowCriterion) return "falls";
  return "holds";
}

const READINGS: Record<
  RebaseReading,
  { title: string; body: string }
> = {
  preserved: {
    title: "Capacity is preserved.",
    body: "Performance, self-report, and demand all hold. The three entries agree.",
  },
  rebase: {
    title: "Rebase.",
    body: "The person is doing less and rating themselves the same. Performance against the fixed criterion is falling while self-report holds and demand falls. The criterion is the only instrument that sees it. Invisible to any assessment that uses self-report or a moving reference.",
  },
  "margin-narrowing": {
    title: "Margin narrowing under load.",
    body: "Performance holds, self-report falls, demand rises. Different problem, different response. The week is asking more than the person wants to admit they can spare.",
  },
  "concordant-decline": {
    title: "Everything agrees.",
    body: "Performance falls and self-report falls. Nothing subtle is happening. Record it; do not over-read it.",
  },
  unnamed: {
    title: "No named pattern.",
    body: "All three are recorded. They match none of the named patterns. Record the three values; do not force a name.",
  },
  incomplete: {
    title: "Pattern incomplete.",
    body: "Need performance against the fixed criterion, a self-report of function, and the demand account. A blank is unknown; it is not normal.",
  },
};

export const PATTERN_LABEL: Record<RebaseReading, string> = {
  preserved: "Preserved",
  rebase: "Rebase",
  "margin-narrowing": "Margin narrowing",
  "concordant-decline": "Concordant decline",
  unnamed: "No named pattern",
  incomplete: "Pattern incomplete",
};

export function classifyRebase(input: {
  performance: HoldsFalls;
  selfReport: HoldsFalls;
  demand: DemandTrend;
}): RebaseClassification {
  const { performance, selfReport, demand } = input;
  let reading: RebaseReading = "incomplete";
  if (performance === "uncertain" || selfReport === "uncertain" || demand === "uncertain") {
    reading = "incomplete";
  } else if (performance === "holds" && selfReport === "holds" && demand === "holds") {
    reading = "preserved";
  } else if (performance === "falls" && selfReport === "holds" && demand === "falls") {
    reading = "rebase";
  } else if (performance === "holds" && selfReport === "falls" && demand === "rises") {
    reading = "margin-narrowing";
  } else if (performance === "falls" && selfReport === "falls") {
    reading = "concordant-decline";
  } else {
    reading = "unnamed";
  }
  const copy = READINGS[reading];
  const body =
    reading === "unnamed"
      ? `Performance ${performance}, self-report ${selfReport}, demand ${demand}. All three are recorded. They match none of the named patterns.`
      : copy.body;
  return {
    reading,
    performance,
    selfReport,
    demand,
    title: copy.title,
    body,
  };
}

export function rebaseForVisit(
  visit: Visit,
  series: Visit[],
  criteria: Criteria,
): RebaseClassification {
  const ordered = visitsChronological(series.filter((v) => v.personId === visit.personId));
  const idx = ordered.findIndex((v) => v.id === visit.id);
  const previous = idx > 0 ? ordered[idx - 1]! : null;
  const first = ordered[0] ?? null;
  const cur = visitAxes(visit, criteria);
  const firstAxes =
    first && first.id !== visit.id ? visitAxes(first, criteria) : null;
  return classifyRebase({
    performance: classifyPerformance(cur, firstAxes, visit.rebase.completedOriginalCourse),
    selfReport: visit.selfReportFunction,
    demand: classifyDemand(visit.demandAccount, previous?.demandAccount ?? null),
  });
}

export function visitsChronological(visits: Visit[]): Visit[] {
  return [...visits].sort(
    (a, b) => a.isoDate.localeCompare(b.isoDate) || a.localTime.localeCompare(b.localTime),
  );
}

export function previousVisit(visits: Visit[], visit: Visit): Visit | null {
  const ordered = visitsChronological(visits.filter((v) => v.personId === visit.personId));
  const idx = ordered.findIndex((v) => v.id === visit.id);
  if (idx <= 0) return null;
  return ordered[idx - 1] ?? null;
}

/** Weeks-scale ratio R = k_g / k_l. Undefined when decay cannot be estimated. */
export function gainLossRatio(
  kGain: number | null,
  kLoss: number | null,
): { r: number | null; undefinedReason: string | null } {
  if (kGain == null || !Number.isFinite(kGain)) {
    return { r: null, undefinedReason: "k_g cannot be estimated from the training limb." };
  }
  if (kLoss == null || !Number.isFinite(kLoss) || kLoss === 0) {
    return {
      r: null,
      undefinedReason:
        "Where no measurable decay occurs, k_l cannot be estimated and R is undefined — this is a scope condition, not a failed analysis.",
    };
  }
  return { r: kGain / kLoss, undefinedReason: null };
}

/** Acute ratio ρ = r_g / r_l per domain; reserve estimate is the minimum, not the mean. */
export function governingMinimum(domainRates: Array<{ domain: string; rho: number | null }>): {
  minDomain: string | null;
  minRho: number | null;
  note: string;
} {
  const usable = domainRates.filter((d) => d.rho != null && Number.isFinite(d.rho)) as Array<{
    domain: string;
    rho: number;
  }>;
  if (usable.length === 0) {
    return {
      minDomain: null,
      minRho: null,
      note: "No domain ratios to aggregate. A person is governed by their slowest-recovering system.",
    };
  }
  usable.sort((a, b) => a.rho - b.rho);
  const slowest = usable[0]!;
  return {
    minDomain: slowest.domain,
    minRho: slowest.rho,
    note: "The reserve estimate is the minimum across domains, not the mean. Averaging the slowest against the fastest hides exactly the thing that will fail them.",
  };
}

export function blankFields(visit: Visit): string[] {
  const blanks: string[] = [];
  if (!visit.isoDate) blanks.push("Date");
  if (!visit.localTime) blanks.push("Clock");
  if (!visit.demandThisVisit.trim()) blanks.push("Demand this visit");
  if (visit.gaitTimesSec.some((t) => t == null)) blanks.push("Gait (all three trials)");
  if (visit.chair.completed == null) blanks.push("Chair rise");
  if ([...visit.gripKg.left, ...visit.gripKg.right].some((g) => g == null)) {
    blanks.push("Grip (all six trials)");
  }
  if (visit.rebase.completedOriginalCourse == null) blanks.push("Rebase flag");
  if (!visit.stoppedDetail.trim() && !visit.demandAccount.stopped.trim()) {
    blanks.push("Stopped tasks");
  }
  if (!visit.condition.timeSinceExertion.trim()) blanks.push("Time since last exertion");
  return blanks;
}

export function formatRateConstant(k: number | null): string {
  if (k == null || !Number.isFinite(k)) return "—";
  const perYear = k;
  return `${perYear.toFixed(3)} yr⁻¹`;
}

export function halfLifeYears(k: number | null): string | null {
  if (k == null || k >= 0) return null;
  const t = Math.log(2) / Math.abs(k);
  return `${t.toFixed(1)} y to half`;
}

export function allGaitTrials(visit: Visit, criteria: Criteria): Array<{
  i: number;
  time: number | null;
  speed: number | null;
  clears: boolean | null;
}> {
  return visit.gaitTimesSec.map((time, i) => {
    const speed = gaitSpeed(criteria.gaitCourseM, time);
    const clears =
      speed == null ? null : speed >= criteria.gaitCriterionMs;
    return { i, time, speed, clears };
  });
}

export function restingValue(bout: Pick<LoadedBout, "resting">): number | null {
  const xs = bout.resting.map((r) => r.value).filter((v): v is number => v != null && Number.isFinite(v));
  return median(xs);
}

export function restingDisagreement(bout: Pick<LoadedBout, "resting">): {
  rest: number | null;
  relativeSpread: number | null;
  warn: string | null;
} {
  const a = bout.resting[0]?.value;
  const b = bout.resting[1]?.value;
  const rest = restingValue(bout);
  if (a == null || b == null || rest == null || rest === 0) {
    return {
      rest,
      relativeSpread: null,
      warn: a == null || b == null
        ? "Two resting measurements on separate occasions — one is not enough."
        : null,
    };
  }
  const spread = Math.abs(a - b) / Math.abs(rest);
  if (spread > 0.1) {
    return {
      rest,
      relativeSpread: spread,
      warn: "The two restings disagree by more than 10 percent of the mean. A single resting value cannot be distinguished from an excursion; these two still need naming.",
    };
  }
  return { rest, relativeSpread: spread, warn: null };
}

export interface RecoveryFit {
  rest: number;
  k: number;
  a: number;
  n: number;
  halfLifeHours: number | null;
  peak: number | null;
  peakDisplacement: number | null;
  sign: 1 | -1;
}

/**
 * Fit |x − rest| = A e^{k t} on the recovery limb. t in hours.
 * The quantity is the rate of return, not the size of the trough.
 */
export function fitRecoveryRateConstant(
  rest: number,
  samples: Array<{ hoursAfterLoad: number; value: number | null }>,
): RecoveryFit | null {
  if (!Number.isFinite(rest)) return null;
  const usable = samples.filter(
    (s) =>
      s.value != null &&
      Number.isFinite(s.value) &&
      Number.isFinite(s.hoursAfterLoad) &&
      Math.abs(s.value - rest) > 1e-6,
  ) as Array<{ hoursAfterLoad: number; value: number }>;
  if (usable.length < 3) return null;
  const first = usable[0]!;
  const sign: 1 | -1 = first.value >= rest ? 1 : -1;
  const points = usable.map((s) => ({
    tYears: s.hoursAfterLoad,
    x: Math.abs(s.value - rest),
  }));
  const fit = fitRateConstant(points);
  if (!fit) return null;
  const peakSample = usable.reduce((best, s) =>
    Math.abs(s.value - rest) > Math.abs(best.value - rest) ? s : best,
  );
  const halfLifeHours = fit.k < 0 ? Math.log(2) / Math.abs(fit.k) : null;
  return {
    rest,
    k: fit.k,
    a: fit.a,
    n: fit.n,
    halfLifeHours,
    peak: peakSample.value,
    peakDisplacement: peakSample.value - rest,
    sign,
  };
}

export function recoveryCurve(
  fit: RecoveryFit,
  hours: number[],
): Array<{ hours: number; fitted: number }> {
  return hours.map((h) => ({
    hours: h,
    fitted: fit.rest + fit.sign * fit.a * Math.exp(fit.k * h),
  }));
}

export function formatRecoveryK(k: number | null): string {
  if (k == null || !Number.isFinite(k)) return "—";
  return `${k.toFixed(3)} h⁻¹`;
}

export function panelInventory(values: Record<string, string>): {
  validatedPresent: string[];
  validatedMissing: string[];
  candidatesPresent: string[];
  exploratoryPresent: string[];
  emptyDeterminants: string[];
} {
  const filled = (id: string) => nonempty(values[id]);
  const validatedPresent: string[] = [];
  const validatedMissing: string[] = [];
  const candidatesPresent: string[] = [];
  const exploratoryPresent: string[] = [];
  const emptyDeterminants: string[] = [];
  for (const det of DETERMINANT_PANEL) {
    let any = false;
    for (const m of det.measures) {
      const has = filled(m.id);
      if (has) any = true;
      if (m.status === "validated" || m.status === "validated-cross-cutting") {
        (has ? validatedPresent : validatedMissing).push(m.name);
      } else if (m.status === "candidate" && has) {
        candidatesPresent.push(m.name);
      } else if ((m.status === "exploratory" || m.status === "crude-proxy") && has) {
        exploratoryPresent.push(m.name);
      }
    }
    if (!any) emptyDeterminants.push(det.id);
  }
  return {
    validatedPresent,
    validatedMissing,
    candidatesPresent,
    exploratoryPresent,
    emptyDeterminants,
  };
}

export { finiteNumbers };
