import { createFileRoute } from "@tanstack/react-router"
import { ReminderDetailContent } from "@/routes/admin/reminders/$reminderId"

export const Route = createFileRoute("/manager/reminders/$reminderId/")({
  component: RouteComponent,
})

function RouteComponent() {
  const { reminderId } = Route.useParams()
  return <ReminderDetailContent reminderId={reminderId} basePath="/manager" />
}