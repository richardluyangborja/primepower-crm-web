import { createFileRoute } from "@tanstack/react-router"
import ClientTable from "@/routes/admin/lead-and-client/clients/-ClientTable"

export const Route = createFileRoute("/manager/lead-and-client/clients/")({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div>
      <ClientTable basePath="/manager" />
    </div>
  )
}