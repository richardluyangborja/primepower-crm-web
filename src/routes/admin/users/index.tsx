import { createFileRoute } from "@tanstack/react-router"
import UserTable from "./-UserTable"
import { AdminOnlyEmptyState } from "@/components/admin-only-empty-state"
import { useIsAdmin } from "@/lib/queries/useIsAdmin"

export const Route = createFileRoute("/admin/users/")({
  component: RouteComponent,
})

function RouteComponent() {
  const isAdmin = useIsAdmin()

  if (!isAdmin) {
    return (
      <div className="px-4 pb-8">
        <header className="py-4">
          <h1 className="font-heading text-lg">User Management</h1>
        </header>
        <main>
          <AdminOnlyEmptyState
            title="Administrators only"
            description="User and team administration is restricted to administrators. Use the sidebar to navigate to your dashboard."
          />
        </main>
      </div>
    )
  }

  return (
    <div className="px-4 pb-8">
      <header className="py-4">
        <h1 className="font-heading text-lg">User Management</h1>
        <p className="mb-6 text-sm text-muted-foreground">
          Manage user accounts, roles, and access.
        </p>
      </header>
      <main>
        <UserTable />
      </main>
    </div>
  )
}
