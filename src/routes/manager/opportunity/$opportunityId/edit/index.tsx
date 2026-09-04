import { createFileRoute } from "@tanstack/react-router"
import { OpportunityEditPage } from "@/routes/admin/opportunity/$opportunityId/edit"

export const Route = createFileRoute("/manager/opportunity/$opportunityId/edit/")({
  component: RouteComponent,
})

function RouteComponent() {
  const { opportunityId } = Route.useParams()
  return <OpportunityEditPage opportunityId={Number(opportunityId)} basePath="/manager" />
}