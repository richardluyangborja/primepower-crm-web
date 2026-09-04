import { createFileRoute, Outlet, redirect } from "@tanstack/react-router"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import api from "@/lib/api"
import { getDefaultRouteForRole } from "@/lib/role-redirect"

export const Route = createFileRoute("/admin")({
  beforeLoad: async ({ location }) => {
    try {
      const response = await api.get("/api/user")
      const role = response.data?.role as string | undefined
      if (!role) {
        throw redirect({ to: "/login" })
      }
      if (role !== "admin" && role !== "manager") {
        throw redirect({ to: getDefaultRouteForRole(role) })
      }
      if (location.pathname === "/admin" || location.pathname === "/admin/") {
        throw redirect({ to: "/admin/dashboard" })
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
      <AppSidebar />
      <SidebarInset>
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  )
}
