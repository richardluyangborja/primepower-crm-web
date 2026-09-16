import { createFileRoute, redirect } from "@tanstack/react-router"
import api, { isAxiosError } from "@/lib/api"
import { getDefaultRouteForRole } from "@/lib/role-redirect"
import { Spinner } from "@/components/ui/spinner"

export const Route = createFileRoute("/")({
  beforeLoad: async () => {
    let role: string | undefined

    try {
      const response = await api.get("/api/user")
      role = response.data?.role
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 401) {
        throw redirect({ to: "/login" })
      }
      throw error
    }

    if (!role) {
      throw redirect({ to: "/login" })
    }

    throw redirect({ to: getDefaultRouteForRole(role) })
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
