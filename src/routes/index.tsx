import { createFileRoute, redirect } from "@tanstack/react-router"
import api from "@/lib/api"
import { getDefaultRouteForRole } from "@/lib/role-redirect"
import { Spinner } from "@/components/ui/spinner"

export const Route = createFileRoute("/")({
  beforeLoad: async () => {
    try {
      const response = await api.get("/api/user")
      const role = response.data?.role as string | undefined
      if (!role) {
        throw redirect({ to: "/login" })
      }
      throw redirect({ to: getDefaultRouteForRole(role) })
    } catch (error) {
      if ((error as { status?: number })?.status === 401) {
        throw redirect({ to: "/login" })
      }
      throw error
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="flex h-svh w-full items-center justify-center">
      <Spinner className="size-10" />
    </div>
  )
}
