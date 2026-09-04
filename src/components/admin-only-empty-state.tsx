import { Link } from "@tanstack/react-router"
import { Lock, MoveLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export function AdminOnlyEmptyState({
  title = "Admin-only area",
  description = "This page is reserved for administrators. Contact an administrator if you need access.",
  backTo = "/admin/dashboard",
  backLabel = "Back to dashboard",
}: {
  title?: string
  description?: string
  backTo?: string
  backLabel?: string
}) {
  return (
    <Card className="mx-auto max-w-xl">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
            <Lock className="size-5 text-muted-foreground" />
          </div>
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Button asChild variant="outline">
          <Link to={backTo as any}>
            <MoveLeft />
            <span>{backLabel}</span>
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
