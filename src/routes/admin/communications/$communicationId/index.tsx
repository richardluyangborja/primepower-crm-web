import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { createFileRoute, useRouter, Link } from "@tanstack/react-router"
import { ChevronLeft, ContactRound, Pencil } from "lucide-react"
import { Spinner } from "@/components/ui/spinner"
import {
  CommunicationTypeBadge,
  CommunicationDirectionBadge,
  communicationTypeIcons,
  communicationTypeLabels,
  type CommunicationEntry,
  formatDuration,
} from "@/components/communication-history"
import useCommunicationDetailsQuery from "../-useCommunicationDetailsQuery"

export const Route = createFileRoute("/admin/communications/$communicationId/")(
  {
    component: RouteComponent,
  }
)

function RouteComponent() {
  const router = useRouter()
  const { communicationId } = Route.useParams()
  const query = useCommunicationDetailsQuery(communicationId)
  const comm = query.data
  const TypeIcon = comm ? communicationTypeIcons[comm.type] : null

  return (
    <div className="px-4 pb-8">
      <header className="py-4">
        <Button variant="link" onClick={() => router.history.back()}>
          <ChevronLeft />
          <span>Back</span>
        </Button>
      </header>

      <main>
        {query.isPending ? (
          <div className="flex justify-center">
            <Spinner />
          </div>
        ) : !comm ? (
          <p className="text-sm text-muted-foreground">
            Communication not found.
          </p>
        ) : (
          <>
            <header>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                  {TypeIcon && (
                    <TypeIcon size={22} className="text-muted-foreground" />
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <h1 className="font-heading text-lg">
                    {comm.subject ?? communicationTypeLabels[comm.type]}
                  </h1>
                  <div className="flex items-center gap-2">
                    <CommunicationTypeBadge type={comm.type} />
                    <CommunicationDirectionBadge direction={comm.direction} />
                  </div>
                </div>
              </div>
            </header>

            <div className="mt-6 flex flex-col gap-6">
              <CommunicationDetailCard
                comm={comm}
                date={new Date(comm.created_at)}
              />
            </div>
          </>
        )}
      </main>
    </div>
  )
}

function CommunicationDetailCard({
  comm,
  date,
}: {
  comm: CommunicationEntry
  date: Date
}) {
  return (
    <section>
      <Card>
        <CardHeader>
          <CardTitle>Communication Details</CardTitle>
          <CardDescription>Recorded on {date.toLocaleString()}</CardDescription>
          <CardAction>
            <Link
              to="/admin/communications/create"
              className="inline-flex items-center justify-center rounded-md border border-input bg-background px-3 text-sm font-medium shadow-xs hover:bg-accent"
            >
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </CardAction>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="block text-sm text-muted-foreground">Type</span>
              <CommunicationTypeBadge type={comm.type} />
            </div>
            <div>
              <span className="block text-sm text-muted-foreground">
                Direction
              </span>
              <CommunicationDirectionBadge direction={comm.direction} />
            </div>
            {comm.subject && (
              <div className="col-span-2">
                <span className="block text-sm text-muted-foreground">
                  Subject
                </span>
                <span>{comm.subject}</span>
              </div>
            )}
            {comm.scheduled_at && (
              <div>
                <span className="block text-sm text-muted-foreground">
                  Scheduled At
                </span>
                <span>{new Date(comm.scheduled_at).toLocaleString()}</span>
              </div>
            )}
            {comm.duration_minutes && comm.duration_minutes > 0 && (
              <div>
                <span className="block text-sm text-muted-foreground">
                  Duration
                </span>
                <span>{formatDuration(comm.duration_minutes)}</span>
              </div>
            )}
            <div>
              <span className="block text-sm text-muted-foreground">
                Logged By
              </span>
              <div className="flex items-center gap-2">
                {comm.user ? (
                  <>
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs">
                        {comm.user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <span>{comm.user.name}</span>
                  </>
                ) : (
                  <span className="text-sm text-muted-foreground">—</span>
                )}
              </div>
            </div>
          </div>

          <Separator className="my-4" />

          <div>
            <span className="block text-sm text-muted-foreground">Company</span>
            <div className="mt-1 flex items-center gap-2">
              <Avatar>
                <AvatarFallback>
                  {comm.company.name
                    .split(" ")
                    .map((w) => w[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span>{comm.company.name}</span>
                <span className="text-xs text-muted-foreground">
                  {comm.company.industry}
                </span>
              </div>
            </div>
          </div>

          <Separator className="my-4" />

          <div>
            <span className="block text-sm text-muted-foreground">Contact</span>
            {comm.contact ? (
              <div className="mt-1 flex items-center gap-2">
                <ContactRound size={18} className="text-muted-foreground" />
                <div className="flex flex-col">
                  <span>{comm.contact.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {comm.contact.title}
                  </span>
                </div>
              </div>
            ) : (
              <span className="mt-1 text-sm text-muted-foreground">—</span>
            )}
          </div>

          <Separator className="my-4" />

          <div>
            <span className="block text-sm text-muted-foreground">Notes</span>
            <p className="mt-1 text-sm">{comm.notes ?? "—"}</p>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}
