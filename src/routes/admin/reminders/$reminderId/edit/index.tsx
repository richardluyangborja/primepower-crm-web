import { Button } from "@/components/ui/button"
import { createFileRoute, useRouter } from "@tanstack/react-router"
import { ChevronLeft } from "lucide-react"
import { EditReminderForm } from "./-EditReminderForm"

export const Route = createFileRoute("/admin/reminders/$reminderId/edit/")({
  component: RouteComponent,
})

function RouteComponent() {
  const router = useRouter()
  const { reminderId } = Route.useParams()

  return (
    <div className="px-4 pb-8">
      <header className="py-4">
        <Button variant="link" onClick={() => router.history.back()}>
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