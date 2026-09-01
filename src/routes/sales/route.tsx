import { createFileRoute, Outlet } from "@tanstack/react-router"
import { SalesSidebar } from "@/components/sales-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

export const Route = createFileRoute("/sales")({
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
