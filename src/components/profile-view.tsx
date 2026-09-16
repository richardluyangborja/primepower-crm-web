import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  Briefcase,
  CalendarClock,
  Clock,
  IdCard,
  LogOut,
  ShieldCheck,
  UserRound,
} from "lucide-react"
import { Spinner } from "@/components/ui/spinner"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useState } from "react"
import { useNavigate } from "@tanstack/react-router"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/api"
import useAuthUser from "@/lib/queries/useAuthUser"

const ROLE_DETAILS: Record<
  string,
  { label: string; description: string; access: string[] }
> = {
  admin: {
    label: "Administrator",
    description:
      "Full access to every module, user management, and the system audit log.",
    access: [
      "Lead & Client Tracking",
      "Opportunity Pipeline",
      "Communications",
      "Satisfaction Surveys",
      "Follow-up Reminders",
      "User Management",
      "Audit Logs",
    ],
  },
  manager: {
    label: "Manager",
    description:
      "Oversees CRM operations and reviews activity through the audit log.",
    access: [
      "Lead & Client Tracking",
      "Opportunity Pipeline",
      "Communications",
      "Satisfaction Surveys",
      "Follow-up Reminders",
      "Audit Logs",
    ],
  },
  sales_rep: {
    label: "Sales Representative",
    description:
      "Manages assigned leads, clients, opportunities, and follow-ups.",
    access: [
      "Lead & Client Tracking",
      "Opportunity Pipeline",
      "Communications",
      "Satisfaction Surveys",
      "Follow-up Reminders",
    ],
  },
}

function getInitials(name: string): string {
  return (
    name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ?? "?"
  )
}

function formatDate(value?: string | null): string {
  if (!value) {
    return "—"
  }
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

function formatDateTime(value?: string | null): string {
  if (!value) {
    return "—"
  }
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }
  return date.toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  })
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-right text-sm font-medium">{value}</span>
    </div>
  )
}

export default function ProfileView() {
  const userQuery = useAuthUser()
  const user = userQuery.data
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const logoutMutation = useMutation({
    mutationFn: async () => {
      return api.post("/api/logout")
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth_user"] })
      return navigate({ to: "/login" })
    },
  })

  if (userQuery.isPending || !user) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    )
  }

  const role = ROLE_DETAILS[user.role] ?? ROLE_DETAILS.sales_rep
  const initials = getInitials(user.name)

  return (
    <div className="px-4 pb-8">
      <header className="flex flex-wrap items-start justify-between gap-4 py-4">
        <div>
          <h1 className="font-heading text-lg">My Profile</h1>
          <p className="mb-6 text-sm text-muted-foreground">
            Review your account details and how your profile appears across the
            CRM.
          </p>
        </div>
        <Button variant="destructive" onClick={() => setConfirmOpen(true)}>
          <LogOut className="size-4" />
          Sign out
        </Button>
        <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Sign out?</DialogTitle>
              <DialogDescription>
                You will be signed out of your account and redirected to the
                login page.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button
                variant="destructive"
                onClick={async () => await logoutMutation.mutateAsync()}
                disabled={logoutMutation.isPending}
              >
                {logoutMutation.isPending ? (
                  <Spinner className="size-4" />
                ) : (
                  <LogOut className="size-4" />
                )}
                Sign out
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardContent className="flex flex-col items-center gap-4 pt-6 text-center">
            <Avatar size="lg">
              <AvatarFallback className="bg-primary text-2xl text-primary-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <p className="text-lg font-semibold">{user.name}</p>
              <Badge variant="secondary">{role.label}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            <Separator className="w-full" />
            <div className="flex w-full flex-col gap-2 text-left">
              <div className="flex items-center gap-2">
                <IdCard className="size-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">User ID</p>
                  <p className="text-sm font-medium">#{user.id}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <CalendarClock className="size-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Member Since</p>
                  <p className="text-sm font-medium">
                    {formatDate(user.created_at)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="size-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Last Updated</p>
                  <p className="text-sm font-medium">
                    {formatDateTime(user.updated_at)}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <UserRound />
                Personal Information
              </CardTitle>
              <CardDescription>
                Your identity and account details.
              </CardDescription>
            </CardHeader>
            <CardContent className="divide-y">
              <InfoRow label="Full Name" value={user.name} />
              <InfoRow label="Email Address" value={user.email} />
              <InfoRow label="Role" value={role.label} />
              <InfoRow label="User ID" value={`#${user.id}`} />
              <InfoRow
                label="Member Since"
                value={formatDate(user.created_at)}
              />
              <InfoRow
                label="Last Updated"
                value={formatDateTime(user.updated_at)}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <ShieldCheck />
                Role & Access
              </CardTitle>
              <CardDescription>{role.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-2 text-sm font-medium">Accessible Modules</p>
              <div className="flex flex-wrap gap-2">
                {role.access.map((module) => (
                  <Badge key={module} variant="outline">
                    {module}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Briefcase />
                Account Status
              </CardTitle>
              <CardDescription>
                Current operational state of your account.
              </CardDescription>
            </CardHeader>
            <CardContent className="divide-y">
              <InfoRow
                label="Account Status"
                value={
                  <Badge variant={user.is_active ? "default" : "destructive"}>
                    {user.is_active ? "Active" : "Inactive"}
                  </Badge>
                }
              />
              {user.deactivated_at && (
                <InfoRow
                  label="Deactivated At"
                  value={formatDateTime(user.deactivated_at)}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
