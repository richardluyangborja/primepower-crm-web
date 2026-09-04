import { Button } from "@/components/ui/button"
import { useRouter } from "@tanstack/react-router"
import { createFileRoute } from "@tanstack/react-router"
import { ChevronLeft } from "lucide-react"
import { EditOpportunityForm } from "./-EditOpportunityForm"

export const Route = createFileRoute("/admin/opportunity/$opportunityId/edit/")({
  component: RouteComponent,
})

export function OpportunityEditPage({
  opportunityId,
  basePath = "/admin",
}: {
  opportunityId: number
  basePath?: string
}) {
  const router = useRouter()

  return (
    <div className="px-4 pb-8">
      <header className="py-4">
        <Button variant="link" onClick={() => router.history.back()}>
          <ChevronLeft />
          <span>Back</span>
        </Button>
      </header>
      <main>
        <EditOpportunityForm opportunityId={opportunityId} basePath={basePath} />
      </main>
    </div>
  )
}

function RouteComponent() {
  const { opportunityId } = Route.useParams()
  return <OpportunityEditPage opportunityId={Number(opportunityId)} />
}
