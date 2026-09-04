import { useState } from "react"
import { useNavigate } from "@tanstack/react-router"
import { Bell, Check, CircleAlert, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotificationsQuery,
  useUnreadCountQuery,
} from "@/lib/queries/useNotifications"

export function NotificationsPanel({
  trigger,
}: {
  trigger?: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const query = useNotificationsQuery()
  const unreadQuery = useUnreadCountQuery()
  const markAll = useMarkAllNotificationsRead()
  const markRead = useMarkNotificationRead()

  const unreadCount = unreadQuery.data ?? 0
  const items = query.data ?? []

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {trigger ?? (
          <Button
            variant="outline"
            size="icon-lg"
            className="relative"
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
        )}
      </SheetTrigger>
      <SheetContent className="flex w-full flex-col gap-0 sm:max-w-md">
        <SheetHeader>
          <div className="flex items-center justify-between gap-2">
            <SheetTitle>Notifications</SheetTitle>
            {unreadCount > 0 && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => markAll.mutate()}
                disabled={markAll.isPending}
              >
                {markAll.isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Check />
                )}
                Mark all read
              </Button>
            )}
          </div>
          <SheetDescription>
            {unreadCount > 0
              ? `You have ${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}.`
              : "You're all caught up."}
          </SheetDescription>
        </SheetHeader>

        <Separator />

        <div className="flex-1 overflow-y-auto py-3">
          {query.isPending ? (
            <div className="flex justify-center py-8">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-12 text-center text-sm text-muted-foreground">
              <CircleAlert className="size-6" />
              No notifications yet.
            </div>
          ) : (
            <ul className="flex flex-col">
              {items.map((n) => (
                <li key={n.id}>
                  <button
                    type="button"
                    onClick={() => {
                      if (!n.read_at) {
                        markRead.mutate(n.id)
                      }
                      if (n.reminder_id) {
                        setOpen(false)
                        navigate({
                          to: "/admin/reminders/$reminderId",
                          params: { reminderId: String(n.reminder_id) },
                        })
                      }
                    }}
                    className={cn(
                      "flex w-full flex-col gap-1 border-b border-border/60 px-3 py-3 text-left text-sm transition hover:bg-muted/40",
                      !n.read_at && "bg-muted/30"
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium">
                        {n.title ?? "Notification"}
                      </span>
                      {!n.read_at && (
                        <span
                          aria-hidden
                          className="size-2 rounded-full bg-primary"
                        />
                      )}
                    </div>
                    {n.message && (
                      <span className="text-xs text-muted-foreground">
                        {n.message}
                      </span>
                    )}
                    <span className="text-[11px] text-muted-foreground">
                      {new Date(n.created_at).toLocaleString()}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
