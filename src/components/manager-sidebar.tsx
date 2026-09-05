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
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar"
import {
  Bell,
  ChartSpline,
  ChevronRight,
  ClipboardCheck,
  LayoutGrid,
  LogOut,
  MessageCircleMore,
  Network,
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
import { NotificationsPanel } from "./notifications-panel"

type SidebarItem = {
  label: string
  icon: React.ComponentType<{ className?: string }>
  path?: string
  children?: { path: string; label: string }[]
  tooltip?: boolean
}

type SidebarGroup = {
  group: string
  items: SidebarItem[]
}

const sidebarConfig: SidebarGroup[] = [
  {
    group: "Overview",
    items: [
      {
        path: "/manager/dashboard",
        label: "Dashboard and Analytics",
        icon: LayoutGrid,
      },
    ],
  },
  {
    group: "Sales Pipeline",
    items: [
      {
        label: "Lead and Client Tracking",
        icon: Network,
        children: [
          {
            path: "/manager/lead-and-client/leads",
            label: "Leads",
          },
          {
            path: "/manager/lead-and-client/clients",
            label: "Clients",
          },
        ],
      },
      {
        path: "/manager/opportunities",
        label: "Opportunity Pipeline Visualization",
        icon: ChartSpline,
        tooltip: true,
      },
    ],
  },
  {
    group: "Engagement",
    items: [
      {
        path: "/manager/communications",
        label: "Communications History",
        icon: MessageCircleMore,
      },
    ],
  },
  {
    group: "Feedback",
    items: [
      {
        path: "/manager/satisfaction",
        label: "Client Satisfaction and Surveys",
        icon: ClipboardCheck,
      },
    ],
  },
  {
    group: "Follow-ups",
    items: [
      {
        path: "/manager/reminders",
        label: "Follow-up Reminders",
        icon: Bell,
      },
    ],
  },
  {
    group: "Account",
    items: [
      {
        path: "/manager/account",
        label: "Account",
        icon: UserRound,
      },
    ],
  },
]

function CollapsibleMenuItem({
  item,
  navigate,
}: {
  item: { label: string; icon: React.ComponentType<{ className?: string }>; children: { path: string; label: string }[] }
  navigate: (opts: { to: string }) => void
}) {
  const [isExpanded, setIsExpanded] = React.useState(true)

  return (
    <>
      <SidebarMenuButton onClick={() => setIsExpanded(!isExpanded)}>
        <item.icon />
        <span>{item.label}</span>
        <ChevronRight className={`ml-auto transition-transform ${isExpanded ? "rotate-90" : ""}`} />
      </SidebarMenuButton>
      {isExpanded && (
        <SidebarMenuSub>
          {item.children.map((child) => (
            <SidebarMenuSubItem key={child.path}>
              <SidebarMenuSubButton onClick={() => navigate({ to: child.path })}>
                <span>{child.label}</span>
              </SidebarMenuSubButton>
            </SidebarMenuSubItem>
          ))}
        </SidebarMenuSub>
      )}
    </>
  )
}

export function ManagerSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const navigate = useNavigate()
  const userQuery = useAuthUser()
  const unreadCountQuery = useUnreadCountQuery()
  const unreadCount = unreadCountQuery.data ?? 0

  return (
    <Sidebar className="py-0" variant="inset" {...props}>
      <SidebarHeader className="pt-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to="/manager/dashboard">
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
        {sidebarConfig.map((group) => (
          <SidebarGroup key={group.group}>
            <SidebarGroupLabel>{group.group}</SidebarGroupLabel>
            <SidebarMenu>
              {group.items.map((item) => (
                  <SidebarMenuItem key={item.path ?? item.label}>
                    {item.children ? (
                      <CollapsibleMenuItem item={item as { label: string; icon: React.ComponentType<{ className?: string }>; children: { path: string; label: string }[] }} navigate={navigate} />
                    ) : item.tooltip ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <SidebarMenuButton
                          onClick={() => navigate({ to: item.path })}
                        >
                          <item.icon />
                          <span>{item.label}</span>
                        </SidebarMenuButton>
                      </TooltipTrigger>
                      <TooltipContent side="right">{item.label}</TooltipContent>
                    </Tooltip>
                  ) : (
                    <SidebarMenuButton onClick={() => navigate({ to: item.path })}>
                      <item.icon />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter className="pb-4">
        <div className="flex items-center gap-4">
          <AccountDropdown />
          <div className="flex flex-col text-xs">
            <div>{userQuery.data?.name ?? "Loading..."}</div>
            <div className="text-muted-foreground">
              {userQuery.data?.role === "manager" ? "Manager" : "User"}
            </div>
          </div>
          <NotificationsPanel
            basePath="/manager"
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
                    className="absolute -top-1 -right-1 h-5 min-w-5 justify-center rounded-full px-1.5 text-[10px]"
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

function AccountDropdown() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const userQuery = useAuthUser()

  const user = userQuery.data
  const initials =
    user?.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2) ?? "?"

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
            <DropdownMenuItem
              onClick={() => navigate({ to: "/manager/account" })}
            >
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
