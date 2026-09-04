import { createFileRoute } from "@tanstack/react-router"
import EscalationRuleTable from "@/routes/admin/escalation/-EscalationRuleTable"

export const Route = createFileRoute("/manager/escalation/")({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="px-4 pb-8">
      <header className="py-4">
        <h1 className="font-heading text-lg">Escalation Rules</h1>
        <p className="mb-6 text-sm text-muted-foreground">
          View the escalation rules that drive automatic follow-up reminders and
          manager escalations.
        </p>
      </header>
      <main>
        <EscalationRuleTable />
      </main>
    </div>
  )
}
