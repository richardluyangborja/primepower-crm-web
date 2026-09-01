import { createFileRoute } from "@tanstack/react-router"
import LeadTable from "./-LeadTable"

export const Route = createFileRoute("/admin/lead-and-client/leads/")({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div>
      <LeadTable />
    </div>
  )
}
