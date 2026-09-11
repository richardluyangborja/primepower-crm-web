import { createFileRoute } from "@tanstack/react-router"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import OpportunityKpis from "@/routes/admin/opportunities/-OpportunityKpis"
import OpportunityPipeline from "@/routes/admin/opportunities/-OpportunityPipeline"

export const Route = createFileRoute("/manager/opportunities/")({
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
          <OpportunityPipeline basePath="/manager" />
        </CardContent>
      </Card>
    </div>
  )
}
