import { createFileRoute } from "@tanstack/react-router"
import { LeadDetailContent } from "@/routes/admin/lead/$leadId"

export const Route = createFileRoute("/manager/lead/$leadId/")({
  component: RouteComponent,
})

function RouteComponent() {
  const { leadId } = Route.useParams()
  return <LeadDetailContent leadId={leadId} basePath="/manager" />
}