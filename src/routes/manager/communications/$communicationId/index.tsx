import { createFileRoute } from "@tanstack/react-router"
import { CommunicationDetailContent } from "@/routes/admin/communications/$communicationId"

export const Route = createFileRoute("/manager/communications/$communicationId/")(
  {
    component: RouteComponent,
  }
)

function RouteComponent() {
  const { communicationId } = Route.useParams()
  return (
    <CommunicationDetailContent communicationId={communicationId} basePath="/manager" />
  )
}