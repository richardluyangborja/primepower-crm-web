import * as React from "react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import {
  Bell,
  ChartSpline,
  ClipboardCheck,
  Info,
  LayoutGrid,
  LogOut,
  MessageCircleMore,
  Network,
  SlidersHorizontal,
  UserRound,
} from "lucide-react"
import { Tooltip, TooltipTrigger, TooltipContent } from "./ui/tooltip"
import { Link, useNavigate } from "@tanstack/react-router"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/api"
import useAuthUser from "@/lib/queries/useAuthUser"
import { useUnreadCountQuery } from "@/lib/queries/useNotifications"

const sidebarConfig = [
  {
    group: "Overview",
    items: [
      {
        path: "/admin/dashboard",
        label: "Dashboard and Analytics",
        icon: LayoutGrid,
      },
    ],
  },
  {
    group: "CRM",
    items: [
      {
        path: "/admin/lead-and-client/leads",
        label: "Lead and Client Tracking",
        icon: Network,
      },
      {
        path: "/admin/opportunities",
        label: "Opportunity Pipeline Visualization",
        icon: ChartSpline,
        tooltip: true,
      },
      {
        path: "/admin/communications",
        label: "Communications History",
        icon: MessageCircleMore,
      },
      {
        path: "/admin/satisfaction",
        label: "Client Satisfaction and Surveys",
        icon: ClipboardCheck,
      },
      {
        path: "/admin/reminders",
        label: "Follow-up Reminders",
        icon: Bell,
      },
    ],
  },
  {
    group: "Administration",
    items: [
      {
        path: "/admin/users",
        label: "User Management",
        icon: SlidersHorizontal,
      },
      {
        path: "/admin/audit-log",
        label: "Audit Logs",
        icon: Info,
      },
      {
        path: "/admin/account",
        label: "Account",
        icon: UserRound,
      },
    ],
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const navigate = useNavigate()
  const userQuery = useAuthUser()
  const isAdmin = userQuery.data?.role === "admin"
  const unreadCountQuery = useUnreadCountQuery()
  const unreadCount = unreadCountQuery.data ?? 0

  const roleLabel =
    userQuery.data?.role === "admin"
      ? "Administrator"
      : userQuery.data?.role === "manager"
        ? "Manager"
        : "Sales Representative"

  return (
    <Sidebar className="py-0" variant="inset" {...props}>
      <SidebarHeader className="pt-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to="/admin/dashboard">
                <img
                  src="/pms-logo.png"
                  alt="pms-logo"
                  className="h-auto w-18"
                />
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">Primepower</span>
                  <span className="truncate text-xs">CRM Department</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {sidebarConfig.map((group) => {
          const items = group.items.filter((item) => {
            if (item.path === "/admin/users" && !isAdmin) {
              return false
            }
            return true
          })

          if (items.length === 0) {
            return null
          }

          return (
            <SidebarGroup key={group.group}>
              <SidebarGroupLabel>{group.group}</SidebarGroupLabel>
              <SidebarMenu>
                {items.map((item) =>
                  item.tooltip ? (
                    <Tooltip key={item.path}>
                      <TooltipTrigger asChild>
                        <SidebarMenuItem>
                          <SidebarMenuButton
                            onClick={() => navigate({ to: item.path })}
                          >
                            <item.icon />
                            <span>{item.label}</span>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      </TooltipTrigger>
                      <TooltipContent side="right">{item.label}</TooltipContent>
                    </Tooltip>
                  ) : (
                    <SidebarMenuItem key={item.path}>
                      <SidebarMenuButton
                        onClick={() => navigate({ to: item.path })}
                      >
                        <item.icon />
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                )}
              </SidebarMenu>
            </SidebarGroup>
          )
        })}
      </SidebarContent>
      <SidebarFooter className="pb-4">
        <div className="flex items-center gap-4">
          <AccountDropdown />
          <div className="flex flex-col text-xs">
            <div>{userQuery.data?.name ?? "Loading..."}</div>
            <div className="text-muted-foreground">{roleLabel}</div>
          </div>
          <NotificationsPanel
            trigger={
              <Button
                variant="outline"
                size="icon-lg"
                className="relative ml-auto"
                aria-label="Notifications"
              >
                <Bell />
                {unreadCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -right-1 -top-1 h-5 min-w-5 justify-center rounded-full px-1.5 text-[10px]"
                  >
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </Badge>
                )}
              </Button>
            }
          />
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}

import { Spinner } from "@/components/ui/spinner"
import { NotificationsPanel } from "./notifications-panel"

function AccountDropdown() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const userQuery = useAuthUser()

  const user = userQuery.data
  const initials = user?.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  const mutation = useMutation({
    mutationFn: async () => {
      return api.post("/api/logout")
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth_user"] })
      return navigate({ to: "/login" })
    },
  })
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="rounded-full">
            <Avatar>
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuGroup>
            <DropdownMenuItem>
              <UserRound />
              Account
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Bell />
              Notifications
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onClick={async () => await mutation.mutateAsync()}
          >
            <LogOut />
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {mutation.isPending && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/70">
          <Spinner className="size-10" />
        </div>
      )}
    </>
  )
}
