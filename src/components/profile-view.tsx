import { useState } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  Briefcase,
  Camera,
  Pencil,
  ShieldCheck,
  UserRound,
} from "lucide-react"
import { Spinner } from "@/components/ui/spinner"
import useAuthUser, { type AuthUser } from "@/lib/queries/useAuthUser"

const AVATAR_PRESETS = [
  { id: "indigo", label: "Indigo", className: "bg-indigo-500" },
  { id: "emerald", label: "Emerald", className: "bg-emerald-500" },
  { id: "rose", label: "Rose", className: "bg-rose-500" },
  { id: "amber", label: "Amber", className: "bg-amber-500" },
  { id: "sky", label: "Sky", className: "bg-sky-500" },
  { id: "violet", label: "Violet", className: "bg-violet-500" },
  { id: "teal", label: "Teal", className: "bg-teal-500" },
  { id: "fuchsia", label: "Fuchsia", className: "bg-fuchsia-500" },
] as const

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

function formatDate(value?: string): string {
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

function InfoRow({
  label,
  value,
}: {
  label: string
  value: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-right">{value}</span>
    </div>
  )
}

export default function ProfileView() {
  const userQuery = useAuthUser()
  const user = userQuery.data

  const [avatarId, setAvatarId] = useState<string>(AVATAR_PRESETS[0].id)
  const [pictureDialogOpen, setPictureDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)

  if (userQuery.isPending || !user) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    )
  }

  const role = ROLE_DETAILS[user.role] ?? ROLE_DETAILS.sales_rep
  const initials = getInitials(user.name)
  const avatar = AVATAR_PRESETS.find((preset) => preset.id === avatarId)!

  return (
    <div className="px-4 pb-8">
      <header className="py-4">
        <h1 className="font-heading text-lg">My Profile</h1>
        <p className="mb-6 text-sm text-muted-foreground">
          Review your account details and personalize how your profile appears
          across the CRM.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardContent className="flex flex-col items-center gap-4 pt-6 text-center">
            <Avatar className="size-24 text-2xl text-white">
              <AvatarFallback className={avatar.className}>
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <p className="text-lg font-semibold">{user.name}</p>
              <Badge variant="secondary">{role.label}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setPictureDialogOpen(true)}
            >
              <Camera />
              Change Picture
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="flex items-center gap-2 text-base">
                  <UserRound />
                  Personal Information
                </CardTitle>
                <CardDescription>
                  Your identity and account details.
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditDialogOpen(true)}
              >
                <Pencil />
                Edit
              </Button>
            </CardHeader>
            <CardContent className="divide-y">
              <InfoRow label="Full Name" value={user.name} />
              <InfoRow label="Email Address" value={user.email} />
              <InfoRow label="Role" value={role.label} />
              <InfoRow label="User ID" value={`#${user.id}`} />
              <InfoRow
                label="Member Since"
                value={formatDate((user as AuthUser & { created_at?: string }).created_at)}
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
                Account Settings
              </CardTitle>
              <CardDescription>
                Security and preference controls for your account.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Password</p>
                  <p className="text-xs text-muted-foreground">
                    Last updated recently
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Change Password
                </Button>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Two-Factor Authentication</p>
                  <p className="text-xs text-muted-foreground">
                    Add an extra layer of security
                  </p>
                </div>
                <Badge variant="default">
                  <ShieldCheck />
                  Enabled
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={pictureDialogOpen} onOpenChange={setPictureDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Change Profile Picture</DialogTitle>
            <DialogDescription>
              Choose a preset avatar. Uploads are not available yet — this is a
              preview only.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-4 gap-4 py-2">
            {AVATAR_PRESETS.map((preset) => {
              const isSelected = preset.id === avatarId
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setAvatarId(preset.id)}
                  className="flex flex-col items-center gap-2"
                >
                  <Avatar
                    className={`size-14 text-lg text-white ring-2 transition ${
                      isSelected
                        ? "ring-primary"
                        : "ring-transparent hover:ring-muted-foreground/40"
                    }`}
                  >
                    <AvatarFallback className={preset.className}>
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-muted-foreground">
                    {preset.label}
                  </span>
                </button>
              )
            })}
          </div>
          <DialogFooter>
            <Button onClick={() => setPictureDialogOpen(false)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>
              Profile editing will be available soon. This is a preview of the
              upcoming form.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="profile-name">Full Name</Label>
              <Input id="profile-name" defaultValue={user.name} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile-email">Email Address</Label>
              <Input
                id="profile-email"
                type="email"
                defaultValue={user.email}
                disabled
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
