import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"
import { EditOpportunityForm } from "./-EditOpportunityForm"

export const Route = createFileRoute("/sales/opportunity/$opportunityId/edit/")(
  {
    component: RouteComponent,
  }
)

function RouteComponent() {
  const navigate = useNavigate()
  const { opportunityId } = Route.useParams()

  return (
    <div className="px-4 pb-8">
      <header className="py-4">
        <Button
          variant="link"
          onClick={() =>
            navigate({
              to: "/sales/opportunity/$opportunityId",
              params: { opportunityId },
            })
          }
        >
          <ChevronLeft />
          <span>Back</span>
        </Button>
      </header>
      <main>
        <EditOpportunityForm opportunityId={opportunityId} />
      </main>
    </div>
  )
}
