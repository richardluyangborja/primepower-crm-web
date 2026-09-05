import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  ChevronDown,
  Ellipsis,
  MoveUpRight,
  Search,
  UserRound,
} from "lucide-react"
import { useNavigate } from "@tanstack/react-router"
import { useMemo, useState } from "react"
import useUsersQuery, { type UserRow } from "@/lib/queries/useUsers"
import { Spinner } from "@/components/ui/spinner"

const roleLabels: Record<UserRow["role"], string> = {
  admin: "Administrator",
  manager: "Manager",
  sales_rep: "Sales Representative",
}

const roleVariants: Record<UserRow["role"], "default" | "secondary" | "destructive"> = {
  admin: "default",
  manager: "secondary",
  sales_rep: "outline" as "secondary",
}

export default function UserTable() {
  const navigate = useNavigate()
  const [search, setSearch] = useState("")
  const [role, setRole] = useState<string>("all")
  const [isActive, setIsActive] = useState<string>("all")

  const params = useMemo(
    () => ({
      search: search || undefined,
      role: role === "all" ? undefined : role,
      is_active:
        isActive === "all" ? undefined : isActive === "active",
    }),
    [search, role, isActive],
  )

  const query = useUsersQuery(params)

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[12rem]">
            <Search className="text-muted-foreground absolute top-1/2 left-2 size-4 -translate-y-1/2" />
            <Input
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>
          <Select value={role} onValueChange={setRole}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All roles</SelectItem>
              <SelectItem value="admin">Administrator</SelectItem>
              <SelectItem value="manager">Manager</SelectItem>
              <SelectItem value="sales_rep">Sales Representative</SelectItem>
            </SelectContent>
          </Select>
          <Select value={isActive} onValueChange={setIsActive}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={() => {
              setSearch("")
              setRole("all")
              setIsActive("all")
            }}
          >
            <ChevronDown />
            Reset
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              const params = new URLSearchParams()
              if (search) params.set("search", search)
              if (role !== "all") params.set("role", role)
              if (isActive !== "all")
                params.set("is_active", isActive === "active" ? "1" : "0")
              window.location.href = `/api/users-export?${params.toString()}`
            }}
          >
            Export CSV
          </Button>
        </div>
        <div className="flex items-center justify-end">
          <Button asChild>
            <a href="/admin/users/create">
              <UserRound />
              New user
              <MoveUpRight />
            </a>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {query.isPending ? (
          <div className="flex h-40 items-center justify-center">
            <Spinner />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Manager</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {query.data?.map((user) => {
                const initials = user.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()
                return (
                  <TableRow
                    key={user.id}
                    onClick={() =>
                      navigate({
                        to: "/admin/users/$userId",
                        params: { userId: String(user.id) },
                      })
                    }
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar>
                          <AvatarFallback>{initials}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="font-medium">{user.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {user.email}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={roleVariants[user.role]}>
                        {roleLabels[user.role]}
                      </Badge>
                    </TableCell>
                    <TableCell>{user.manager?.name ?? "—"}</TableCell>
                    <TableCell>
                      <Badge
                        variant={user.is_active ? "default" : "destructive"}
                      >
                        {user.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Ellipsis />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation()
                              navigate({
                                to: "/admin/users/$userId",
                                params: { userId: String(user.id) },
                              })
                            }}
                          >
                            View details
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })}
              {query.data?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    No users found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
