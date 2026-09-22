import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/section";
import { DEFAULT_CRITERIA, MUTCD_CLEARANCE_MS } from "@/lib/protocol/types";
import { useProtocolStore } from "@/lib/protocol/store";
import { lbToKg } from "@/lib/utils";

export function PersonDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (id: string) => void;
}) {
  const addPerson = useProtocolStore((s) => s.addPerson);
  const [label, setLabel] = useState("");
  const [notes, setNotes] = useState("");
  const [courseM, setCourseM] = useState(String(DEFAULT_CRITERIA.gaitCourseM));
  const [criterion, setCriterion] = useState(String(MUTCD_CLEARANCE_MS));
  const [chair, setChair] = useState(String(DEFAULT_CRITERIA.chairHeightCm));
  const [gripLb, setGripLb] = useState("20");
  const [courseId, setCourseId] = useState(DEFAULT_CRITERIA.courseId);
  const [dyno, setDyno] = useState(DEFAULT_CRITERIA.dynamometerId);

  const submit = () => {
    const gripKg = gripLb.trim() === "" ? null : lbToKg(Number(gripLb));
    const person = addPerson({
      label,
      notes,
      criteria: {
        gaitCourseM: Number(courseM) || DEFAULT_CRITERIA.gaitCourseM,
        gaitCriterionMs: Number(criterion) || MUTCD_CLEARANCE_MS,
        chairHeightCm: Number(chair) || DEFAULT_CRITERIA.chairHeightCm,
        gripCriterionKg: gripKg != null && Number.isFinite(gripKg) ? gripKg : null,
        courseId,
        dynamometerId: dyno,
        accelZoneM: 1,
        decelZoneM: 1,
      },
    });
    setLabel("");
    setNotes("");
    onOpenChange(false);
    onCreated?.(person.id);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New series</DialogTitle>
          <DialogDescription>
            Criteria are stated here and held. After the first visit they lock. A stated
            arbitrary criterion held constant is scientifically superior to a defensible
            criterion that drifts.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <Field label="Label" hint="A name, initials, or clinic ID. Stored on this device only.">
            <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Series label" />
          </Field>
          <Field label="Notes">
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Course length (m)" hint="Marked, with stated accel/decel zones.">
              <Input
                inputMode="decimal"
                value={courseM}
                onChange={(e) => setCourseM(e.target.value)}
              />
            </Field>
            <Field label="Gait criterion (m/s)" hint="MUTCD 11th Ed. Rev. 1 (2025) §4I.06 default: 1.07 m/s. A design value, not a clinical threshold.">
              <Input
                inputMode="decimal"
                value={criterion}
                onChange={(e) => setCriterion(e.target.value)}
              />
            </Field>
            <Field label="Chair seat height (cm)">
              <Input inputMode="decimal" value={chair} onChange={(e) => setChair(e.target.value)} />
            </Field>
            <Field
              label="Grip criterion (lb)"
              hint="Twenty pounds is an operating convention, not a validated everyday-task threshold. State it and hold it. Leave blank for none."
            >
              <Input inputMode="decimal" value={gripLb} onChange={(e) => setGripLb(e.target.value)} />
            </Field>
            <Field label="Course ID">
              <Input value={courseId} onChange={(e) => setCourseId(e.target.value)} />
            </Field>
            <Field label="Dynamometer ID">
              <Input value={dyno} onChange={(e) => setDyno(e.target.value)} />
            </Field>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={!label.trim()}>
            Open series
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
