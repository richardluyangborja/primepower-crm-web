import { Card, CardContent } from "@/components/ui/card"
import type { LucideIcon } from "lucide-react"

export type Kpi = {
  label: string
  value: string | number
  hint?: string
  icon: LucideIcon
}

export function KpiCards({ kpis }: { kpis: Kpi[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
      {kpis.map((card) => (
        <Card key={card.label}>
          <CardContent className="flex items-start gap-3 p-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <card.icon className="size-5 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm text-muted-foreground">
                {card.label}
              </p>
              <p className="truncate text-xl font-semibold">{card.value}</p>
              {card.hint && (
                <p className="truncate text-xs text-muted-foreground">
                  {card.hint}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
