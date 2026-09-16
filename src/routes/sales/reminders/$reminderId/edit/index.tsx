import { Button } from "@/components/ui/button"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { ChevronLeft } from "lucide-react"
import { EditReminderForm } from "./-EditReminderForm"

export const Route = createFileRoute("/sales/reminders/$reminderId/edit/")({
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = useNavigate()
  const { reminderId } = Route.useParams()

  return (
    <div className="px-4 pb-8">
      <header className="py-4">
        <Button
          variant="link"
          onClick={() =>
            navigate({
              to: "/sales/reminders/$reminderId",
              params: { reminderId },
            })
          }
        >
          <ChevronLeft />
          <span>Back</span>
        </Button>
      </header>
      <main>
        <EditReminderForm reminderId={reminderId} />
      </main>
    </div>
  )
}
