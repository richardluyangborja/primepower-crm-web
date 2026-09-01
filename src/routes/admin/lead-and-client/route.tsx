import {
  createFileRoute,
  Link,
  Outlet,
  useLocation,
} from "@tanstack/react-router"
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"

export const Route = createFileRoute("/admin/lead-and-client")({
  component: RouteComponent,
})

const navigations = [
  {
    label: "Leads",
    path: "/admin/lead-and-client/leads",
  },
  {
    label: "Clients",
    path: "/admin/lead-and-client/clients",
  },
]

function RouteComponent() {
  const path = useLocation({
    select: (location) => location.pathname,
  })

  return (
    <div className="w-full px-4">
      <header className="py-4">
        <h1 className="font-heading text-lg">Lead and Client Tracking</h1>
        <p className="mb-6 text-sm text-muted-foreground">
          View potential and existing client companies and their relationships.
        </p>
        <NavigationMenu>
          <NavigationMenuList>
            {navigations.map((nav, i) => (
              <NavigationMenuItem key={i}>
                <NavigationMenuLink
                  asChild
                  className={navigationMenuTriggerStyle()}
                >
                  <Link
                    to={nav.path}
                    className={path !== nav.path ? "text-muted-foreground" : ""}
                  >
                    {nav.label}
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  )
}
