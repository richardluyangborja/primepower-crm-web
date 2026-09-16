import * as React from "react"
import { LoginForm } from "@/components/login-form"
import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router"
import useAuthUser from "@/lib/queries/useAuthUser"
import { getDefaultRouteForRole } from "@/lib/role-redirect"
import { Spinner } from "@/components/ui/spinner"

export const Route = createFileRoute("/login/")({
  validateSearch: (search: Record<string, unknown>) => ({
    expired: search.expired === "1" ? "1" : undefined,
  }),
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = useNavigate()
  const { expired } = useSearch({ from: "/login/" })
  const query = useAuthUser()

  React.useEffect(() => {
    if (query.data) {
      navigate({
        to: getDefaultRouteForRole(query.data.role),
        replace: true,
      })
    }
  }, [query.data, navigate])

  if (query.isPending)
    return (
      <div className="flex h-svh w-full items-center justify-center">
        <Spinner />
      </div>
    )

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <h1 className="font-semibold">Primepower Manpower Services</h1>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            {expired === "1" && (
              <div className="mb-4 rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-700 dark:text-amber-400">
                Your session expired due to inactivity. Please log in again.
              </div>
            )}
            <LoginForm />
          </div>
        </div>
      </div>
      <div className="relative hidden bg-muted lg:block">
        <img
          src="/pms-logo.png"
          alt="Image"
          className="absolute inset-0 h-full w-full object-contain object-center dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  )
}
