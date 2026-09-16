import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"
import { EditOpportunityForm } from "./-EditOpportunityForm"

export const Route = createFileRoute("/admin/opportunity/$opportunityId/edit/")(
  {
    component: RouteComponent,
  }
)

export function OpportunityEditPage({
  opportunityId,
  basePath = "/admin",
}: {
  opportunityId: string
  basePath?: string
}) {
  const navigate = useNavigate()

  return (
    <div className="px-4 pb-8">
      <header className="py-4">
        <Button
          variant="link"
          onClick={() =>
            navigate({
              to: "/admin/opportunity/$opportunityId",
              params: { opportunityId },
            })
          }
        >
          <ChevronLeft />
          <span>Back</span>
        </Button>
      </header>
      <main>
        <EditOpportunityForm
          opportunityId={opportunityId}
          basePath={basePath}
        />
      </main>
    </div>
  )
}

function RouteComponent() {
  const { opportunityId } = Route.useParams()
  return <OpportunityEditPage opportunityId={opportunityId} />
}
