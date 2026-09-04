import { createFileRoute } from "@tanstack/react-router"
import { OpportunityDetailContent } from "@/routes/admin/opportunity/$opportunityId"

export const Route = createFileRoute("/manager/opportunity/$opportunityId/")({
  component: RouteComponent,
})

function RouteComponent() {
  const { opportunityId } = Route.useParams()
  return <OpportunityDetailContent opportunityId={opportunityId} basePath="/manager" />
}