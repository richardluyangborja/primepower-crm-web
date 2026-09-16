import { Button } from "@/components/ui/button"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { ChevronLeft } from "lucide-react"
import ClientSatisfactionDetail from "./-ClientSatisfactionDetail"

export const Route = createFileRoute("/sales/satisfaction/$clientId/")({
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = useNavigate()
  const { clientId } = Route.useParams()

  return (
    <div className="px-4 pb-8">
      <header className="py-4">
        <Button
          variant="link"
          onClick={() => navigate({ to: "/sales/satisfaction" })}
        >
          <ChevronLeft />
          <span>Back</span>
        </Button>
      </header>
      <main>
        <ClientSatisfactionDetail clientId={clientId} />
      </main>
    </div>
  )
}
