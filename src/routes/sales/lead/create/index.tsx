import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"
import { CreateLeadForm } from "@/components/create-lead-form"

export const Route = createFileRoute("/sales/lead/create/")({
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = useNavigate()

  return (
    <div className="px-4 pb-8">
      <header className="py-4">
        <Button
          variant="link"
          onClick={() => navigate({ to: "/sales/lead-and-client/leads" })}
        >
          <ChevronLeft />
          <span>Back</span>
        </Button>
      </header>
      <main>
        <CreateLeadForm
          mode="self"
          successPath="/sales/lead-and-client/leads"
        />
      </main>
    </div>
  )
}
