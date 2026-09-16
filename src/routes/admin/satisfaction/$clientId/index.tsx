import { Button } from "@/components/ui/button"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { ChevronLeft } from "lucide-react"
import ClientSatisfactionDetail from "./-ClientSatisfactionDetail"

export const Route = createFileRoute("/admin/satisfaction/$clientId/")({
  component: RouteComponent,
})

export function SatisfactionDetailPage({
  clientId,
  basePath = "/admin",
  isAdmin = false,
}: {
  clientId: string
  basePath?: string
  isAdmin?: boolean
}) {
  const navigate = useNavigate()

  return (
    <div className="px-4 pb-8">
      <header className="py-4">
        <Button
          variant="link"
          onClick={() => navigate({ to: "/admin/satisfaction" })}
        >
          <ChevronLeft />
          <span>Back</span>
        </Button>
      </header>
      <main>
        <ClientSatisfactionDetail
          clientId={clientId}
          basePath={basePath}
          isAdmin={isAdmin}
        />
      </main>
    </div>
  )
}

function RouteComponent() {
  const { clientId } = Route.useParams()
  return <SatisfactionDetailPage clientId={clientId} isAdmin />
}
