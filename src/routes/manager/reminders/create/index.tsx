import { Button } from "@/components/ui/button"
import { createFileRoute, useRouter } from "@tanstack/react-router"
import { ChevronLeft } from "lucide-react"
import { CreateReminderForm } from "@/routes/admin/reminders/create/-CreateReminderForm"

export const Route = createFileRoute("/manager/reminders/create/")({
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
        <CreateReminderForm basePath="/manager" />
      </main>
    </div>
  )
}