import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { VisitReading } from "@/components/visit-reading";
import { TrajectoryChart } from "@/components/trajectory-chart";
import { visitsChronological } from "@/lib/protocol/compute";
import { useProtocolStore } from "@/lib/protocol/store";

export const Route = createFileRoute("/visit/$visitId")({
  component: VisitResultPage,
});

function VisitResultPage() {
  const { visitId } = Route.useParams();
  const people = useProtocolStore((s) => s.people);
  const allVisits = useProtocolStore((s) => s.visits);
  const visit = allVisits.find((v) => v.id === visitId);
  const person = people.find((p) => p.id === visit?.personId);
  const visits = useMemo(() => {
    const current = allVisits.find((v) => v.id === visitId);
    if (!current) return [];
    return visitsChronological(allVisits.filter((v) => v.personId === current.personId));
  }, [allVisits, visitId]);

  if (!visit || !person) {
    return (
      <div>
        <h1 className="font-display text-2xl">Visit not found</h1>
        <Button asChild className="mt-4" variant="outline">
          <Link to="/visit">Back to clinic card</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[0.65rem] font-medium uppercase tracking-[0.18em] text-ink-subtle">
            Visit reading
          </p>
          <h1 className="font-display text-3xl font-medium">Against the fixed criterion</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link to="/series/$personId" params={{ personId: person.id }}>
              Series
            </Link>
          </Button>
          <Button asChild>
            <Link to="/visit" search={{ personId: person.id }}>
              New visit
            </Link>
          </Button>
        </div>
      </div>
      <VisitReading person={person} visit={visit} visits={visits} />
      <div className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)] sm:p-6">
        <h2 className="font-display text-lg font-medium">Course of gait speed</h2>
        <p className="mb-4 mt-1 text-sm text-ink-muted">
          Dashed line is the criterion. Grey marks are individual trials. Teal is the visit median.
        </p>
        <TrajectoryChart visits={visits} criteria={person.criteria} />
      </div>
    </div>
  );
}
