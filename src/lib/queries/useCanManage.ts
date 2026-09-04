import useAuthUser from "@/lib/queries/useAuthUser"

export function useCanManage() {
  const userQuery = useAuthUser()
  const role = userQuery.data?.role

  return role === "admin" || role === "manager"
}
