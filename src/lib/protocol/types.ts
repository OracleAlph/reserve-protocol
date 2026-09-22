export type Determinant = "I" | "II" | "III" | "IV" | "V" | "uncertain";

export type HoldsFalls = "holds" | "falls" | "uncertain";
export type DemandTrend = "holds" | "falls" | "rises" | "uncertain";

export type RebaseReading =
  | "preserved"
  | "rebase"
  | "margin-narrowing"
  | "concordant-decline"
  | "unnamed"
  | "incomplete";

export type GaitChangeBand = "not-a-change" | "small" | "substantial" | "above-mdc";

export type InstrumentStatus =
  | "validated"
  | "validated-cross-cutting"
  | "candidate"
  | "exploratory"
  | "crude-proxy";

export interface Criteria {
  gaitCourseM: number;
  accelZoneM: number;
  decelZoneM: number;
  /** Fixed absolute criterion. Default 1.07 m/s = MUTCD 3.5 ft/s. */
  gaitCriterionMs: number;
  chairHeightCm: number;
  /** Clinic-stated. Null means no grip criterion is held. */
  gripCriterionKg: number | null;
  dynamometerId: string;
  courseId: string;
}

export interface Person {
  id: string;
  label: string;
  notes: string;
  createdAt: string;
  criteria: Criteria;
  criteriaLocked: boolean;
}

export interface Prior24h {
  session: boolean | null;
  minutes: number | null;
  lastMealClock: string;
  lastCaffeine: string;
  lastAlcohol: string;
  nightLengthHours: number | null;
}

export interface DemandAccount {
  stairFlights: number | null;
  loadsCarried: string;
  distanceWalkedOutside: string;
  timePressure: string;
  handedOff: string;
  stopped: string;
}

export interface ConditionOfMeasurement {
  timeSinceExertion: string;
  natureOfLoad: string;
  timeOfDay: string;
  timeSinceMeal: string;
  timeSeated: string;
}

export interface Visit {
  id: string;
  personId: string;
  isoDate: string;
  localTime: string;
  prior24h: Prior24h;
  /** Written before scores. Rule 2. */
  demandThisVisit: string;
  gaitTimesSec: [number | null, number | null, number | null];
  chair: { completed: boolean | null; timeSec: number | null };
  gripKg: {
    left: [number | null, number | null, number | null];
    right: [number | null, number | null, number | null];
  };
  demandAccount: DemandAccount;
  /** What was stopped, and who or what does it now. */
  stoppedDetail: string;
  selfReportFunction: HoldsFalls;
  rebase: {
    completedOriginalCourse: boolean | null;
    substituteTask: string;
  };
  determinantGuess: Determinant;
  condition: ConditionOfMeasurement;
  /** Which of II/III drawn. Fasting state. Hours since last hard session. */
  labsThisVisit: string;
  createdAt: string;
}

export interface RestingSample {
  occasion: string;
  value: number | null;
}

export interface RecoverySample {
  hoursAfterLoad: number;
  value: number | null;
}

/** Tier Two — standardized load plus recovery limb. */
export interface LoadedBout {
  id: string;
  personId: string;
  isoDate: string;
  localTime: string;
  marker: string;
  unit: string;
  bout: {
    description: string;
    durationMin: number | null;
    modality: string;
    intensity: string;
  };
  resting: [RestingSample, RestingSample];
  samples: RecoverySample[];
  condition: ConditionOfMeasurement;
  notes: string;
  createdAt: string;
}

/** Tier Three — recorded values against the determinant instrument tables. */
export interface PanelReading {
  id: string;
  personId: string;
  isoDate: string;
  localTime: string;
  values: Record<string, string>;
  conditions: Record<string, string>;
  notes: string;
  createdAt: string;
}

export interface TrialSet {
  values: number[];
  level: number | null;
  belowCount: number;
  range: number | null;
  levelClears: boolean | null;
}

export interface VisitAxes {
  visitId: string;
  isoDate: string;
  gait: TrialSet;
  grip: TrialSet;
  chairCompleted: boolean | null;
  chairTimeSec: number | null;
  entersSlope: boolean;
}

export interface SeriesAxes {
  personId: string;
  visits: VisitAxes[];
  gaitSlope: {
    kind: "rate-constant" | "two-point" | "none";
    k: number | null;
    twoPointPerYear: number | null;
    n: number;
  };
  gripSlope: {
    kind: "rate-constant" | "two-point" | "none";
    k: number | null;
    twoPointPerYear: number | null;
    n: number;
  };
}

export interface RebaseClassification {
  reading: RebaseReading;
  performance: HoldsFalls;
  selfReport: HoldsFalls;
  demand: DemandTrend;
  title: string;
  body: string;
}

export const DEFAULT_CRITERIA: Criteria = {
  gaitCourseM: 4,
  accelZoneM: 1,
  decelZoneM: 1,
  gaitCriterionMs: 1.07,
  chairHeightCm: 43,
  gripCriterionKg: 9.07,
  dynamometerId: "clinic-1",
  courseId: "marked-corridor-4m",
};

export const DEFAULT_CONDITION: ConditionOfMeasurement = {
  timeSinceExertion: "",
  natureOfLoad: "",
  timeOfDay: "",
  timeSinceMeal: "",
  timeSeated: "",
};

/** MUTCD 11th Edition with Revision 1 (December 2025), §4I.06. Was §4E.06 in the 2009 edition. */
export const MUTCD_EDITION = "11th Edition with Revision 1";
export const MUTCD_EDITION_YEAR = 2025;
export const MUTCD_SECTION = "4I.06";
/** Pedestrian clearance walking speed, 3.5 ft/s. */
export const MUTCD_CLEARANCE_MS = 1.07;
/** Combined walk + clearance, 3.0 ft/s. */
export const MUTCD_COMBINED_MS = 0.91;
/** Middleton et al. 2015, community-dwelling adults 60+. */
export const GAIT_MDC95 = 0.14;
/** Perera et al. 2006. */
export const GAIT_SMALL_MCID = { lo: 0.04, hi: 0.06 };
export const GAIT_SUBSTANTIAL_MCID = { lo: 0.08, hi: 0.14 };

export const DETERMINANT_LABEL: Record<Determinant, string> = {
  I: "I · Bioenergetic capacity",
  II: "II · Endocrine signaling",
  III: "III · Molecular quality control",
  IV: "IV · Adaptive stress response",
  V: "V · Neuro-autonomic regulation",
  uncertain: "Uncertain — guessing is allowed",
};
