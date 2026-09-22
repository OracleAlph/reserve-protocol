import type { LoadedBout, PanelReading, Person, Prior24h, Visit } from "./types";
import { DEFAULT_CRITERIA } from "./types";
import { gaitRecordLine, visitAxes } from "./compute";
import { formatKg } from "@/lib/utils";

export const EXAMPLE_PERSON_ID = "example-exam-room";
export const PRESERVED_PERSON_ID = "example-preserved";

export const SEED_PEOPLE: Person[] = [
  {
    id: EXAMPLE_PERSON_ID,
    label: "Exam-room example",
    notes:
      "De-identified teaching series. Walker in the room, self-report intact. The opening case, written as visits.",
    createdAt: "2026-03-15T13:10:00.000Z",
    criteria: {
      ...DEFAULT_CRITERIA,
      courseId: "clinic-corridor-4m",
      dynamometerId: "Jamar-clinic-1",
    },
    criteriaLocked: true,
  },
  {
    id: PRESERVED_PERSON_ID,
    label: "Preserved series",
    notes: "Teaching contrast: performance, report, and demand all hold.",
    createdAt: "2026-02-02T14:00:00.000Z",
    criteria: { ...DEFAULT_CRITERIA, courseId: "clinic-corridor-4m" },
    criteriaLocked: true,
  },
];

const REST_PRIOR: Prior24h = {
  session: false,
  minutes: 0,
  lastMealClock: "07:30",
  lastCaffeine: "none",
  lastAlcohol: "none",
  nightLengthHours: 7,
};

type SeedVisit = Omit<Visit, "prior24h" | "condition" | "createdAt" | "labsThisVisit"> & {
  prior24h?: Prior24h;
  labsThisVisit?: string;
};

function v(input: SeedVisit): Visit {
  const prior24h = input.prior24h ?? REST_PRIOR;
  return {
    id: input.id,
    personId: input.personId,
    isoDate: input.isoDate,
    localTime: input.localTime,
    demandThisVisit: input.demandThisVisit,
    gaitTimesSec: input.gaitTimesSec,
    chair: input.chair,
    gripKg: input.gripKg,
    demandAccount: input.demandAccount,
    stoppedDetail: input.stoppedDetail,
    selfReportFunction: input.selfReportFunction,
    rebase: input.rebase,
    determinantGuess: input.determinantGuess,
    prior24h,
    condition: {
      timeSinceExertion: ">18 h",
      natureOfLoad: "none in prior 24 h",
      timeOfDay: input.localTime,
      timeSinceMeal: "2 h",
      timeSeated: "10 min",
    },
    labsThisVisit: input.labsThisVisit ?? "",
    createdAt: `${input.isoDate}T${input.localTime}:00.000Z`,
  };
}

export const SEED_VISITS: Visit[] = [
  v({
    id: "ex-v1",
    personId: EXAMPLE_PERSON_ID,
    isoDate: "2026-03-15",
    localTime: "09:10",
    demandThisVisit: "Walk 4 m usual pace ×3, five chair rises, grip ×6. Demand account.",
    gaitTimesSec: [3.35, 3.42, 3.28],
    chair: { completed: true, timeSec: 12.4 },
    gripKg: { left: [28, 29, 27], right: [31, 30, 32] },
    demandAccount: {
      stairFlights: 2,
      loadsCarried: "Groceries, two bags, from car to kitchen",
      distanceWalkedOutside: "1.5 km",
      timePressure: "Signalized crossing on the way to clinic",
      handedOff: "",
      stopped: "",
    },
    stoppedDetail: "",
    selfReportFunction: "holds",
    rebase: { completedOriginalCourse: true, substituteTask: "" },
    determinantGuess: "uncertain",
  }),
  v({
    id: "ex-v2",
    personId: EXAMPLE_PERSON_ID,
    isoDate: "2026-05-20",
    localTime: "09:25",
    demandThisVisit: "Walk 4 m usual pace ×3, five chair rises, grip ×6. Demand account.",
    gaitTimesSec: [3.55, 3.7, 3.48],
    chair: { completed: true, timeSec: 13.1 },
    gripKg: { left: [26, 27, 25], right: [29, 28, 30] },
    demandAccount: {
      stairFlights: 1,
      loadsCarried: "Lighter bags, one trip",
      distanceWalkedOutside: "1 km",
      timePressure: "Same crossing",
      handedOff: "",
      stopped: "",
    },
    stoppedDetail: "",
    selfReportFunction: "holds",
    rebase: { completedOriginalCourse: true, substituteTask: "" },
    determinantGuess: "I",
  }),
  v({
    id: "ex-v3",
    personId: EXAMPLE_PERSON_ID,
    isoDate: "2026-07-18",
    localTime: "09:05",
    demandThisVisit: "Walk 4 m usual pace ×3, five chair rises, grip ×6. Demand account.",
    gaitTimesSec: [3.95, 4.2, 3.88],
    chair: { completed: true, timeSec: 15.8 },
    gripKg: { left: [22, 23, 21], right: [24, 25, 23] },
    demandAccount: {
      stairFlights: 0,
      loadsCarried: "None — spouse takes the bags",
      distanceWalkedOutside: "400 m",
      timePressure: "Avoids the timed crossing",
      handedOff: "Carrying laundry and groceries — spouse",
      stopped: "Stairs; uses the elevator",
    },
    stoppedDetail: "Stairs handed to the elevator. Laundry and bags to spouse.",
    selfReportFunction: "holds",
    rebase: { completedOriginalCourse: true, substituteTask: "" },
    determinantGuess: "I",
    prior24h: {
      session: false,
      minutes: 0,
      lastMealClock: "07:15",
      lastCaffeine: "none",
      lastAlcohol: "none",
      nightLengthHours: 6.5,
    },
  }),
  v({
    id: "ex-v4",
    personId: EXAMPLE_PERSON_ID,
    isoDate: "2026-09-12",
    localTime: "09:40",
    demandThisVisit: "Walk 4 m usual pace ×3, five chair rises, grip ×6. Demand account.",
    gaitTimesSec: [4.45, 4.8, 4.3],
    chair: { completed: false, timeSec: null },
    gripKg: { left: [18, 19, 17], right: [20, 21, 19] },
    demandAccount: {
      stairFlights: 0,
      loadsCarried: "None",
      distanceWalkedOutside: "Walker, driveway only",
      timePressure: "None",
      handedOff: "Most outdoor walking — walker and family",
      stopped: "Unaided hallway. Chair rise without hands.",
    },
    stoppedDetail:
      "Original 4 m course no longer completed. Substitute: 2 m hallway with walker. Do not overwrite the old criterion.",
    selfReportFunction: "holds",
    rebase: { completedOriginalCourse: false, substituteTask: "2 m hallway with walker" },
    determinantGuess: "I",
    prior24h: {
      session: false,
      minutes: 0,
      lastMealClock: "07:40",
      lastCaffeine: "none",
      lastAlcohol: "none",
      nightLengthHours: 6,
    },
  }),
  v({
    id: "pr-v1",
    personId: PRESERVED_PERSON_ID,
    isoDate: "2026-02-02",
    localTime: "10:00",
    demandThisVisit: "Walk 4 m usual pace ×3, five chair rises, grip ×6. Demand account.",
    gaitTimesSec: [3.2, 3.15, 3.22],
    chair: { completed: true, timeSec: 10.8 },
    gripKg: { left: [32, 33, 31], right: [34, 35, 33] },
    demandAccount: {
      stairFlights: 4,
      loadsCarried: "Garden soil, two bags",
      distanceWalkedOutside: "3 km",
      timePressure: "Grandchild pickup",
      handedOff: "",
      stopped: "",
    },
    stoppedDetail: "",
    selfReportFunction: "holds",
    rebase: { completedOriginalCourse: true, substituteTask: "" },
    determinantGuess: "uncertain",
  }),
  v({
    id: "pr-v2",
    personId: PRESERVED_PERSON_ID,
    isoDate: "2026-05-04",
    localTime: "10:05",
    demandThisVisit: "Walk 4 m usual pace ×3, five chair rises, grip ×6. Demand account.",
    gaitTimesSec: [3.18, 3.24, 3.12],
    chair: { completed: true, timeSec: 10.5 },
    gripKg: { left: [33, 32, 32], right: [35, 34, 34] },
    demandAccount: {
      stairFlights: 4,
      loadsCarried: "Garden soil",
      distanceWalkedOutside: "3.2 km",
      timePressure: "Grandchild pickup",
      handedOff: "",
      stopped: "",
    },
    stoppedDetail: "",
    selfReportFunction: "holds",
    rebase: { completedOriginalCourse: true, substituteTask: "" },
    determinantGuess: "uncertain",
  }),
  v({
    id: "pr-v3",
    personId: PRESERVED_PERSON_ID,
    isoDate: "2026-08-10",
    localTime: "09:50",
    demandThisVisit: "Walk 4 m usual pace ×3, five chair rises, grip ×6. Demand account.",
    gaitTimesSec: [3.21, 3.16, 3.19],
    chair: { completed: true, timeSec: 10.6 },
    gripKg: { left: [32, 33, 32], right: [34, 35, 34] },
    demandAccount: {
      stairFlights: 5,
      loadsCarried: "Groceries and garden",
      distanceWalkedOutside: "2.8 km",
      timePressure: "Grandchild pickup",
      handedOff: "",
      stopped: "",
    },
    stoppedDetail: "",
    selfReportFunction: "holds",
    rebase: { completedOriginalCourse: true, substituteTask: "" },
    determinantGuess: "uncertain",
  }),
];

export const SEED_LOADED: LoadedBout[] = [
  {
    id: "ex-load-1",
    personId: EXAMPLE_PERSON_ID,
    isoDate: "2026-05-20",
    localTime: "09:40",
    marker: "GDF15",
    unit: "pg/mL",
    bout: {
      description:
        "Submaximal cycle on the clinic ergometer, same saddle height, same cadence instruction. Specified 12 April and held.",
      durationMin: 8,
      modality: "cycle",
      intensity: "Submaximal — RPE 13, tolerable, reproducible.",
    },
    resting: [
      { occasion: "2026-05-19 morning, seated 5 min", value: 810 },
      { occasion: "2026-05-20 morning, seated 5 min, before load", value: 870 },
    ],
    samples: [
      { hoursAfterLoad: 0, value: 1680 },
      { hoursAfterLoad: 0.5, value: 1528 },
      { hoursAfterLoad: 1, value: 1402 },
      { hoursAfterLoad: 2, value: 1217 },
      { hoursAfterLoad: 4, value: 1009 },
      { hoursAfterLoad: 6, value: 916 },
    ],
    condition: {
      timeSinceExertion: "load just completed",
      natureOfLoad: "8 min submaximal cycle, clinic ergometer",
      timeOfDay: "09:40",
      timeSinceMeal: "2 h",
      timeSeated: "5 min before each draw",
    },
    notes:
      "Teaching recovery limb on an hours scale. GDF15, pg/mL. Quantity is the rate of return, not the peak.",
    createdAt: "2026-05-20T09:40:00.000Z",
  },
  {
    id: "pr-load-1",
    personId: PRESERVED_PERSON_ID,
    isoDate: "2026-05-04",
    localTime: "10:20",
    marker: "GDF15",
    unit: "pg/mL",
    bout: {
      description: "Same submaximal cycle protocol as the exam-room series. Identical administration.",
      durationMin: 8,
      modality: "cycle",
      intensity: "Submaximal — RPE 13.",
    },
    resting: [
      { occasion: "2026-05-03 morning", value: 510 },
      { occasion: "2026-05-04 morning, before load", value: 550 },
    ],
    samples: [
      { hoursAfterLoad: 0, value: 980 },
      { hoursAfterLoad: 0.5, value: 820 },
      { hoursAfterLoad: 1, value: 700 },
      { hoursAfterLoad: 2, value: 610 },
      { hoursAfterLoad: 4, value: 555 },
      { hoursAfterLoad: 6, value: 540 },
    ],
    condition: {
      timeSinceExertion: "load just completed",
      natureOfLoad: "8 min submaximal cycle, clinic ergometer",
      timeOfDay: "10:20",
      timeSinceMeal: "2.5 h",
      timeSeated: "5 min before each draw",
    },
    notes:
      "Faster return of GDF15 after the same bout. Teaching contrast, not a comparison licensed for pooling without the same bout.",
    createdAt: "2026-05-04T10:20:00.000Z",
  },
];

function panelGaitLine(visitId: string, personId: string): string {
  const visit = SEED_VISITS.find((x) => x.id === visitId);
  const person = SEED_PEOPLE.find((p) => p.id === personId);
  if (!visit || !person) return "";
  return gaitRecordLine(visit, person.criteria);
}

function panelGripLine(visitId: string, personId: string): string {
  const visit = SEED_VISITS.find((x) => x.id === visitId);
  const person = SEED_PEOPLE.find((p) => p.id === personId);
  if (!visit || !person) return "";
  return `${formatKg(visitAxes(visit, person.criteria).grip.level)} median`;
}

export const SEED_PANELS: PanelReading[] = [
  {
    id: "ex-panel-1",
    personId: EXAMPLE_PERSON_ID,
    isoDate: "2026-05-20",
    localTime: "09:25",
    values: {
      "I-gait": panelGaitLine("ex-v2", EXAMPLE_PERSON_ID),
      "I-grip": panelGripLine("ex-v2", EXAMPLE_PERSON_ID),
      "I-vo2": "",
      "II-thyroid": "TSH 2.1 mIU/L; free T4 1.2 ng/dL. Morning.",
      "V-hrv": "Week’s median RMSSD 18 ms. Same device, seated.",
      "V-sleep": "Wearable only — candidate, not a verdict.",
    },
    conditions: {
      "I-gait": "Every visit. Course fixed.",
      "II-thyroid": "Morning. Fasting. Last meal 07:15.",
      "V-hrv": "Device cadence. Median of the week, not the best night.",
    },
    notes: "VO₂ unavailable. Clinic minimum of I used. V measured first. III and IV empty — no validated instrument.",
    createdAt: "2026-05-20T09:25:00.000Z",
  },
  {
    id: "pr-panel-1",
    personId: PRESERVED_PERSON_ID,
    isoDate: "2026-05-04",
    localTime: "10:05",
    values: {
      "I-vo2": "32 ml·kg⁻¹·min⁻¹, 118% predicted. Same cycle ergometer.",
      "I-gait": panelGaitLine("pr-v2", PRESERVED_PERSON_ID),
      "I-grip": panelGripLine("pr-v2", PRESERVED_PERSON_ID),
      "V-hrv": "Week’s median RMSSD 42 ms.",
      "V-sleep": "PSG 2025: N3 preserved, AHI 4. Wearable not used as verdict.",
      "II-thyroid": "TSH 1.4; free T4 1.3. Morning.",
    },
    conditions: {
      "I-vo2": "Annual. Same ergometer.",
      "V-hrv": "Same device, same clock, same posture.",
    },
    notes: "I and V intact. Do not call IV failed if it is not yet measured.",
    createdAt: "2026-05-04T10:05:00.000Z",
  },
];
