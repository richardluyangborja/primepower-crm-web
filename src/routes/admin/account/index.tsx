import { createFileRoute } from "@tanstack/react-router"
import ProfileView from "@/components/profile-view"

export const Route = createFileRoute("/admin/account/")({
  component: RouteComponent,
})

function RouteComponent() {
  return <ProfileView />
}
