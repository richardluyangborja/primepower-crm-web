import { Button } from "@/components/ui/button"
import { createFileRoute, useRouter } from "@tanstack/react-router"
import { ChevronLeft } from "lucide-react"
import ClientSatisfactionDetail from "./-ClientSatisfactionDetail"

export const Route = createFileRoute("/admin/satisfaction/$clientId/")({
  component: RouteComponent,
})

export function SatisfactionDetailPage({ clientId }: { clientId: number }) {
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
        <ClientSatisfactionDetail clientId={clientId} />
      </main>
    </div>
  )
}

function RouteComponent() {
  const { clientId } = Route.useParams()
  return <SatisfactionDetailPage clientId={Number(clientId)} />
}