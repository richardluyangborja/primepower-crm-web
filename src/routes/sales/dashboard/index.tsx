import { createFileRoute } from "@tanstack/react-router"
import { DashboardContent } from "@/routes/admin/dashboard"

export const Route = createFileRoute("/sales/dashboard/")({
  component: RouteComponent,
})

function RouteComponent() {
  return <DashboardContent />
}
