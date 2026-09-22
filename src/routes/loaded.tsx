import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Field, Section, Stat } from "@/components/section";
import { RecoveryChart } from "@/components/recovery-chart";
import { PersonDialog } from "@/components/person-dialog";
import { CONDITION_FIELDS, TIER_TWO_DETAIL } from "@/lib/protocol/content";
import {
  fitRecoveryRateConstant,
  formatRecoveryK,
  restingDisagreement,
} from "@/lib/protocol/compute";
import {
  emptyLoadedBout,
  useProtocolStore,
} from "@/lib/protocol/store";
import type { ConditionOfMeasurement, LoadedBout } from "@/lib/protocol/types";

export const Route = createFileRoute("/loaded")({ component: LoadedPage });

function parseNum(raw: string): number | null {
  if (raw.trim() === "") return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

function LoadedPage() {
  const people = useProtocolStore((s) => s.people);
  const hydrated = useProtocolStore((s) => s.hydrated);
  const activePersonId = useProtocolStore((s) => s.activePersonId);
  const setActivePerson = useProtocolStore((s) => s.setActivePerson);
  const addLoadedBout = useProtocolStore((s) => s.addLoadedBout);
  const removeLoadedBout = useProtocolStore((s) => s.removeLoadedBout);
  const loadedBouts = useProtocolStore((s) => s.loadedBouts);
  const [createOpen, setCreateOpen] = useState(false);
  const selectedId = activePersonId ?? people[0]?.id ?? null;
  const person = people.find((p) => p.id === selectedId);
  const [bout, setBout] = useState<LoadedBout>(() => emptyLoadedBout(selectedId ?? "pending"));

  const patch = (partial: Partial<LoadedBout>) => setBout((b) => ({ ...b, ...partial }));
  const patchCondition = (key: keyof ConditionOfMeasurement, value: string) =>
    patch({ condition: { ...bout.condition, [key]: value } });

  const series = loadedBouts
    .filter((b) => b.personId === selectedId)
    .sort((a, b) => b.isoDate.localeCompare(a.isoDate));

  const restInfo = restingDisagreement(bout);
  const fit = restInfo.rest != null ? fitRecoveryRateConstant(restInfo.rest, bout.samples) : null;

  const liveBout = useMemo(() => bout, [bout]);

  const save = () => {
    if (!person) {
      toast.error("Name a series before you record a bout.");
      return;
    }
    if (!bout.bout.description.trim()) {
      toast.error("Specify the bout in advance. The specification does not name it for you.");
      return;
    }
    const next: LoadedBout = {
      ...bout,
      personId: person.id,
      createdAt: new Date().toISOString(),
    };
    addLoadedBout(next);
    toast.success("Loaded bout recorded. The quantity is the rate of return.");
    setBout(emptyLoadedBout(person.id));
  };

  if (!hydrated && people.length === 0) {
    return <p className="text-sm text-ink-muted">Loading the instrument…</p>;
  }

  return (
    <div className="grid gap-5">
      <header>
        <p className="text-[0.65rem] font-medium uppercase tracking-[0.18em] text-ink-subtle">
          Tier Two · thirty to forty minutes plus a sampling window
        </p>
        <h1 className="mt-2 font-display text-4xl font-medium leading-tight">The loaded protocol</h1>
        <p className="mt-4 max-w-2xl text-ink-muted">
          A standardized load, then the recovery limb. Two resting measurements on separate
          occasions. Sampling out to six hours. The quantity is the rate constant of return toward
          the individual’s own resting value — not the peak, and not the trough.
        </p>
      </header>

      <Section kicker="Rule 8" title="Requirements the bout must meet">
        <ol className="grid gap-2 sm:grid-cols-2">
          {TIER_TWO_DETAIL.load.requirements.map((req, i) => (
            <li key={req} className="flex gap-3 rounded-lg bg-bg-elevated px-4 py-3 text-sm">
              <span className="font-display text-teal tabular-nums">{i + 1}</span>
              <span>{req}</span>
            </li>
          ))}
        </ol>
        <p className="mt-4 text-sm text-ink-muted">{TIER_TWO_DETAIL.load.note}</p>
      </Section>

      <Section kicker="Same series · same bout every administration" title="Specify the load">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Series">
            <div className="flex gap-2">
              <Select
                value={selectedId ?? ""}
                onValueChange={(id) => {
                  setActivePerson(id);
                  setBout((b) => ({ ...b, personId: id }));
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
            <Field label="Date of load">
              <Input type="date" value={bout.isoDate} onChange={(e) => patch({ isoDate: e.target.value })} />
            </Field>
            <Field label="Clock">
              <Input
                type="time"
                value={bout.localTime}
                onChange={(e) =>
                  patch({
                    localTime: e.target.value,
                    condition: { ...bout.condition, timeOfDay: e.target.value },
                  })
                }
              />
            </Field>
          </div>
          <Field label="Marker">
            <Select
              value={bout.marker}
              onValueChange={(marker) => {
                const found = TIER_TWO_DETAIL.markers.find((m) => m.name === marker);
                patch({ marker, unit: found?.unit ?? bout.unit });
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIER_TWO_DETAIL.markers.map((m) => (
                  <SelectItem key={m.name} value={m.name}>
                    {m.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Unit">
            <Input value={bout.unit} onChange={(e) => patch({ unit: e.target.value })} />
          </Field>
          <Field
            label="The bout, specified in advance"
            hint="Reproducible, submaximal, tolerable, identical across administrations. Do not invent a named protocol here."
          >
            <Textarea
              rows={3}
              value={bout.bout.description}
              onChange={(e) => patch({ bout: { ...bout.bout, description: e.target.value } })}
            />
          </Field>
          <div className="grid gap-4">
            <Field label="Duration (min)">
              <Input
                inputMode="decimal"
                className="tabular-nums"
                value={bout.bout.durationMin ?? ""}
                onChange={(e) =>
                  patch({ bout: { ...bout.bout, durationMin: parseNum(e.target.value) } })
                }
              />
            </Field>
            <Field label="Modality">
              <Input
                value={bout.bout.modality}
                onChange={(e) => patch({ bout: { ...bout.bout, modality: e.target.value } })}
                placeholder="cycle, treadmill, walk…"
              />
            </Field>
            <Field label="Intensity">
              <Input
                value={bout.bout.intensity}
                onChange={(e) => patch({ bout: { ...bout.bout, intensity: e.target.value } })}
                placeholder="submaximal, RPE, % HRR…"
              />
            </Field>
          </div>
        </div>
      </Section>

      <Section kicker="One is not enough" title="Two resting measurements">
        <p className="mb-4 text-sm text-ink-muted">
          Separate occasions, to establish the individual’s own resting value. A single resting
          value cannot be distinguished from an excursion.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          {bout.resting.map((r, i) => (
            <div key={i} className="grid gap-3 rounded-lg bg-bg-elevated p-4">
              <Field label={i === 0 ? "Occasion 1" : "Occasion 2"}>
                <Input
                  value={r.occasion}
                  onChange={(e) => {
                    const next = [...bout.resting] as LoadedBout["resting"];
                    next[i] = { ...next[i]!, occasion: e.target.value };
                    patch({ resting: next });
                  }}
                  placeholder="Date and clock"
                />
              </Field>
              <Field label={`Resting ${bout.unit || "value"}`}>
                <Input
                  inputMode="decimal"
                  className="tabular-nums"
                  value={r.value ?? ""}
                  onChange={(e) => {
                    const next = [...bout.resting] as LoadedBout["resting"];
                    next[i] = { ...next[i]!, value: parseNum(e.target.value) };
                    patch({ resting: next });
                  }}
                />
              </Field>
            </div>
          ))}
        </div>
        {restInfo.warn ? (
          <p className="mt-4 rounded-lg bg-amber-soft/70 px-4 py-3 text-sm">{restInfo.warn}</p>
        ) : restInfo.rest != null ? (
          <p className="mt-4 text-sm text-ink-muted">
            Resting value used: <span className="tabular-nums text-ink">{restInfo.rest.toFixed(1)}</span>{" "}
            {bout.unit}.
          </p>
        ) : null}
      </Section>

      <Section kicker="Out to six hours" title="Recovery samples">
        <p className="mb-4 text-sm text-ink-muted">{TIER_TWO_DETAIL.recovery.note}</p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[20rem] text-left text-sm">
            <thead className="border-b border-line text-[0.65rem] uppercase tracking-[0.14em] text-ink-subtle">
              <tr>
                <th className="px-2 py-2 font-medium">Hours after load</th>
                <th className="px-2 py-2 font-medium">{bout.unit || "Value"}</th>
                <th className="px-2 py-2 font-medium" />
              </tr>
            </thead>
            <tbody>
              {bout.samples.map((s, i) => (
                <tr key={`${s.hoursAfterLoad}-${i}`} className="border-b border-line/80 last:border-0">
                  <td className="px-2 py-2">
                    <Input
                      inputMode="decimal"
                      className="tabular-nums"
                      value={s.hoursAfterLoad}
                      onChange={(e) => {
                        const next = [...bout.samples];
                        next[i] = { ...next[i]!, hoursAfterLoad: Number(e.target.value) || 0 };
                        patch({ samples: next });
                      }}
                    />
                  </td>
                  <td className="px-2 py-2">
                    <Input
                      inputMode="decimal"
                      className="tabular-nums"
                      value={s.value ?? ""}
                      onChange={(e) => {
                        const next = [...bout.samples];
                        next[i] = { ...next[i]!, value: parseNum(e.target.value) };
                        patch({ samples: next });
                      }}
                    />
                  </td>
                  <td className="px-2 py-2 text-right">
                    <button
                      type="button"
                      className="text-xs text-ink-subtle hover:text-rust"
                      onClick={() =>
                        patch({ samples: bout.samples.filter((_, j) => j !== i) })
                      }
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Button
          type="button"
          variant="outline"
          className="mt-3"
          onClick={() =>
            patch({
              samples: [
                ...bout.samples,
                {
                  hoursAfterLoad: (bout.samples.at(-1)?.hoursAfterLoad ?? 6) + 0.5,
                  value: null,
                },
              ],
            })
          }
        >
          Add sample
        </Button>
      </Section>

      <Section kicker="Five fields · the whole cost" title="Condition of measurement">
        <div className="grid gap-4 sm:grid-cols-2">
          {CONDITION_FIELDS.map((f) => (
            <Field key={f.key} label={f.label} hint={f.hint}>
              <Input
                value={bout.condition[f.key]}
                onChange={(e) => patchCondition(f.key, e.target.value)}
              />
            </Field>
          ))}
        </div>
      </Section>

      <Section kicker="Rule 4 applied to hours" title="Rate of return">
        <div className="grid gap-4 sm:grid-cols-3">
          <Stat
            label="Rest"
            value={restInfo.rest != null ? `${restInfo.rest.toFixed(1)} ${bout.unit}` : "—"}
            hint="Median of the two restings."
          />
          <Stat
            label="k"
            value={fit ? formatRecoveryK(fit.k) : "—"}
            hint={
              fit
                ? fit.halfLifeHours != null
                  ? `t½ ${fit.halfLifeHours.toFixed(2)} h`
                  : "Non-negative k — not returning."
                : "Need three samples away from rest."
            }
            tone={fit && fit.k < 0 ? "teal" : "amber"}
          />
          <Stat
            label="Peak displacement"
            value={
              fit?.peakDisplacement != null
                ? `${fit.peakDisplacement > 0 ? "+" : ""}${fit.peakDisplacement.toFixed(1)} ${bout.unit}`
                : "—"
            }
            hint="Not the quantity. Speed of return is."
          />
        </div>
        <div className="mt-6">
          <RecoveryChart bout={liveBout} />
        </div>
        <Field label="Notes" hint="Optional. Do not fold a demand shock into k.">
          <Textarea rows={2} value={bout.notes} onChange={(e) => patch({ notes: e.target.value })} />
        </Field>
        <div className="mt-4 flex justify-end">
          <Button type="button" size="lg" onClick={save} disabled={!person}>
            Record loaded bout
          </Button>
        </div>
      </Section>

      <Section kicker="Recorded recoveries" title={person ? person.label : "No series"}>
        {series.length === 0 ? (
          <p className="text-sm text-ink-muted">
            No loaded bouts on this series yet. The teaching example sits on the exam-room series.
          </p>
        ) : (
          <div className="grid gap-4">
            {series.map((b) => {
              const info = restingDisagreement(b);
              const k = info.rest != null ? fitRecoveryRateConstant(info.rest, b.samples) : null;
              return (
                <div key={b.id} className="rounded-lg bg-bg-elevated p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium">
                        {b.isoDate} · {b.marker}
                      </p>
                      <p className="mt-1 text-sm text-ink-muted">{b.bout.description}</p>
                    </div>
                    <Stat
                      label="k"
                      value={k ? formatRecoveryK(k.k) : "—"}
                      hint={k?.halfLifeHours != null ? `t½ ${k.halfLifeHours.toFixed(2)} h` : undefined}
                      tone={k && k.k < 0 ? "teal" : "ink"}
                    />
                  </div>
                  <div className="mt-3">
                    <RecoveryChart bout={b} />
                  </div>
                  <button
                    type="button"
                    className="mt-2 text-xs text-ink-subtle hover:text-rust"
                    onClick={() => removeLoadedBout(b.id)}
                  >
                    Remove
                  </button>
                </div>
              );
            })}
          </div>
        )}
        <p className="mt-4 text-sm text-ink-muted">
          Keep the clocks apart. This k is hours-scale recovery. It is not the weeks-scale
          gain–loss ratio.{" "}
          <Link to="/compute" className="text-teal underline-offset-4 hover:underline">
            Compute those separately
          </Link>
          .
        </p>
      </Section>

      <PersonDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={(id) => {
          setActivePerson(id);
          setBout((b) => ({ ...b, personId: id }));
        }}
      />
    </div>
  );
}
