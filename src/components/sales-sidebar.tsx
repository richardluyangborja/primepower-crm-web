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
  LayoutGrid,
  LogOut,
  MessageCircleMore,
  Network,
  UserRound,
} from "lucide-react"
import { Tooltip, TooltipTrigger, TooltipContent } from "./ui/tooltip"
import { Link, useNavigate } from "@tanstack/react-router"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
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
    group: "CRM",
    items: [
      {
        path: "/sales/lead-and-client/leads",
        label: "Lead and Client Tracking",
        icon: Network,
      },
      {
        path: "/sales/opportunities",
        label: "Opportunity Pipeline Visualization",
        icon: ChartSpline,
        tooltip: true,
      },
      {
        path: "/sales/communications",
        label: "Communications History",
        icon: MessageCircleMore,
      },
      {
        path: "/sales/satisfaction",
        label: "Client Satisfaction and Surveys",
        icon: ClipboardCheck,
      },
      {
        path: "/sales/reminders",
        label: "Follow-up Reminders",
        icon: Bell,
      },
    ],
  },
]

export function SalesSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const navigate = useNavigate()
  const userQuery = useAuthUser()

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
              {group.items.map((item) =>
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
        ))}
      </SidebarContent>
      <SidebarFooter className="pb-4">
        <div className="flex items-center gap-4">
          <AccountDropdown />
          <div className="flex flex-col text-xs">
            <div>{userQuery.data?.name ?? "Loading..."}</div>
            <div className="text-muted-foreground">
              {userQuery.data?.role === "admin"
                ? "Administrator"
                : "Sales Representative"}
            </div>
          </div>
          <Button variant="outline" size="icon-lg" className="ml-auto">
            <Bell />
          </Button>
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
  const initials = user?.name
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
