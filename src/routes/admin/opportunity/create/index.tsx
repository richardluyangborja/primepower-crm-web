import { Button } from "@/components/ui/button"
import { useRouter } from "@tanstack/react-router"
import { createFileRoute } from "@tanstack/react-router"
import { ChevronLeft } from "lucide-react"
import { CreateOpportunityForm } from "./-CreateOpportunityForm"

export const Route = createFileRoute("/admin/opportunity/create/")({
  component: RouteComponent,
})

function RouteComponent() {
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
        <CreateOpportunityForm />
      </main>
    </div>
  )
}
