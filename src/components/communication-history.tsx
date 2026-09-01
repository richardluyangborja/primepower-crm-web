/* eslint-disable react-refresh/only-export-components */
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  ArrowDown,
  ArrowUp,
  Calendar,
  Clock,
  Mail,
  MessageSquare,
  MoveUpRight,
  Phone,
  User,
  Video,
} from "lucide-react"
import { Link } from "@tanstack/react-router"
import { Button } from "./ui/button"

export type CommunicationType =
  "email" | "phone" | "text" | "meeting" | "in_person" | "video"

export type CommunicationEntry = {
  id: number
  company: { id: number; name: string; industry: string }
  contact: { id: number; name: string; title: string } | null
  type: CommunicationType
  direction: "incoming" | "outgoing"
  subject: string | null
  notes: string | null
  duration_minutes: number | null
  scheduled_at: string | null
  user: { id: number; name: string } | null
  created_at: string
}

export const communicationTypeLabels: Record<CommunicationType, string> = {
  email: "Email",
  phone: "Phone Call",
  text: "Text Message",
  meeting: "Meeting",
  in_person: "In-Person",
  video: "Video Call",
}

export const communicationTypeIcons: Record<
  CommunicationType,
  React.ElementType
> = {
  email: Mail,
  phone: Phone,
  text: MessageSquare,
  meeting: Calendar,
  in_person: User,
  video: Video,
}

export const communicationTypeVariant: Record<
  CommunicationType,
  "default" | "secondary" | "outline" | "destructive"
> = {
  email: "default",
  phone: "secondary",
  text: "outline",
  meeting: "default",
  in_person: "secondary",
  video: "default",
}

export const communicationDirectionVariant: Record<
  "incoming" | "outgoing",
  "default" | "secondary"
> = {
  incoming: "secondary",
  outgoing: "default",
}

export function CommunicationTypeBadge({ type }: { type: CommunicationType }) {
  const Icon = communicationTypeIcons[type]
  return (
    <Badge
      variant={communicationTypeVariant[type]}
      className="flex items-center gap-1"
    >
      <Icon size={12} />
      <span>{communicationTypeLabels[type]}</span>
    </Badge>
  )
}

export function CommunicationDirectionBadge({
  direction,
}: {
  direction: "incoming" | "outgoing"
}) {
  const Icon = direction === "incoming" ? ArrowDown : ArrowUp
  return (
    <Badge
      variant={communicationDirectionVariant[direction]}
      className="flex items-center gap-1"
    >
      <Icon size={10} />
      <span>{direction === "incoming" ? "Inbound" : "Outbound"}</span>
    </Badge>
  )
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

export function CommunicationHistorySection({
  communications,
  basePath = "/admin",
}: {
  communications: CommunicationEntry[]
  basePath?: string
}) {
  if (!communications || communications.length === 0) {
    return (
      <section>
        <h3 className="my-3 font-heading text-lg">Communications</h3>
        <p className="text-sm text-muted-foreground">
          No communications logged yet.
        </p>
      </section>
    )
  }

  return (
    <section>
      <div className="flex items-center justify-between">
        <h3 className="my-3 font-heading text-lg">Communications</h3>
        <Badge variant="secondary" className="text-xs">
          {communications.length} entries
        </Badge>
      </div>

      <div className="flex flex-col gap-4">
        {communications.map((c) => (
          <CommunicationCard key={c.id} communication={c} basePath={basePath} />
        ))}
      </div>
    </section>
  )
}

function CommunicationCard({
  communication,
  basePath = "/admin",
}: {
  communication: CommunicationEntry
  basePath?: string
}) {
  const Icon = communicationTypeIcons[communication.type]
  const date = new Date(communication.created_at)
  const formattedDate = date.toLocaleString()
  const formattedTime = date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })

  return (
    <div className="flex gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
        <Icon size={18} className="text-muted-foreground" />
      </div>

      <div className="flex-1 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <CommunicationTypeBadge type={communication.type} />
            <CommunicationDirectionBadge direction={communication.direction} />
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock size={12} />
              <time dateTime={communication.created_at}>{formattedTime}</time>
            </div>

            <Button variant="link" size="sm" asChild>
              <Link
                to={`${basePath}/communications/$communicationId`}
                params={{ communicationId: String(communication.id) }}
              >
                <span>View</span>
                <MoveUpRight />
              </Link>
            </Button>
          </div>
        </div>

        {communication.subject && (
          <p className="text-sm font-medium">{communication.subject}</p>
        )}

        {communication.notes && (
          <p className="text-sm text-muted-foreground">{communication.notes}</p>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            {communication.contact && (
              <span className="flex items-center gap-1">
                <User size={12} />
                <span>{communication.contact.name}</span>
              </span>
            )}
            {communication.duration_minutes && (
              <span>{formatDuration(communication.duration_minutes)}</span>
            )}
            <time dateTime={communication.created_at}>{formattedDate}</time>
          </div>

          {communication.user && (
            <div className="flex items-center gap-1.5">
              <Avatar className="h-5 w-5">
                <AvatarFallback className="text-xs">
                  {communication.user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground">
                {communication.user.name}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export const communicationDirectionLabels: Record<
  "incoming" | "outgoing",
  string
> = {
  incoming: "Inbound",
  outgoing: "Outbound",
}
