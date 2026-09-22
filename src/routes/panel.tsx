import { useState } from "react";
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
import { InstrumentBadge } from "@/components/instrument-badge";
import { PersonDialog } from "@/components/person-dialog";
import {
  CROSS_CUTTING,
  DETERMINANT_PANEL,
  TIER_LEGEND,
} from "@/lib/protocol/content";
import { panelInventory } from "@/lib/protocol/compute";
import { emptyPanelReading, useProtocolStore } from "@/lib/protocol/store";
import type { Determinant, PanelReading } from "@/lib/protocol/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/panel")({ component: PanelPage });

function PanelPage() {
  const people = useProtocolStore((s) => s.people);
  const hydrated = useProtocolStore((s) => s.hydrated);
  const activePersonId = useProtocolStore((s) => s.activePersonId);
  const setActivePerson = useProtocolStore((s) => s.setActivePerson);
  const addPanelReading = useProtocolStore((s) => s.addPanelReading);
  const removePanelReading = useProtocolStore((s) => s.removePanelReading);
  const panelReadings = useProtocolStore((s) => s.panelReadings);
  const [createOpen, setCreateOpen] = useState(false);
  const [open, setOpen] = useState<Exclude<Determinant, "uncertain">>("I");
  const selectedId = activePersonId ?? people[0]?.id ?? null;
  const person = people.find((p) => p.id === selectedId);
  const [reading, setReading] = useState<PanelReading>(() =>
    emptyPanelReading(selectedId ?? "pending"),
  );
  const det = DETERMINANT_PANEL.find((d) => d.id === open) ?? DETERMINANT_PANEL[0]!;
  const inventory = panelInventory(reading.values);
  const series = panelReadings
    .filter((r) => r.personId === selectedId)
    .sort((a, b) => b.isoDate.localeCompare(a.isoDate));

  const patchValue = (id: string, value: string) =>
    setReading((r) => ({ ...r, values: { ...r.values, [id]: value } }));
  const patchCondition = (id: string, value: string) =>
    setReading((r) => ({ ...r, conditions: { ...r.conditions, [id]: value } }));

  const save = () => {
    if (!person) {
      toast.error("Name a series before you record a panel.");
      return;
    }
    addPanelReading({
      ...reading,
      personId: person.id,
      createdAt: new Date().toISOString(),
    });
    toast.success("Panel recorded. Candidates do not veto validated components.");
    setReading(emptyPanelReading(person.id));
  };

  if (!hydrated && people.length === 0) {
    return <p className="text-sm text-ink-muted">Loading the instrument…</p>;
  }

  return (
    <div className="grid gap-5">
      <header>
        <p className="text-[0.65rem] font-medium uppercase tracking-[0.18em] text-ink-subtle">
          Tier Three · interval of the source tests
        </p>
        <h1 className="mt-2 font-display text-4xl font-medium leading-tight">
          The full determinant panel
        </h1>
        <p className="mt-4 max-w-2xl text-ink-muted">
          Maps the five determinants onto the biomarker tiers the published paper already
          specifies. VALIDATED names an established component test. It does not mean this protocol
          has been shown to estimate functional reserve. Record if available; do not let a
          candidate veto a validated component.
        </p>
      </header>

      <Section kicker="Tiers follow the component test, not reserve estimation" title="How to read the table">
        <div className="grid gap-3 sm:grid-cols-2">
          {TIER_LEGEND.map((item) => (
            <div key={item.status} className="flex items-start gap-3 rounded-lg bg-bg-elevated p-3">
              <InstrumentBadge status={item.status} />
              <p className="text-sm text-ink-muted">{item.rule}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-sm text-ink-muted">{CROSS_CUTTING}</p>
      </Section>

      <Section kicker="One letter. Guessing is allowed later." title="Series and clock">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Series">
            <div className="flex gap-2">
              <Select
                value={selectedId ?? ""}
                onValueChange={(id) => {
                  setActivePerson(id);
                  setReading((r) => ({ ...r, personId: id }));
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
                value={reading.isoDate}
                onChange={(e) => setReading((r) => ({ ...r, isoDate: e.target.value }))}
              />
            </Field>
            <Field label="Clock">
              <Input
                type="time"
                value={reading.localTime}
                onChange={(e) => setReading((r) => ({ ...r, localTime: e.target.value }))}
              />
            </Field>
          </div>
        </div>
      </Section>

      <div className="flex flex-wrap gap-2">
        {DETERMINANT_PANEL.map((d) => (
          <button
            key={d.id}
            type="button"
            onClick={() => setOpen(d.id)}
            className={cn(
              "min-h-11 rounded-sm px-4 text-sm font-medium transition-colors duration-150",
              open === d.id ? "bg-teal text-teal-fg" : "bg-surface text-ink hover:bg-teal-soft",
            )}
          >
            {d.id} · {d.name}
          </button>
        ))}
      </div>

      <Section kicker={det.evidence} title={`${det.id} · ${det.name}`}>
        <p className="text-sm text-ink-muted">{det.thesis}</p>
        <div className="mt-5 grid gap-5">
          {det.measures.map((m) => (
            <div key={m.id} className="rounded-lg bg-bg-elevated p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-medium">{m.name}</p>
                  <p className="mt-1 text-sm text-ink-muted">{m.how}</p>
                  <p className="mt-1 text-xs text-ink-subtle">{m.interval}</p>
                </div>
                <InstrumentBadge status={m.status} />
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <Field label="Recorded value">
                  <Input
                    value={reading.values[m.id] ?? ""}
                    onChange={(e) => patchValue(m.id, e.target.value)}
                    placeholder="Blank means unknown, not normal."
                  />
                </Field>
                <Field label="Condition of this sample">
                  <Input
                    value={reading.conditions[m.id] ?? ""}
                    onChange={(e) => patchCondition(m.id, e.target.value)}
                    placeholder="Load, clock, fasting, seated…"
                  />
                </Field>
              </div>
            </div>
          ))}
        </div>
        {det.clinicMinimum ? (
          <p className="mt-4 rounded-lg bg-sage-soft/70 px-4 py-3 text-sm">{det.clinicMinimum}</p>
        ) : null}
        {det.note ? (
          <p className="mt-3 rounded-lg bg-amber-soft/70 px-4 py-3 text-sm">{det.note}</p>
        ) : null}
      </Section>

      <Section kicker="Do not average determinants" title="What this panel currently holds">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat
            label="Validated present"
            value={String(inventory.validatedPresent.length)}
            hint={inventory.validatedPresent.join(", ") || "None yet."}
            tone="sage"
          />
          <Stat
            label="Validated blank"
            value={String(inventory.validatedMissing.length)}
            hint={inventory.validatedMissing.join(", ") || "All recorded."}
            tone={inventory.validatedMissing.length ? "rust" : "sage"}
          />
          <Stat
            label="Candidates recorded"
            value={String(inventory.candidatesPresent.length)}
            hint="Do not let these veto a validated component."
            tone="amber"
          />
          <Stat
            label="Empty determinants"
            value={inventory.emptyDeterminants.join(", ") || "none"}
            hint="III and IV have no validated instrument. Leaving them empty is correct."
          />
        </div>
        <Field label="Notes">
          <Textarea
            rows={3}
            className="mt-2"
            value={reading.notes}
            onChange={(e) => setReading((r) => ({ ...r, notes: e.target.value }))}
          />
        </Field>
        <div className="mt-4 flex flex-wrap justify-end gap-2">
          <Button asChild variant="outline">
            <Link to="/effect">What to do with a hole</Link>
          </Button>
          <Button type="button" size="lg" onClick={save} disabled={!person}>
            Record panel
          </Button>
        </div>
      </Section>

      <Section kicker="Recorded panels" title={person ? person.label : "No series"}>
        {series.length === 0 ? (
          <p className="text-sm text-ink-muted">
            No panels on this series yet. The teaching example sits on the exam-room series.
          </p>
        ) : (
          <div className="grid gap-3">
            {series.map((r) => {
              const inv = panelInventory(r.values);
              const filled = Object.entries(r.values).filter(([, v]) => v.trim());
              return (
                <div key={r.id} className="rounded-lg bg-bg-elevated p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium">
                        {r.isoDate} · {filled.length} measures
                      </p>
                      <p className="mt-1 text-sm text-ink-muted">
                        Validated {inv.validatedPresent.length}
                        {inv.validatedMissing.length
                          ? ` · blank ${inv.validatedMissing.join(", ")}`
                          : ""}
                      </p>
                      {r.notes ? <p className="mt-2 text-sm text-ink-muted">{r.notes}</p> : null}
                    </div>
                    <button
                      type="button"
                      className="text-xs text-ink-subtle hover:text-rust"
                      onClick={() => removePanelReading(r.id)}
                    >
                      Remove
                    </button>
                  </div>
                  <ul className="mt-3 grid gap-1 text-sm">
                    {filled.map(([id, value]) => {
                      const measure = DETERMINANT_PANEL.flatMap((d) => d.measures).find(
                        (m) => m.id === id,
                      );
                      return (
                        <li key={id} className="flex flex-wrap justify-between gap-2">
                          <span className="text-ink-muted">{measure?.name ?? id}</span>
                          <span className="tabular-nums">{value}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </div>
        )}
      </Section>

      <PersonDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={(id) => {
          setActivePerson(id);
          setReading((r) => ({ ...r, personId: id }));
        }}
      />
    </div>
  );
}
