import { createFileRoute } from "@tanstack/react-router"
import CommunicationsTable from "./-CommunicationsTable"

export const Route = createFileRoute("/admin/communications/")({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="px-4 pb-8">
      <header className="py-4">
        <h1 className="font-heading text-lg">Communications History</h1>
        <p className="mb-6 text-sm text-muted-foreground">
          All logged communications across leads and clients.
        </p>
      </header>
      <main>
        <CommunicationsTable />
      </main>
    </div>
  )
}
