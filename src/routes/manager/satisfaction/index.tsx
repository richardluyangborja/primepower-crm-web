import { createFileRoute } from "@tanstack/react-router"
import SatisfactionKpis from "@/routes/admin/analytics/-SatisfactionKpis"
import ClientSatisfactionList from "@/routes/admin/satisfaction/-ClientSatisfactionList"

export const Route = createFileRoute("/manager/satisfaction/")({
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
      <main className="space-y-4">
        <SatisfactionKpis />
        <ClientSatisfactionList basePath="/manager" />
      </main>
    </div>
  )
}
