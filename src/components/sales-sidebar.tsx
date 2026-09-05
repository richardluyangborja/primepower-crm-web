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

const sidebarConfig = [
  {
    group: "Overview",
    items: [
      {
        path: "/sales/dashboard",
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
            path: "/sales/lead-and-client/leads",
            label: "Leads",
          },
          {
            path: "/sales/lead-and-client/clients",
            label: "Clients",
          },
        ],
      },
      {
        path: "/sales/opportunities",
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
        path: "/sales/communications",
        label: "Communications History",
        icon: MessageCircleMore,
      },
    ],
  },
  {
    group: "Feedback",
    items: [
      {
        path: "/sales/satisfaction",
        label: "Client Satisfaction and Surveys",
        icon: ClipboardCheck,
      },
    ],
  },
  {
    group: "Follow-ups",
    items: [
      {
        path: "/sales/reminders",
        label: "Follow-up Reminders",
        icon: Bell,
      },
    ],
  },
  {
    group: "Account",
    items: [
      {
        path: "/sales/account",
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

export function SalesSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const navigate = useNavigate()
  const userQuery = useAuthUser()
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
              <Link to="/sales/lead-and-client/leads">
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
                    <CollapsibleMenuItem item={item} navigate={navigate} />
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
            <div className="text-muted-foreground">{roleLabel}</div>
          </div>
          <NotificationsPanel
            basePath="/sales"
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
              onClick={() => navigate({ to: "/sales/account" })}
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
