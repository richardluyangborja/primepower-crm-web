import useAuthUser from "@/lib/queries/useAuthUser"

export function useIsAdmin(): boolean {
  const userQuery = useAuthUser()
  return userQuery.data?.role === "admin"
}
