import { createFileRoute } from "@tanstack/react-router";
import { VisitSheet } from "@/components/visit-sheet";

type VisitSearch = { personId?: string };

export const Route = createFileRoute("/visit/")({
  validateSearch: (s: Record<string, unknown>): VisitSearch => ({
    personId: typeof s.personId === "string" ? s.personId : undefined,
  }),
  component: VisitPage,
});

function VisitPage() {
  const { personId } = Route.useSearch();
  return <VisitSheet personId={personId} />;
}
