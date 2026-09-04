import useAuthUser from "@/lib/queries/useAuthUser"

export type AppRole = "admin" | "manager" | "sales_rep"

export function getDefaultRouteForRole(role: string | undefined | null): string {
  switch (role) {
    case "admin":
      return "/admin/dashboard"
    case "manager":
      return "/admin/dashboard"
    case "sales_rep":
      return "/sales/lead-and-client/leads"
    default:
      return "/login"
  }
}

export function isAllowedForRole(role: string | null | undefined, pathname: string): boolean {
  if (!role) return false

  if (pathname.startsWith("/admin")) {
    return role === "admin" || role === "manager"
  }

  if (pathname.startsWith("/sales")) {
    return role === "sales_rep"
  }

  return true
}

export function useRoleRedirect() {
  return useAuthUser()
}
