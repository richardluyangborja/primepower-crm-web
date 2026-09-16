import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"
import { CreateOpportunityForm } from "./-CreateOpportunityForm"

export const Route = createFileRoute("/admin/opportunity/create/")({
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = useNavigate()

  return (
    <div className="px-4 pb-8">
      <header className="py-4">
        <Button
          variant="link"
          onClick={() => navigate({ to: "/admin/opportunities" })}
        >
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
