import { Button } from "@/components/ui/button"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { ChevronLeft } from "lucide-react"
import { CreateReminderForm } from "./-CreateReminderForm"

export const Route = createFileRoute("/admin/reminders/create/")({
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = useNavigate()

  return (
    <div className="px-4 pb-8">
      <header className="py-4">
        <Button
          variant="link"
          onClick={() => navigate({ to: "/admin/reminders" })}
        >
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
