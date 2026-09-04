import { createFileRoute } from "@tanstack/react-router"
import TeamTable from "./-TeamTable"
import { AdminOnlyEmptyState } from "@/components/admin-only-empty-state"
import { useIsAdmin } from "@/lib/queries/useIsAdmin"

export const Route = createFileRoute("/admin/teams/")({
  component: RouteComponent,
})

function RouteComponent() {
  const isAdmin = useIsAdmin()

  if (!isAdmin) {
    return (
      <div className="px-4 pb-8">
        <header className="py-4">
          <h1 className="font-heading text-lg">Team Management</h1>
        </header>
        <main>
          <AdminOnlyEmptyState
            title="Administrators only"
            description="Team management is restricted to administrators. Use the sidebar to navigate to your dashboard."
          />
        </main>
      </div>
    )
  }

  return (
    <div className="px-4 pb-8">
      <header className="py-4">
        <h1 className="font-heading text-lg">Team Management</h1>
        <p className="mb-6 text-sm text-muted-foreground">
          Create and manage teams, assign managers, and track membership.
        </p>
      </header>
      <main>
        <TeamTable />
      </main>
    </div>
  )
}
