import { createFileRoute } from "@tanstack/react-router"
import AuditLogTable from "./-AuditLogTable"

export const Route = createFileRoute("/admin/audit-log/")({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="px-4 pb-8">
      <header className="py-4">
        <h1 className="font-heading text-lg">Audit Logs</h1>
        <p className="mb-6 text-sm text-muted-foreground">
          A chronological record of every operation across leads, clients,
          opportunities, communications, follow-up reminders, and satisfaction
          surveys. Entries store plain text (no relationships), so the history is
          preserved even if the related records are later changed or deleted.
        </p>
      </header>
      <main>
        <AuditLogTable />
      </main>
    </div>
  )
}
