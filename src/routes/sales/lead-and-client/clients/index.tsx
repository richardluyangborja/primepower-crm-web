import { createFileRoute } from "@tanstack/react-router"
import ClientTable from "./-ClientTable"

export const Route = createFileRoute("/sales/lead-and-client/clients/")({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div>
      <ClientTable />
    </div>
  )
}
