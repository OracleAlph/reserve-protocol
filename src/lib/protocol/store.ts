import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { uid } from "@/lib/utils";
import { SEED_LOADED, SEED_PANELS, SEED_PEOPLE, SEED_VISITS } from "./seed";
import {
  DEFAULT_CONDITION,
  DEFAULT_CRITERIA,
  type ConditionOfMeasurement,
  type Criteria,
  type LoadedBout,
  type PanelReading,
  type Person,
  type Visit,
} from "./types";

interface ProtocolState {
  hydrated: boolean;
  hasSeeded: boolean;
  people: Person[];
  visits: Visit[];
  loadedBouts: LoadedBout[];
  panelReadings: PanelReading[];
  activePersonId: string | null;
  setHydrated: () => void;
  ensureSeed: () => void;
  setActivePerson: (id: string | null) => void;
  addPerson: (input: { label: string; notes?: string; criteria?: Partial<Criteria> }) => Person;
  updatePerson: (id: string, patch: Partial<Person>) => void;
  lockCriteria: (id: string) => void;
  removePerson: (id: string) => void;
  addVisit: (visit: Visit) => void;
  updateVisit: (id: string, patch: Partial<Visit>) => void;
  removeVisit: (id: string) => void;
  addLoadedBout: (bout: LoadedBout) => void;
  removeLoadedBout: (id: string) => void;
  addPanelReading: (reading: PanelReading) => void;
  removePanelReading: (id: string) => void;
  restoreExamples: () => void;
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function nowClock(d = new Date()) {
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function nowDate(d = new Date()) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function emptyCondition(clock = nowClock()): ConditionOfMeasurement {
  return { ...DEFAULT_CONDITION, timeOfDay: clock };
}

export function emptyVisit(personId: string): Visit {
  const now = new Date();
  const localTime = nowClock(now);
  return {
    id: uid(),
    personId,
    isoDate: nowDate(now),
    localTime,
    prior24h: {
      session: null,
      minutes: null,
      lastMealClock: "",
      lastCaffeine: "",
      lastAlcohol: "",
      nightLengthHours: null,
    },
    demandThisVisit: "Walk usual pace on the marked course ×3, five chair rises, grip ×6, demand account.",
    gaitTimesSec: [null, null, null],
    chair: { completed: null, timeSec: null },
    gripKg: {
      left: [null, null, null],
      right: [null, null, null],
    },
    demandAccount: {
      stairFlights: null,
      loadsCarried: "",
      distanceWalkedOutside: "",
      timePressure: "",
      handedOff: "",
      stopped: "",
    },
    stoppedDetail: "",
    selfReportFunction: "uncertain",
    rebase: { completedOriginalCourse: null, substituteTask: "" },
    determinantGuess: "uncertain",
    condition: emptyCondition(localTime),
    labsThisVisit: "",
    createdAt: now.toISOString(),
  };
}

export function emptyLoadedBout(personId: string): LoadedBout {
  const now = new Date();
  const localTime = nowClock(now);
  return {
    id: uid(),
    personId,
    isoDate: nowDate(now),
    localTime,
    marker: "GDF15",
    unit: "pg/mL",
    bout: {
      description: "",
      durationMin: null,
      modality: "",
      intensity: "",
    },
    resting: [
      { occasion: "", value: null },
      { occasion: nowDate(now), value: null },
    ],
    samples: [0, 0.5, 1, 2, 4, 6].map((hoursAfterLoad) => ({
      hoursAfterLoad,
      value: null,
    })),
    condition: emptyCondition(localTime),
    notes: "",
    createdAt: now.toISOString(),
  };
}

export function emptyPanelReading(personId: string): PanelReading {
  const now = new Date();
  return {
    id: uid(),
    personId,
    isoDate: nowDate(now),
    localTime: nowClock(now),
    values: {},
    conditions: {},
    notes: "",
    createdAt: now.toISOString(),
  };
}

function migrateCondition(raw: Partial<ConditionOfMeasurement> | undefined): ConditionOfMeasurement {
  return {
    timeSinceExertion: raw?.timeSinceExertion ?? "",
    natureOfLoad: raw?.natureOfLoad ?? "",
    timeOfDay: raw?.timeOfDay ?? "",
    timeSinceMeal: raw?.timeSinceMeal ?? "",
    timeSeated: raw?.timeSeated ?? "",
  };
}

function migrateVisit(v: Visit): Visit {
  return {
    ...v,
    labsThisVisit: v.labsThisVisit ?? "",
    condition: migrateCondition(v.condition),
  };
}

export const useProtocolStore = create<ProtocolState>()(
  persist(
    (set, get) => ({
      hydrated: false,
      hasSeeded: true,
      people: SEED_PEOPLE,
      visits: SEED_VISITS,
      loadedBouts: SEED_LOADED,
      panelReadings: SEED_PANELS,
      activePersonId: SEED_PEOPLE[0]?.id ?? null,
      setHydrated: () => set({ hydrated: true }),
      ensureSeed: () => {
        if (get().hasSeeded) return;
        set({
          hasSeeded: true,
          people: SEED_PEOPLE,
          visits: SEED_VISITS,
          loadedBouts: SEED_LOADED,
          panelReadings: SEED_PANELS,
          activePersonId: SEED_PEOPLE[0]?.id ?? null,
        });
      },
      setActivePerson: (id) => set({ activePersonId: id }),
      addPerson: ({ label, notes, criteria }) => {
        const person: Person = {
          id: uid(),
          label: label.trim() || "Untitled series",
          notes: notes ?? "",
          createdAt: new Date().toISOString(),
          criteria: { ...DEFAULT_CRITERIA, ...criteria },
          criteriaLocked: false,
        };
        set((s) => ({
          people: [...s.people, person],
          activePersonId: person.id,
        }));
        return person;
      },
      updatePerson: (id, patch) =>
        set((s) => ({
          people: s.people.map((p) => {
            if (p.id !== id) return p;
            const next = { ...p, ...patch };
            if (p.criteriaLocked && patch.criteria) {
              next.criteria = p.criteria;
            }
            return next;
          }),
        })),
      lockCriteria: (id) =>
        set((s) => ({
          people: s.people.map((p) => (p.id === id ? { ...p, criteriaLocked: true } : p)),
        })),
      removePerson: (id) =>
        set((s) => ({
          people: s.people.filter((p) => p.id !== id),
          visits: s.visits.filter((v) => v.personId !== id),
          loadedBouts: s.loadedBouts.filter((b) => b.personId !== id),
          panelReadings: s.panelReadings.filter((r) => r.personId !== id),
          activePersonId: s.activePersonId === id ? null : s.activePersonId,
        })),
      addVisit: (visit) => {
        set((s) => ({ visits: [...s.visits, visit] }));
        get().lockCriteria(visit.personId);
        set({ activePersonId: visit.personId });
      },
      updateVisit: (id, patch) =>
        set((s) => ({
          visits: s.visits.map((v) => (v.id === id ? { ...v, ...patch } : v)),
        })),
      removeVisit: (id) =>
        set((s) => ({ visits: s.visits.filter((v) => v.id !== id) })),
      addLoadedBout: (bout) => {
        set((s) => ({ loadedBouts: [...s.loadedBouts, bout] }));
        set({ activePersonId: bout.personId });
      },
      removeLoadedBout: (id) =>
        set((s) => ({ loadedBouts: s.loadedBouts.filter((b) => b.id !== id) })),
      addPanelReading: (reading) => {
        set((s) => ({ panelReadings: [...s.panelReadings, reading] }));
        set({ activePersonId: reading.personId });
      },
      removePanelReading: (id) =>
        set((s) => ({ panelReadings: s.panelReadings.filter((r) => r.id !== id) })),
      restoreExamples: () =>
        set((s) => {
          const keepPeople = s.people.filter(
            (p) => p.id !== SEED_PEOPLE[0]?.id && p.id !== SEED_PEOPLE[1]?.id,
          );
          const keepVisits = s.visits.filter(
            (v) => v.personId !== SEED_PEOPLE[0]?.id && v.personId !== SEED_PEOPLE[1]?.id,
          );
          const keepLoaded = s.loadedBouts.filter(
            (b) => b.personId !== SEED_PEOPLE[0]?.id && b.personId !== SEED_PEOPLE[1]?.id,
          );
          const keepPanels = s.panelReadings.filter(
            (r) => r.personId !== SEED_PEOPLE[0]?.id && r.personId !== SEED_PEOPLE[1]?.id,
          );
          return {
            people: [...SEED_PEOPLE, ...keepPeople],
            visits: [...SEED_VISITS, ...keepVisits],
            loadedBouts: [...SEED_LOADED, ...keepLoaded],
            panelReadings: [...SEED_PANELS, ...keepPanels],
            activePersonId: SEED_PEOPLE[0]?.id ?? s.activePersonId,
            hasSeeded: true,
          };
        }),
    }),
    {
      name: "reserve-protocol-v4",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<ProtocolState>;
        return {
          ...current,
          ...p,
          visits: (p.visits ?? current.visits).map(migrateVisit),
          loadedBouts: p.loadedBouts ?? current.loadedBouts,
          panelReadings: p.panelReadings ?? current.panelReadings,
        };
      },
      partialize: (s) => ({
        hasSeeded: s.hasSeeded,
        people: s.people,
        visits: s.visits,
        loadedBouts: s.loadedBouts,
        panelReadings: s.panelReadings,
        activePersonId: s.activePersonId,
      }),
      onRehydrateStorage: () => (state) => {
        state?.ensureSeed();
        state?.setHydrated();
      },
    },
  ),
);
