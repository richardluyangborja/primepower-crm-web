import { createFileRoute } from "@tanstack/react-router"
import EscalationRuleTable from "./-EscalationRuleTable"
import { AdminOnlyEmptyState } from "@/components/admin-only-empty-state"
import { useIsAdmin } from "@/lib/queries/useIsAdmin"

export const Route = createFileRoute("/admin/escalation/")({
  component: RouteComponent,
})

function RouteComponent() {
  const isAdmin = useIsAdmin()

  if (!isAdmin) {
    return (
      <div className="px-4 pb-8">
        <header className="py-4">
          <h1 className="font-heading text-lg">Escalation Rules</h1>
        </header>
        <main>
          <AdminOnlyEmptyState
            title="Administrators only"
            description="Managing escalation rules is restricted to administrators. Use the sidebar to navigate to your dashboard."
          />
        </main>
      </div>
    )
  }

  return (
    <div className="px-4 pb-8">
      <header className="py-4">
        <h1 className="font-heading text-lg">Escalation Rules</h1>
        <p className="mb-6 text-sm text-muted-foreground">
          Define automatic follow-up reminders and manager escalations for
          inactive leads, clients, stale opportunities, and overdue reminders.
        </p>
      </header>
      <main>
        <EscalationRuleTable />
      </main>
    </div>
  )
}
