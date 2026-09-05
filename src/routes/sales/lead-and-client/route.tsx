import { createFileRoute, Outlet } from "@tanstack/react-router"

export const Route = createFileRoute("/sales/lead-and-client")({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="w-full px-4">
      <header className="py-4">
        <h1 className="font-heading text-lg">Lead and Client Tracking</h1>
        <p className="mb-6 text-sm text-muted-foreground">
          View potential and existing client companies and their relationships.
        </p>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  )
}
