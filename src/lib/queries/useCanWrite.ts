import useAuthUser from "@/lib/queries/useAuthUser"

export function useCanWrite() {
  const userQuery = useAuthUser()
  const role = userQuery.data?.role

  return role === "admin" || role === "sales_rep"
}