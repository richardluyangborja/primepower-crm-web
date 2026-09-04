import { createFileRoute } from "@tanstack/react-router"
import { ClientDetailContent } from "@/routes/admin/client/$clientId"

export const Route = createFileRoute("/manager/client/$clientId/")({
  component: RouteComponent,
})

function RouteComponent() {
  const { clientId } = Route.useParams()
  return <ClientDetailContent clientId={clientId} basePath="/manager" />
}