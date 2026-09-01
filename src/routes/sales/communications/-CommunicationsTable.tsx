import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardHeader } from "@/components/ui/card"
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
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Ellipsis, FunnelPlus, Plus, Search } from "lucide-react"
import { useNavigate } from "@tanstack/react-router"
import { Spinner } from "@/components/ui/spinner"
import {
  communicationTypeIcons,
  communicationTypeLabels,
  communicationDirectionLabels,
  type CommunicationEntry,
  type CommunicationType,
} from "@/components/communication-history"
import useCommunicationsQuery from "./-useCommunicationsQuery"

export type CommunicationTableRow = CommunicationEntry

function CommunicationTypeCell({ type }: { type: CommunicationType }) {
  const Icon = communicationTypeIcons[type]
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted">
        <Icon size={14} className="text-muted-foreground" />
      </div>
      <Badge variant="outline" className="text-xs">
        {communicationTypeLabels[type]}
      </Badge>
    </div>
  )
}

function CommunicationDirectionCell({
  direction,
}: {
  direction: "incoming" | "outgoing"
}) {
  const variant = direction === "incoming" ? "secondary" : "default"
  return (
    <Badge variant={variant} className="text-xs">
      {communicationDirectionLabels[direction]}
    </Badge>
  )
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays < 1) {
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })
  } else if (diffDays < 7) {
    return `${diffDays}d ago`
  } else {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }
}

function trimSubject(subject: string, max = 30): string {
  if (subject.length <= max) {
    return subject
  }
  return `${subject.slice(0, max).trimEnd()}...`
}

export default function CommunicationsTable() {
  const navigate = useNavigate()
  const query = useCommunicationsQuery()
  const data = query.data

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-start gap-2">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon">
              <Search />
            </Button>
            <Input placeholder="Search communications..." className="w-xs" />
            <Button variant="outline" size="icon">
              <FunnelPlus />
            </Button>
          </div>
        </div>
        <CardAction>
          <Button
            onClick={() => navigate({ to: "/admin/communications/create" })}
          >
            <Plus />
            <span>Log Communication</span>
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        {query.isPending ? (
          <div className="flex justify-center">
            <Spinner />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>{"Type & Direction"}</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>{"Logged By & Date"}</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.map((comm) => (
                <TableRow
                  key={comm.id}
                  onClick={() =>
                    navigate({
                      to: "/sales/communications/$communicationId",
                      params: { communicationId: comm.id.toString() },
                    })
                  }
                >
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
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
                        <span className="text-xs font-normal text-muted-foreground">
                          {comm.company.industry}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {comm.contact ? (
                      <div className="flex flex-col">
                        <span>{comm.contact.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {comm.contact.title}
                        </span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1.5">
                      <CommunicationTypeCell type={comm.type} />
                      <CommunicationDirectionCell direction={comm.direction} />
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs">
                    {comm.subject ? (
                      <span className="block" title={comm.subject}>
                        {trimSubject(comm.subject)}
                      </span>
                    ) : (
                      <span className="text-sm text-muted-foreground italic">
                        No subject
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      {comm.user ? (
                        <div className="flex items-center gap-1.5">
                          <Avatar className="h-5 w-5">
                            <AvatarFallback className="text-[0.65rem]">
                              {comm.user.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{comm.user.name}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {formatDate(comm.created_at)}
                      </span>
                    </div>
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
                      <DropdownMenuContent align="end">
                        <DropdownMenuGroup>
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation()
                              navigate({
                                to: "/sales/communications/$communicationId",
                                params: {
                                  communicationId: comm.id.toString(),
                                },
                              })
                            }}
                          >
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => e.stopPropagation()}
                          >
                            Edit
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={(e) => e.stopPropagation()}
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
