import { createFileRoute, Outlet, redirect } from "@tanstack/react-router"
import { SalesSidebar } from "@/components/sales-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import api from "@/lib/api"
import { getDefaultRouteForRole } from "@/lib/role-redirect"

export const Route = createFileRoute("/sales")({
  beforeLoad: async ({ location }) => {
    try {
      const response = await api.get("/api/user")
      const role = response.data?.role as string | undefined
      if (!role) {
        throw redirect({ to: "/login" })
      }
      if (role !== "sales_rep") {
        throw redirect({ to: getDefaultRouteForRole(role) })
      }
      if (location.pathname === "/sales" || location.pathname === "/sales/") {
        throw redirect({ to: getDefaultRouteForRole(role) })
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
      <SalesSidebar />
      <SidebarInset>
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  )
}
