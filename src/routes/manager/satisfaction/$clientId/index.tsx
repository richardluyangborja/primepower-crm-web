import { createFileRoute } from "@tanstack/react-router"
import { SatisfactionDetailPage } from "@/routes/admin/satisfaction/$clientId"

export const Route = createFileRoute("/manager/satisfaction/$clientId/")({
  component: RouteComponent,
})

function RouteComponent() {
  const { clientId } = Route.useParams()
  return <SatisfactionDetailPage clientId={Number(clientId)} />
}