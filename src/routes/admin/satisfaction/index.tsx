import { createFileRoute } from "@tanstack/react-router"
import ClientSatisfactionList from "./-ClientSatisfactionList"

export const Route = createFileRoute("/admin/satisfaction/")({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="px-4 pb-8">
      <header className="py-4">
        <h1 className="font-heading text-lg">Client Satisfaction & Surveys</h1>
        <p className="mb-6 text-sm text-muted-foreground">
          Monitor client satisfaction scores and manage survey distribution.
        </p>
      </header>
      <main>
        <ClientSatisfactionList />
      </main>
    </div>
  )
}
