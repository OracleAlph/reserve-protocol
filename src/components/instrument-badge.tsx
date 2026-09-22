import { Badge } from "@/components/ui/badge";
import type { InstrumentStatus } from "@/lib/protocol/types";

const LABELS: Record<InstrumentStatus, string> = {
  validated: "VALIDATED",
  "validated-cross-cutting": "VALIDATED · cross-cutting",
  candidate: "CANDIDATE",
  exploratory: "EXPLORATORY",
  "crude-proxy": "CRUDE PROXY",
};

const VARIANTS: Record<InstrumentStatus, "sage" | "amber" | "outline" | "rust"> = {
  validated: "sage",
  "validated-cross-cutting": "sage",
  candidate: "amber",
  exploratory: "outline",
  "crude-proxy": "rust",
};

export function InstrumentBadge({ status }: { status: InstrumentStatus }) {
  return <Badge variant={VARIANTS[status]}>{LABELS[status]}</Badge>;
}
