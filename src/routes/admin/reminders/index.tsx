import { createFileRoute } from "@tanstack/react-router"
import RemindersTable from "./-RemindersTable"

export const Route = createFileRoute("/admin/reminders/")({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="px-4 pb-8">
      <header className="py-4">
        <h1 className="font-heading text-lg">Follow-up Reminders</h1>
        <p className="mb-6 text-sm text-muted-foreground">
          Actions and follow-ups tied to leads, clients, and opportunities.
        </p>
      </header>
      <main>
        <RemindersTable />
      </main>
    </div>
  )
}
