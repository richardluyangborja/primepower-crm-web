import { Button } from "@/components/ui/button"
import { useRouter } from "@tanstack/react-router"
import { createFileRoute } from "@tanstack/react-router"
import { ChevronLeft } from "lucide-react"
import { CreateLeadForm } from "./-CreateLeadForm"

export const Route = createFileRoute("/admin/lead/create/")({
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
        <CreateLeadForm />
      </main>
    </div>
  )
}
