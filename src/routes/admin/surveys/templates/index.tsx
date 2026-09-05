import { createFileRoute } from "@tanstack/react-router"
import SurveyTemplateTable from "./-SurveyTemplateTable"
import { AdminOnlyEmptyState } from "@/components/admin-only-empty-state"
import { useIsAdmin } from "@/lib/queries/useIsAdmin"

export const Route = createFileRoute("/admin/surveys/templates/")({
  component: RouteComponent,
})

function RouteComponent() {
  const isAdmin = useIsAdmin()

  if (!isAdmin) {
    return (
      <div className="px-4 pb-8">
        <header className="py-4">
          <h1 className="font-heading text-lg">Survey Templates</h1>
        </header>
        <main>
          <AdminOnlyEmptyState
            title="Administrators only"
            description="Managing survey templates is restricted to administrators. Use the sidebar to navigate to your dashboard."
          />
        </main>
      </div>
    )
  }

  return (
    <div className="px-4 pb-8">
      <header className="py-4">
        <h1 className="font-heading text-lg">Survey Templates</h1>
        <p className="mb-6 text-sm text-muted-foreground">
          Manage survey templates and their versions. Templates define the questions
          sent in satisfaction surveys. Editing questions creates a new version.
        </p>
      </header>
      <main>
        <SurveyTemplateTable />
      </main>
    </div>
  )
}