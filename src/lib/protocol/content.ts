import type { Determinant, InstrumentStatus } from "./types";

export const STATUS_LINE = "Design document. Not validated. Not a guideline.";

export const OPENING_CASE = {
  quote: "I am blessed.",
  body: "How he answered when I asked how he was today as I entered the exam room. His gaze, smile and tone all confirmed what he said, but his posture, walker and movement said something else. Things that normally don’t mix but for him it made all the difference between function and failure. He was blessed.",
};

export const OBJECT =
  "Functional reserve is capacity minus demand. A single resting measurement is a point; reserve is inferred from performance under a known load, repeated against a fixed criterion, with the condition of measurement recorded.";

export const QUANTITIES = [
  {
    name: "Level",
    clock: "per visit",
    body: "Where the person sits on average across a series. Median of the trials at a visit; across visits, the central value of the series.",
  },
  {
    name: "Slope",
    clock: "across visits",
    body: "Whether that level is rising, flat, or falling. Once three or more visits exist, the rate constant fitted across visits. With two visits, the observed two-point change rate — named as such, not reported as a rate constant.",
  },
  {
    name: "Dispersion",
    clock: "per visit",
    body: "How often a single trial falls below a line the mean still clears. The clinically meaningful quantity is the number of individual performances that cross the fixed criterion, not the position of the mean. A person whose average clears the curb and whose worst attempt does not is a person who falls.",
  },
  {
    name: "Condition",
    clock: "per sample",
    body: "The load and clock that sat behind the sample. A marker drawn without its load state on the record is uninterpretable.",
  },
  {
    name: "Governing minimum",
    clock: "seconds–minutes",
    body: "Which domain limits this challenge. Do not average domains. A person is governed by their slowest-recovering system.",
  },
  {
    name: "Gain–loss ratio",
    clock: "weeks",
    body: "How fast a named capacity is gained in training versus lost in detraining. A research design, not a first-visit test. Years-scale reserve depletion along the five determinants is the Life construct. Do not quote a seconds-scale ratio as if it were a years-scale slope.",
  },
] as const;

export const RULES = [
  {
    n: 1,
    title: "The criterion is fixed and absolute",
    source: "Rebase — the single most consequential line in the specification.",
    body: "The threshold does not move with the person. A curb of a stated height. A chair of a stated seat height. A crossing of a stated distance in a stated time. Never a percentage of the individual’s own previous best, because a percentage of a falling number is a number that never falls.",
    practice:
      "The same marked course, the same stair flight, the same dynamometer, the same time of day within ninety minutes. Not a personal best. Not last year’s average. If the person can no longer complete the original task, score a fail against the original criterion and name the substitute task separately. A shorter hallway is not a stable gait speed.",
  },
  {
    n: 2,
    title: "Demand is measured independently of output",
    source: "Reserve is a difference; a difference cannot be computed from one quantity.",
    body: "What the person’s day actually asks must be recorded separately from what the person can do. Where demand cannot be measured directly, it is estimated from a structured account of the week and recorded as an estimate, never as a measurement. Write what was asked before you read what was done.",
    practice: "The six demand questions, asked the same way every visit. The last two — handed off, and stopped — are the ones that matter most and the ones no existing instrument asks.",
  },
  {
    n: 3,
    title: "The challenge is serial and identical",
    source: "A single measurement yields a level and nothing else.",
    body: "Same task, same conditions, same instruction, at a stated interval. Two yield a slope contaminated by error. Enough yield a slope and a dispersion, which is the point.",
    practice: "Three gait trials, all recorded, not averaged into one number. Discarding them is the error this whole specification exists to correct.",
  },
  {
    n: 4,
    title: "Rates are rate constants, not slopes",
    source: "The rule that makes two people comparable, and the rule the Gain–Loss Ratio rests on.",
    body: "Where a trajectory is fitted, fit the exponential and report the constant. A slope depends on where the person started; a rate constant does not.",
    practice:
      "Secondary analysis in existing cohorts is the one licensed exception: there, fit an ordinary least-squares slope on calendar time and name it a slope. Do not pool it with fitted rate constants.",
  },
  {
    n: 5,
    title: "The condition of measurement is recorded",
    source: "Unrecorded load exceeds the reference change value.",
    body: "For every biological sample and every performance test: what physical load preceded it, and how long before. What a bout produces is not fluctuation around the set point; it is a stimulus-evoked response superimposed on it, and the two are separate quantities.",
    practice:
      "A single unrecorded bout can displace GDF15 by 1.5 to 17 times the laboratory threshold used to call a serial change real. The load record is a precondition for interpreting the marker, not a refinement of it.",
  },
  {
    n: 6,
    title: "Dispersion is reported beside level and slope",
    source: "The third axis of serial functional measurement.",
    body: "The clinically meaningful quantity is the number of individual performances that cross the fixed criterion, not the position of the mean.",
    practice: "Record all three gait trials and all six grip trials. A blank means unknown; it does not mean normal.",
  },
  {
    n: 7,
    title: "The timescale is declared",
    source: "The constructs do not translate.",
    body: "Every measurement states which of the three it belongs to: seconds to minutes, weeks, or years. An acute recovery ratio is not a training ratio and neither is a trajectory.",
    practice: "The two rate ratios look alike and are not. An implementation that reports either in the other’s vocabulary has not implemented this specification.",
  },
  {
    n: 8,
    title: "The recovery limb is sampled",
    source: "Tier Two — the loaded protocol.",
    body: "After a standardized load, the rate of return toward the individual’s own resting value is an index of reserve that neither the resting value nor the peak can supply. How fast the number returns after a known challenge is the signal; the trough is not.",
    practice: "It costs sampling time. It costs no new assay. Two resting measurements before the load, on separate occasions — one is not enough.",
  },
] as const;

export const OPERATING_RULE =
  "Name the determinant before you name the tool. A wearable sleep score is not Determinant I. It is an amplifier reading unless the architecture of sleep is independently sampled.";

export const CLINIC_CARD_STEPS = [
  "Walk, usual pace, stated distance. Three trials. Record all three times.",
  "Rise from the chair five times, arms folded. Record time, or record not completed.",
  "Grip, three trials each hand. Record all six.",
  "Ask the six demand questions. Record the answers as given.",
  "Ask the one question that is not on any other form: what did you stop doing since the last visit, and who or what does it now.",
  "Compare every trial against the criterion you set at the first visit and have not changed since.",
  "Record the condition of measurement: time since last physical exertion, time of day, time since last meal.",
] as const;

export const DEMAND_QUESTIONS = [
  {
    key: "stairFlights" as const,
    label: "Flights of stairs climbed",
    hint: "This week, as the week actually went.",
  },
  {
    key: "loadsCarried" as const,
    label: "Loads carried",
    hint: "What, how far, how often.",
  },
  {
    key: "distanceWalkedOutside" as const,
    label: "Distance walked outside the home",
    hint: "An estimate is an estimate. Record it as one.",
  },
  {
    key: "timePressure" as const,
    label: "Any task performed under time pressure",
    hint: "A crossing, a bus, a grandchild, a shift.",
  },
  {
    key: "handedOff" as const,
    label: "Any task recently handed to another person or to a device",
    hint: "The ones no existing instrument asks.",
  },
  {
    key: "stopped" as const,
    label: "Any task stopped",
    hint: "And who or what does it now.",
  },
];

export const CONDITION_FIELDS = [
  {
    key: "timeSinceExertion" as const,
    label: "Time since last physical load",
    hint: "Hours, or >18 h. What preceded the sample, and how long before.",
  },
  {
    key: "natureOfLoad" as const,
    label: "Nature of that load",
    hint: "What it was, not only that there was one.",
  },
  {
    key: "timeOfDay" as const,
    label: "Time of day",
    hint: "Clock of the sample or first measure.",
  },
  {
    key: "timeSinceMeal" as const,
    label: "Time since last meal",
    hint: "Hours. Record the feeding clock for glucose.",
  },
  {
    key: "timeSeated" as const,
    label: "Time seated before the draw",
    hint: "Minutes seated. Five fields is the whole cost.",
  },
] as const;

export const HOLES: Array<{
  id: Determinant;
  name: string;
  evidence: string;
  firstLever: string;
  doNot: string;
}> = [
  {
    id: "I",
    name: "Bioenergetic capacity",
    evidence: "Strong. Energetic budget for every other determinant.",
    firstLever: "Movement; light, dark and meal timing; substrate handling.",
    doNot: "A compound aimed at III.",
  },
  {
    id: "II",
    name: "Endocrine signaling integrity",
    evidence: "Moderate to strong. Communication layer.",
    firstLever: "Confirm the panel. Replacement is a clinical decision, not a protocol line.",
    doNot: "Lifestyle slogans as if they were II.",
  },
  {
    id: "III",
    name: "Molecular quality control",
    evidence: "Moderate. Weakest instrument — no validated tier is stated.",
    firstLever: "Restore I and V first. Then consider whether a deposit into III is even readable.",
    doNot: "A stack.",
  },
  {
    id: "IV",
    name: "Adaptive (hormetic) stress response",
    evidence: "Emerging. The determinant is defensible; the instrument is not yet.",
    firstLever: "A graded, recovered pulse of load or heat once I and V can bear it.",
    doNot: "Daily unrelieved stress, or zero dose.",
  },
  {
    id: "V",
    name: "Neuro-autonomic regulation",
    evidence: "Moderate. The integrating condition — measure it first, not last.",
    firstLever: "Sleep timing; load the governor can stand down from — water if land is the disease.",
    doNot: "More intensity on land while RMSSD is locked down.",
  },
];

export const WHAT_THIS_IS_NOT = [
  "It is not a protocol to copy for treatment. Dose remains empirical.",
  "It is not a new aging clock.",
  "It does not replace VO₂ max, gait speed, grip, or HRV. It says how to take those measures so they can speak as reserve rather than as isolated points.",
  "It does not validate. Nothing here has been tested against outcomes as a package.",
  "It does not supply an instrument for determinants III and IV.",
  "It does not name the standardized load.",
  "It does not settle the criteria. A stated arbitrary criterion held constant is scientifically superior to a defensible criterion that drifts.",
  "It does not supply a composite score. A composite would hide which determinant is the hole.",
  "It does not replace frailty instruments or the SPPB. It adds three things they do not: the fixed criterion, the demand account, and the dispersion.",
  "It does not fold demand shocks into the slope. Retirement, hospitalization and bracing change demand on a different clock from capacity. Record the demand shock as an event.",
];

export const TIERS = [
  {
    id: "one" as const,
    name: "Tier One — the clinic protocol",
    time: "Fifteen minutes",
    kit: "Stopwatch, marked corridor, standard chair, dynamometer.",
    body: "Repeatable at every visit. Gait, chair rise, grip, demand account. Tier One data are a strict subset of Tier Three and can be pooled with them. A clinic that can only run Tier One should run Tier One rather than nothing.",
  },
  {
    id: "two" as const,
    name: "Tier Two — the loaded protocol",
    time: "Thirty to forty minutes plus a sampling window",
    kit: "A submaximal, tolerable, reproducible bout, specified in advance and identical at every administration.",
    body: "Adds a standardized load and a recovery sample. Two resting measurements before the load, on separate occasions. Then sampling after the load out to six hours. The quantity is the rate constant of return toward the individual’s resting value. The specification does not name the bout, because naming one would be inventing a protocol rather than specifying one.",
  },
  {
    id: "three" as const,
    name: "Tier Three — the full determinant panel",
    time: "Interval of the source tests",
    kit: "Maps the five determinants onto the biomarker tiers the published paper already specifies.",
    body: "VALIDATED — use first as a component. CANDIDATE — record if available; do not let it veto a validated component. EXPLORATORY — research only. VALIDATED in the instrument tables names an established component test. It does not mean this protocol has been shown to estimate functional reserve.",
  },
] as const;

export const TIER_ONE_DETAIL = {
  measured: [
    {
      name: "Gait speed, usual pace",
      body: "A stated distance with a stated acceleration and deceleration zone; three trials; all three recorded, not averaged into one number. The three trials are what make dispersion computable, and discarding them is the error this whole specification exists to correct.",
    },
    {
      name: "Chair rise",
      body: "Five rises from a chair of stated seat height, arms folded, timed. Recorded as completed or not completed, and if completed, the time. A failure to complete is data, not a missing value.",
    },
    {
      name: "Grip strength",
      body: "Stated dynamometer, stated posture, three trials each hand, all six recorded.",
    },
    {
      name: "The demand account",
      body: "Six questions, asked the same way every visit, recording what the person’s week actually required of them. The last two — handed off, and stopped — are the ones that matter most and the ones no existing instrument asks.",
    },
  ],
  computed: [
    "Level: the median of the trials.",
    "Dispersion: the number of individual trials falling below the fixed criterion, and the range across trials, at every visit.",
    "Slope: once three or more visits exist, the rate constant fitted across visits. With two visits the observed two-point change rate may be recorded, but it is named as such and is not reported as a rate constant.",
  ],
};

export const TIER_TWO_DETAIL = {
  setting: "Appropriate to a research clinic or a well-resourced practice.",
  load: {
    title: "The standardized load",
    requirements: [
      "Reproducible.",
      "Submaximal.",
      "Tolerable by the intended population.",
      "Specified in advance.",
      "Identical at every administration.",
    ],
    note: "The specification does not name the bout, because the correct bout depends on the population and naming one would be inventing a protocol rather than specifying one. It names the requirements.",
  },
  recovery: {
    title: "The recovery limb",
    steps: [
      "Two resting measurements before the load, on separate occasions, to establish the individual’s own resting value — one is not enough, because a single resting value cannot be distinguished from an excursion.",
      "Then sampling after the load out to six hours.",
      "The quantity is the rate constant of return toward the individual’s resting value.",
    ],
    note: "This is the procedure the GDF15 manuscript proposes and it generalizes: the same logic applies to heart rate recovery, to lactate clearance, and to any marker with a resting value and a load response. What is being measured is not the size of the response but the speed of the return.",
  },
  markers: [
    { name: "GDF15", unit: "pg/mL", why: "The source procedure. Hours-scale recovery. Costs sampling time; costs no new assay." },
    { name: "Lactate", unit: "mmol/L", why: "Hours-scale clearance after the same protocol as VO₂ when available." },
    { name: "Heart rate", unit: "bpm", why: "Minutes-scale recovery after a known bout. Do not plot it on the hours axis." },
    { name: "Other", unit: "", why: "Any marker with a resting value and a load response. Declare the clock." },
  ],
  defaultSampleHours: [0, 0.5, 1, 2, 4, 6] as const,
};

export const TIER_LEGEND: Array<{
  status: InstrumentStatus;
  label: string;
  rule: string;
}> = [
  {
    status: "validated",
    label: "VALIDATED",
    rule: "Use first as a component.",
  },
  {
    status: "validated-cross-cutting",
    label: "VALIDATED (cross-cutting)",
    rule: "Reported against fixed criteria, at every visit, at every tier.",
  },
  {
    status: "candidate",
    label: "CANDIDATE",
    rule: "Record if available; do not let it veto a validated component.",
  },
  {
    status: "exploratory",
    label: "EXPLORATORY",
    rule: "Research only.",
  },
  {
    status: "crude-proxy",
    label: "CRUDE PROXY ONLY",
    rule: "Not a validated instrument for this determinant.",
  },
];

export interface PanelMeasure {
  id: string;
  name: string;
  how: string;
  interval: string;
  status: InstrumentStatus;
}

export interface DeterminantPanel {
  id: Exclude<Determinant, "uncertain">;
  name: string;
  evidence: string;
  thesis: string;
  measures: PanelMeasure[];
  clinicMinimum?: string;
  note?: string;
}

export const DETERMINANT_PANEL: DeterminantPanel[] = [
  {
    id: "I",
    name: "Bioenergetic capacity",
    evidence: "Strong. Energetic budget for every other determinant.",
    thesis: "Circadian NAD+ salvage, movement-driven biogenesis, substrate handling.",
    measures: [
      {
        id: "I-vo2",
        name: "VO₂ max",
        how: "Standardized treadmill or cycle protocol; same ergometer.",
        interval: "Annual. Report ml·kg⁻¹·min⁻¹ and % predicted.",
        status: "validated",
      },
      {
        id: "I-gait",
        name: "Gait speed",
        how: "Usual pace, stated marked course, stated acceleration and deceleration zone, three trials, all three recorded.",
        interval: "Every visit. Course length fixed in the chart.",
        status: "validated-cross-cutting",
      },
      {
        id: "I-grip",
        name: "Grip",
        how: "Stated dynamometer, stated posture, three trials each hand, all six recorded.",
        interval: "Every visit. Same device.",
        status: "validated-cross-cutting",
      },
      {
        id: "I-lactate",
        name: "Lactate threshold",
        how: "Same protocol as VO₂ when available.",
        interval: "Annual.",
        status: "candidate",
      },
      {
        id: "I-glucose",
        name: "Glucose variability",
        how: "CV% and time-in-range over a stated window from continuous monitoring. Record feeding clock.",
        interval: "Device cadence.",
        status: "candidate",
      },
    ],
    clinicMinimum:
      "Clinic minimum when VO₂ is unavailable: marked-course gait speed, grip, and a stated stair test — two flights, same building, time and conversation at the top. Conversation at the top is the load, not the charm.",
  },
  {
    id: "II",
    name: "Endocrine signaling integrity",
    evidence: "Moderate to strong. Communication layer.",
    thesis:
      "Thyroid, sex steroids, GH/IGF-1, insulin. CYP11A1 sits on the inner mitochondrial membrane; do not treat the panel as independent of I.",
    measures: [
      {
        id: "II-thyroid",
        name: "Thyroid panel",
        how: "TSH, free T4; free T3 if symptoms or replacement.",
        interval: "Annual. Morning.",
        status: "validated",
      },
      {
        id: "II-sex",
        name: "Free testosterone / estradiol",
        how: "Sex-appropriate; same assay lab.",
        interval: "Annual. Morning.",
        status: "validated",
      },
      {
        id: "II-homa",
        name: "Fasting insulin / HOMA-IR",
        how: "8–12 h fast. Record last meal clock.",
        interval: "Annual.",
        status: "candidate",
      },
      {
        id: "II-igf1",
        name: "IGF-1",
        how: "Same lab. Do not interpret without I and V.",
        interval: "Annual.",
        status: "candidate",
      },
    ],
    note: "Condition of measurement applies with full force here and is almost never recorded. And a replaced number with a falling gait speed is not a repaired determinant. Record both.",
  },
  {
    id: "III",
    name: "Molecular quality control",
    evidence: "Moderate. Clearance and replacement. Proteostasis, autophagy, mitophagy, redox buffering.",
    thesis:
      "No validated tier is stated in the published paper, and none is stated here. This is the determinant with the weakest instrument and the specification says so rather than manufacturing one.",
    measures: [
      {
        id: "III-oxldl",
        name: "Oxidized LDL",
        how: "Research draw only.",
        interval: "Study protocol.",
        status: "exploratory",
      },
      {
        id: "III-autophagy",
        name: "Autophagy markers",
        how: "Research draw only.",
        interval: "Study protocol.",
        status: "exploratory",
      },
      {
        id: "III-hscrp",
        name: "hs-CRP",
        how: "Same lab. Note infection, load, NSAID. Not within 72 h of a hard session.",
        interval: "Annual.",
        status: "crude-proxy",
      },
    ],
    note: "Proxy when III cannot be assayed: recovery of a validated I or V marker after a known load. Slow return is compatible with failed clearance. It does not prove it.",
  },
  {
    id: "IV",
    name: "Adaptive (hormetic) stress response",
    evidence: "Emerging. Responsiveness to sublethal thermal, hypoxic, oxidative or energetic stress.",
    thesis:
      "The sauna is a stimulus. The determinant is whether the organism still mounts and resolves an adaptive program. The determinant is defensible; the instrument is not yet.",
    measures: [
      {
        id: "IV-vo2train",
        name: "VO₂ trainability",
        how: "Δ VO₂ max over a stated 8–16 week block with recorded load.",
        interval: "Per block.",
        status: "candidate",
      },
      {
        id: "IV-heatcold",
        name: "Heat / cold tolerance",
        how: "Time to a stated core or discomfort stop under a fixed protocol.",
        interval: "Research.",
        status: "exploratory",
      },
      {
        id: "IV-hsp",
        name: "Heat-shock protein induction",
        how: "Lab only.",
        interval: "Research.",
        status: "exploratory",
      },
    ],
    clinicMinimum:
      "Clinic minimum: trainability of gait speed or sit-to-stand over 8–12 weeks against a fixed program. If I and V are intact and IV does not move, that is data. If I or V is broken, do not call IV failed.",
  },
  {
    id: "V",
    name: "Neuro-autonomic regulation",
    evidence: "Moderate. The integrating condition — the state in which I to IV operate. Measure it first, not last.",
    thesis: "A sleep score purchased with a stimulant at dawn and a sedative at dusk is not V. Record the drugs beside the score.",
    measures: [
      {
        id: "V-hrv",
        name: "HRV (RMSSD)",
        how: "5-min seated or sleep-derived; same device, same clock, same posture.",
        interval: "Device cadence. Report the week’s median, not the best night.",
        status: "validated",
      },
      {
        id: "V-sleep",
        name: "Sleep architecture",
        how: "Polysomnography when available. Wearable as candidate only, never as verdict.",
        interval: "Annual for PSG; wearable nightly if used.",
        status: "validated-cross-cutting",
      },
      {
        id: "V-cortisol",
        name: "Morning cortisol / DHEA",
        how: "30–45 min after habitual wake. Same lab.",
        interval: "Annual.",
        status: "candidate",
      },
    ],
  },
];

export const CROSS_CUTTING =
  "Cross-cutting. Gait speed, grip strength, and an epigenetic pace-of-aging measure where available. Reported against fixed criteria, at every visit, at every tier.";

export const CITATIONS = [
  {
    id: "life",
    text: "O’Leary RT. The Preservation of Functional Reserve: A Control Systems Framework for Human Aging. Life. 2026;16(9):1457.",
  },
  {
    id: "protocol",
    text: "O’Leary RT. The Reserve Protocol: A Measurement Specification for Functional Reserve. Preprints.org. 2026.",
  },
  {
    id: "mutcd",
    text: "FHWA, Manual on Uniform Traffic Control Devices, 11th Edition with Revision 1 (December 2025), Section 4I.06 — pedestrian clearance walking speed 3.5 ft/s (1.07 m/s); combined walk plus clearance interval 3.0 ft/s (0.91 m/s). The 2009 MUTCD placed this in §4E.06; the 11th Edition moved it to Chapter 4I.",
  },
  {
    id: "perera",
    text: "Perera et al., 2006 — small meaningful change 0.04–0.06 m/s; substantial 0.08–0.14 m/s.",
  },
  {
    id: "middleton",
    text: "Middleton, Fritz & Lusardi, 2015 — MDC95 of 0.14 m/s in community-dwelling older adults.",
  },
  {
    id: "rice",
    text: "Rice, Leonard & Carter, 1998 — grip vs everyday container forces, r from −.179 to .333. No validated everyday-task criterion for grip.",
  },
];
