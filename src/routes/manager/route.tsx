import { createFileRoute, Outlet, redirect } from "@tanstack/react-router"
import { ManagerSidebar } from "@/components/manager-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import api from "@/lib/api"
import { getDefaultRouteForRole } from "@/lib/role-redirect"

export const Route = createFileRoute("/manager")({
  beforeLoad: async ({ location }) => {
    try {
      const response = await api.get("/api/user")
      const role = response.data?.role as string | undefined
      if (!role) {
        throw redirect({ to: "/login" })
      }
      if (role !== "manager") {
        throw redirect({ to: getDefaultRouteForRole(role) })
      }
      if (
        location.pathname === "/manager" ||
        location.pathname === "/manager/"
      ) {
        throw redirect({ to: "/manager/dashboard" })
      }
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
    <SidebarProvider>
      <ManagerSidebar />
      <SidebarInset>
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  )
}