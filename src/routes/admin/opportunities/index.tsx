import { createFileRoute } from "@tanstack/react-router"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import OpportunityKpis from "./-OpportunityKpis"
import OpportunityPipeline from "./-OpportunityPipeline"

export const Route = createFileRoute("/admin/opportunities/")({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="w-full space-y-4 px-4 py-4">
      <OpportunityKpis />
      <Card>
        <CardHeader>
          <CardTitle>
            <h1 className="font-heading text-lg">Opportunity Pipeline</h1>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <OpportunityPipeline />
        </CardContent>
      </Card>
    </div>
  )
}
