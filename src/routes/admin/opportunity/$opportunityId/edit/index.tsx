import { Button } from "@/components/ui/button"
import { useRouter } from "@tanstack/react-router"
import { createFileRoute } from "@tanstack/react-router"
import { ChevronLeft } from "lucide-react"
import { EditOpportunityForm } from "./-EditOpportunityForm"

export const Route = createFileRoute("/admin/opportunity/$opportunityId/edit/")({
  component: RouteComponent,
})

function RouteComponent() {
  const router = useRouter()
  const { opportunityId } = Route.useParams()

  return (
    <div className="px-4 pb-8">
      <header className="py-4">
        <Button variant="link" onClick={() => router.history.back()}>
          <ChevronLeft />
          <span>Back</span>
        </Button>
      </header>
      <main>
        <EditOpportunityForm opportunityId={Number(opportunityId)} />
      </main>
    </div>
  )
}
