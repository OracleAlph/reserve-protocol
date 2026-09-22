import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Field, Section } from "@/components/section";
import { Stopwatch } from "@/components/stopwatch";
import { PersonDialog } from "@/components/person-dialog";
import { DEMAND_QUESTIONS } from "@/lib/protocol/content";
import { allGaitTrials, gaitSpeed } from "@/lib/protocol/compute";
import { emptyVisit, useProtocolStore } from "@/lib/protocol/store";
import {
  DETERMINANT_LABEL,
  type Determinant,
  type HoldsFalls,
  type Visit,
} from "@/lib/protocol/types";
import { formatMs, kgToLb } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

function parseNum(raw: string): number | null {
  if (raw.trim() === "") return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

function Triple({
  values,
  onChange,
  unit,
  labels,
}: {
  values: [number | null, number | null, number | null];
  onChange: (next: [number | null, number | null, number | null]) => void;
  unit: string;
  labels: [string, string, string];
}) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {values.map((v, i) => (
        <label key={labels[i]} className="flex flex-col gap-1">
          <span className="text-xs text-ink-subtle">{labels[i]}</span>
          <Input
            inputMode="decimal"
            className="tabular-nums"
            value={v ?? ""}
            onChange={(e) => {
              const next = [...values] as [number | null, number | null, number | null];
              next[i] = parseNum(e.target.value);
              onChange(next);
            }}
            placeholder={unit}
          />
        </label>
      ))}
    </div>
  );
}

export function VisitSheet({ personId }: { personId?: string }) {
  const navigate = useNavigate();
  const people = useProtocolStore((s) => s.people);
  const hydrated = useProtocolStore((s) => s.hydrated);
  const addVisit = useProtocolStore((s) => s.addVisit);
  const activePersonId = useProtocolStore((s) => s.activePersonId);
  const setActivePerson = useProtocolStore((s) => s.setActivePerson);

  const selectedId = personId ?? activePersonId ?? people[0]?.id ?? null;
  const person = people.find((p) => p.id === selectedId);
  const [createOpen, setCreateOpen] = useState(false);
  const [visit, setVisit] = useState<Visit>(() => emptyVisit(selectedId ?? "pending"));
  const [gaitSlot, setGaitSlot] = useState<0 | 1 | 2>(0);

  const patch = (partial: Partial<Visit>) => setVisit((v) => ({ ...v, ...partial }));

  useEffect(() => {
    if (selectedId && visit.personId !== selectedId) {
      setVisit((v) => ({ ...v, personId: selectedId }));
    }
  }, [selectedId, visit.personId]);

  if (!hydrated && people.length === 0) {
    return <p className="text-sm text-ink-muted">Loading the instrument…</p>;
  }

  const trials = person ? allGaitTrials(visit, person.criteria) : [];

  const save = () => {
    if (!person) {
      toast.error("Name a series before you record a visit.");
      return;
    }
    const next: Visit = {
      ...visit,
      id: visit.id,
      personId: person.id,
      createdAt: new Date().toISOString(),
    };
    addVisit(next);
    toast.success("Visit recorded against the fixed criterion.");
    void navigate({ to: "/visit/$visitId", params: { visitId: next.id } });
  };

  return (
    <div className="grid gap-5">
      <Section kicker="Tier One · fifteen minutes" title="Clinic card">
        <p className="mb-4 text-sm text-ink-muted">
          One page, same fields every time. Write what was asked before you read what was done.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Series">
            <div className="flex gap-2">
              <Select
                value={selectedId ?? ""}
                onValueChange={(id) => {
                  setActivePerson(id);
                  setVisit((v) => ({ ...v, personId: id }));
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a series" />
                </SelectTrigger>
                <SelectContent>
                  {people.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button type="button" variant="outline" onClick={() => setCreateOpen(true)}>
                New
              </Button>
            </div>
          </Field>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Date">
              <Input
                type="date"
                value={visit.isoDate}
                onChange={(e) => patch({ isoDate: e.target.value })}
              />
            </Field>
            <Field label="Clock">
              <Input
                type="time"
                value={visit.localTime}
                onChange={(e) =>
                  patch({
                    localTime: e.target.value,
                    condition: { ...visit.condition, timeOfDay: e.target.value },
                  })
                }
              />
            </Field>
          </div>
        </div>
        {person ? (
          <p className="mt-4 rounded-md bg-bg-elevated px-3 py-2 text-sm text-ink-muted">
            Course <span className="tabular-nums text-ink">{person.criteria.gaitCourseM} m</span>
            {" · "}
            criterion{" "}
            <span className="tabular-nums text-ink">{person.criteria.gaitCriterionMs} m/s</span>
            {" · "}
            chair {person.criteria.chairHeightCm} cm
            {" · "}
            {person.criteriaLocked ? "criteria locked" : "criteria open until first visit"}
          </p>
        ) : (
          <p className="mt-4 text-sm text-ink-muted">Open a series to lock a course and a criterion.</p>
        )}
      </Section>

      <Section n={1} kicker="Rule 5" title="Condition of measurement">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Physical load in the prior 24 h">
            <RadioGroup
              className="grid grid-cols-3 gap-2"
              value={
                visit.prior24h.session == null ? "" : visit.prior24h.session ? "yes" : "no"
              }
              onValueChange={(val) =>
                patch({
                  prior24h: { ...visit.prior24h, session: val === "yes" },
                })
              }
            >
              {[
                ["yes", "Yes"],
                ["no", "No"],
              ].map(([val, lab]) => (
                <label
                  key={val}
                  className="flex min-h-11 items-center gap-2 rounded-sm border border-line bg-bg-elevated px-3"
                >
                  <RadioGroupItem value={val} />
                  <span className="text-sm">{lab}</span>
                </label>
              ))}
            </RadioGroup>
          </Field>
          <Field label="Estimated minutes">
            <Input
              inputMode="numeric"
              value={visit.prior24h.minutes ?? ""}
              onChange={(e) =>
                patch({
                  prior24h: { ...visit.prior24h, minutes: parseNum(e.target.value) },
                })
              }
            />
          </Field>
          <Field label="Last meal clock">
            <Input
              value={visit.prior24h.lastMealClock}
              onChange={(e) =>
                patch({ prior24h: { ...visit.prior24h, lastMealClock: e.target.value } })
              }
              placeholder="07:30"
            />
          </Field>
          <Field label="Time since last meal">
            <Input
              value={visit.condition.timeSinceMeal}
              onChange={(e) =>
                patch({ condition: { ...visit.condition, timeSinceMeal: e.target.value } })
              }
              placeholder="2 h"
            />
          </Field>
          <Field label="Last caffeine">
            <Input
              value={visit.prior24h.lastCaffeine}
              onChange={(e) =>
                patch({ prior24h: { ...visit.prior24h, lastCaffeine: e.target.value } })
              }
            />
          </Field>
          <Field label="Last alcohol">
            <Input
              value={visit.prior24h.lastAlcohol}
              onChange={(e) =>
                patch({ prior24h: { ...visit.prior24h, lastAlcohol: e.target.value } })
              }
            />
          </Field>
          <Field label="Night length (h)">
            <Input
              inputMode="decimal"
              value={visit.prior24h.nightLengthHours ?? ""}
              onChange={(e) =>
                patch({
                  prior24h: { ...visit.prior24h, nightLengthHours: parseNum(e.target.value) },
                })
              }
            />
          </Field>
          <Field label="Time since last physical exertion">
            <Input
              value={visit.condition.timeSinceExertion}
              onChange={(e) =>
                patch({
                  condition: { ...visit.condition, timeSinceExertion: e.target.value },
                })
              }
              placeholder=">18 h"
            />
          </Field>
          <Field label="Nature of that load">
            <Input
              value={visit.condition.natureOfLoad}
              onChange={(e) =>
                patch({
                  condition: { ...visit.condition, natureOfLoad: e.target.value },
                })
              }
              placeholder="What it was, not only that there was one."
            />
          </Field>
          <Field label="Time seated before the draw">
            <Input
              value={visit.condition.timeSeated}
              onChange={(e) =>
                patch({
                  condition: { ...visit.condition, timeSeated: e.target.value },
                })
              }
              placeholder="10 min"
            />
          </Field>
        </div>
      </Section>

      <Section n={2} kicker="Rule 2 · write first" title="Demand this visit">
        <Field
          label="What was asked"
          hint="Walk, chair rise, grip, stair, draw. Written before scores."
        >
          <Textarea
            value={visit.demandThisVisit}
            onChange={(e) => patch({ demandThisVisit: e.target.value })}
            rows={3}
          />
        </Field>
      </Section>

      <Section n={3} kicker="Usual pace · three trials, all recorded" title="Gait">
        <p className="mb-3 text-sm text-ink-muted">
          Stated distance with a stated acceleration and deceleration zone. Discarding the three
          trials is the error this specification exists to correct.
        </p>
        <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
          <div>
            <p className="mb-2 text-sm font-medium">
              Timing trial {gaitSlot + 1}
              {person ? (
                <span className="ml-2 font-normal text-ink-subtle">
                  over {person.criteria.gaitCourseM} m
                </span>
              ) : null}
            </p>
            <div className="mb-3 flex gap-2">
              {([0, 1, 2] as const).map((i) => (
                <Button
                  key={i}
                  type="button"
                  size="sm"
                  variant={gaitSlot === i ? "default" : "outline"}
                  onClick={() => setGaitSlot(i)}
                >
                  Trial {i + 1}
                </Button>
              ))}
            </div>
            <Stopwatch
              label="Corridor stopwatch"
              commitLabel={`Record trial ${gaitSlot + 1}`}
              onCommit={(seconds) => {
                const next = [...visit.gaitTimesSec] as Visit["gaitTimesSec"];
                next[gaitSlot] = seconds;
                patch({ gaitTimesSec: next });
                if (gaitSlot < 2) setGaitSlot((gaitSlot + 1) as 0 | 1 | 2);
              }}
            />
          </div>
          <div className="grid content-start gap-3">
            <Triple
              values={visit.gaitTimesSec}
              onChange={(gaitTimesSec) => patch({ gaitTimesSec })}
              unit="s"
              labels={["Trial 1 (s)", "Trial 2 (s)", "Trial 3 (s)"]}
            />
            {person
              ? trials.map((t) => (
                  <div
                    key={t.i}
                    className="flex items-center justify-between rounded-md bg-bg-elevated px-3 py-2 text-sm"
                  >
                    <span className="tabular-nums">{formatMs(t.speed)}</span>
                    {t.clears == null ? (
                      <Badge variant="outline">blank</Badge>
                    ) : t.clears ? (
                      <Badge variant="sage">clears {person.criteria.gaitCriterionMs}</Badge>
                    ) : (
                      <Badge variant="rust">below {person.criteria.gaitCriterionMs}</Badge>
                    )}
                  </div>
                ))
              : null}
          </div>
        </div>
      </Section>

      <Section n={4} kicker="Five rises · arms folded" title="Chair rise">
        <p className="mb-3 text-sm text-ink-muted">
          Recorded as completed or not completed, and if completed, the time. A failure to complete
          is data, not a missing value.
        </p>
        <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
          <Stopwatch
            label="Five-rise stopwatch"
            commitLabel="Record time"
            onCommit={(seconds) =>
              patch({ chair: { completed: true, timeSec: seconds } })
            }
          />
          <div className="grid gap-3">
            <Field label="Completed">
              <RadioGroup
                className="grid grid-cols-2 gap-2"
                value={
                  visit.chair.completed == null
                    ? ""
                    : visit.chair.completed
                      ? "yes"
                      : "no"
                }
                onValueChange={(val) =>
                  patch({
                    chair: {
                      completed: val === "yes",
                      timeSec: val === "no" ? null : visit.chair.timeSec,
                    },
                  })
                }
              >
                <label className="flex min-h-11 items-center gap-2 rounded-sm border border-line bg-bg-elevated px-3">
                  <RadioGroupItem value="yes" />
                  <span className="text-sm">Completed</span>
                </label>
                <label className="flex min-h-11 items-center gap-2 rounded-sm border border-line bg-bg-elevated px-3">
                  <RadioGroupItem value="no" />
                  <span className="text-sm">Not completed</span>
                </label>
              </RadioGroup>
            </Field>
            <Field label="Time (s)">
              <Input
                inputMode="decimal"
                className="tabular-nums"
                value={visit.chair.timeSec ?? ""}
                onChange={(e) =>
                  patch({
                    chair: { ...visit.chair, timeSec: parseNum(e.target.value) },
                  })
                }
              />
            </Field>
          </div>
        </div>
      </Section>

      <Section n={5} kicker="Three each hand · all six recorded" title="Grip">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="mb-2 text-sm font-medium">Left (kg)</p>
            <Triple
              values={visit.gripKg.left}
              onChange={(left) => patch({ gripKg: { ...visit.gripKg, left } })}
              unit="kg"
              labels={["L1", "L2", "L3"]}
            />
          </div>
          <div>
            <p className="mb-2 text-sm font-medium">Right (kg)</p>
            <Triple
              values={visit.gripKg.right}
              onChange={(right) => patch({ gripKg: { ...visit.gripKg, right } })}
              unit="kg"
              labels={["R1", "R2", "R3"]}
            />
          </div>
        </div>
        {person?.criteria.gripCriterionKg != null ? (
          <p className="mt-3 text-xs text-ink-subtle">
            Clinic criterion {person.criteria.gripCriterionKg.toFixed(1)} kg (
            {kgToLb(person.criteria.gripCriterionKg).toFixed(0)} lb). Operating convention — Rice,
            Leonard and Carter found only weak correlation with everyday container forces.
          </p>
        ) : null}
      </Section>

      <Section n={6} kicker="The week as it actually went" title="Demand account">
        <div className="grid gap-4">
          {DEMAND_QUESTIONS.map((q) => (
            <Field key={q.key} label={q.label} hint={q.hint}>
              {q.key === "stairFlights" ? (
                <Input
                  inputMode="numeric"
                  value={visit.demandAccount.stairFlights ?? ""}
                  onChange={(e) =>
                    patch({
                      demandAccount: {
                        ...visit.demandAccount,
                        stairFlights: parseNum(e.target.value),
                      },
                    })
                  }
                />
              ) : (
                <Textarea
                  rows={2}
                  value={visit.demandAccount[q.key]}
                  onChange={(e) =>
                    patch({
                      demandAccount: { ...visit.demandAccount, [q.key]: e.target.value },
                    })
                  }
                />
              )}
            </Field>
          ))}
        </div>
      </Section>

      <Section n={7} kicker="The question that is not on any other form" title="Stopped tasks">
        <Field
          label="What did you stop doing since the last visit, and who or what does it now?"
        >
          <Textarea
            rows={3}
            value={visit.stoppedDetail}
            onChange={(e) => patch({ stoppedDetail: e.target.value })}
          />
        </Field>
      </Section>

      <Section n={8} kicker="For the rebase pattern" title="Self-report of function">
        <p className="mb-3 text-sm text-ink-muted">
          Holds or falls against the person’s own report — not against the criterion.
        </p>
        <RadioGroup
          className="grid gap-2 sm:grid-cols-3"
          value={visit.selfReportFunction}
          onValueChange={(val) => patch({ selfReportFunction: val as HoldsFalls })}
        >
          {(
            [
              ["holds", "Holds"],
              ["falls", "Falls"],
              ["uncertain", "Uncertain"],
            ] as const
          ).map(([val, lab]) => (
            <label
              key={val}
              className="flex min-h-11 items-center gap-2 rounded-sm border border-line bg-bg-elevated px-3"
            >
              <RadioGroupItem value={val} />
              <span className="text-sm">{lab}</span>
            </label>
          ))}
        </RadioGroup>
      </Section>

      <Section n={9} kicker="Rule 1" title="Rebase flag">
        <Field label="Did the person complete the original course?">
          <RadioGroup
            className="grid gap-2 sm:grid-cols-2"
            value={
              visit.rebase.completedOriginalCourse == null
                ? ""
                : visit.rebase.completedOriginalCourse
                  ? "yes"
                  : "no"
            }
            onValueChange={(val) =>
              patch({
                rebase: {
                  ...visit.rebase,
                  completedOriginalCourse: val === "yes",
                },
              })
            }
          >
            <label className="flex min-h-11 items-center gap-2 rounded-sm border border-line bg-bg-elevated px-3">
              <RadioGroupItem value="yes" />
              <span className="text-sm">Yes — original course</span>
            </label>
            <label className="flex min-h-11 items-center gap-2 rounded-sm border border-line bg-bg-elevated px-3">
              <RadioGroupItem value="no" />
              <span className="text-sm">No — fail the original</span>
            </label>
          </RadioGroup>
        </Field>
        {visit.rebase.completedOriginalCourse === false ? (
          <div className="mt-4">
            <Field
              label="Name of the substitute"
              hint="Do not overwrite the old criterion. A shorter hallway is not a stable gait speed."
            >
              <Input
                value={visit.rebase.substituteTask}
                onChange={(e) =>
                  patch({ rebase: { ...visit.rebase, substituteTask: e.target.value } })
                }
              />
            </Field>
          </div>
        ) : null}
      </Section>

      <Section n={10} kicker="One letter. Guessing is allowed." title="Determinant named">
        <RadioGroup
          className="grid gap-2 sm:grid-cols-2"
          value={visit.determinantGuess}
          onValueChange={(val) => patch({ determinantGuess: val as Determinant })}
        >
          {(Object.keys(DETERMINANT_LABEL) as Determinant[]).map((id) => (
            <label
              key={id}
              className="flex min-h-11 items-center gap-2 rounded-sm border border-line bg-bg-elevated px-3"
            >
              <RadioGroupItem value={id} />
              <span className="text-sm">{DETERMINANT_LABEL[id]}</span>
            </label>
          ))}
        </RadioGroup>
      </Section>

      <Section n={11} kicker="II / III when drawn" title="Labs this visit">
        <Field
          label="Which of II/III drawn. Fasting state. Hours since last hard session."
          hint="A blank means unknown; it does not mean not drawn. Condition of measurement applies with full force here."
        >
          <Textarea
            rows={3}
            value={visit.labsThisVisit}
            onChange={(e) => patch({ labsThisVisit: e.target.value })}
          />
        </Field>
      </Section>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <Button type="button" size="lg" onClick={save} disabled={!person}>
          Record visit
        </Button>
      </div>

      <PersonDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={(id) => {
          setActivePerson(id);
          setVisit((v) => ({ ...v, personId: id }));
        }}
      />
    </div>
  );
}

export { gaitSpeed };
