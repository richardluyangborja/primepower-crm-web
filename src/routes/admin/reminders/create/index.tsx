import { Button } from "@/components/ui/button"
import { createFileRoute, useRouter } from "@tanstack/react-router"
import { ChevronLeft } from "lucide-react"
import { CreateReminderForm } from "./-CreateReminderForm"

export const Route = createFileRoute("/admin/reminders/create/")({
  component: RouteComponent,
})

function RouteComponent() {
  const router = useRouter()

  return (
    <div className="px-4 pb-8">
      <header className="py-4">
        <Button variant="link" onClick={() => router.history.back()}>
          <ChevronLeft />
          <span>Back</span>
        </Button>
      </header>
      <main>
        <CreateReminderForm />
      </main>
    </div>
  )
}
