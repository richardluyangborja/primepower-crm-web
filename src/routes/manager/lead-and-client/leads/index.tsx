import { createFileRoute } from "@tanstack/react-router"
import LeadTable from "@/routes/admin/lead-and-client/leads/-LeadTable"

export const Route = createFileRoute("/manager/lead-and-client/leads/")({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div>
      <LeadTable basePath="/manager" />
    </div>
  )
}