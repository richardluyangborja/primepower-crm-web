import { LoginForm } from "@/components/login-form"
import { createFileRoute } from "@tanstack/react-router"
import { useIsLoggedInHook } from "./-useIsLoggedInHook"
import { Spinner } from "@/components/ui/spinner"
import ErrorPage from "@/components/error-page"

export const Route = createFileRoute("/login/")({
  component: RouteComponent,
})

function RouteComponent() {
  const query = useIsLoggedInHook()

  if (query.isPending)
    return (
      <div className="flex h-svh w-full items-center justify-center">
        <Spinner />
      </div>
    )

  if (query.data?.data)
    return (
      <ErrorPage
        status="409 Conflict"
        message="You are already authenticated."
      />
    )

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <h1 className="font-semibold">Primepower Manpower Services</h1>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
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
