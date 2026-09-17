import * as React from "react"
import { useNavigate } from "@tanstack/react-router"
import { useQueryClient } from "@tanstack/react-query"
import api from "@/lib/api"

// Matches the backend SessionIdleTimeout (SESSION_IDLE_TIMEOUT, seconds).
const DEFAULT_TIMEOUT_MS = 30 * 60 * 1000

const ACTIVITY_EVENTS = [
  "mousemove",
  "mousedown",
  "keydown",
  "touchstart",
  "scroll",
  "wheel",
] as const

function getTimeoutMs(): number {
  const raw = import.meta.env.VITE_SESSION_IDLE_TIMEOUT_MS
  const parsed = Number(raw)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_TIMEOUT_MS
}

/**
 * Logs the user out after a period with no physical input
 * (mouse, keyboard, touch, scroll). Background polling does
 * not count as activity, so this enforces true idleness.
 */
export function useIdleLogout() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const timer = React.useRef<number | null>(null)

  const logout = React.useCallback(async () => {
    try {
      await api.post("/api/logout")
    } catch {
      // Session may already be gone — still redirect below.
    } finally {
      queryClient.clear()
      navigate({ to: "/login", search: { expired: "1" }, replace: true })
    }
  }, [navigate, queryClient])

  const logoutRef = React.useRef(logout)

  React.useEffect(() => {
    logoutRef.current = logout
  }, [logout])

  React.useEffect(() => {
    const timeoutMs = getTimeoutMs()

    const reset = () => {
      if (timer.current !== null) {
        window.clearTimeout(timer.current)
      }
      timer.current = window.setTimeout(() => {
        void logoutRef.current()
      }, timeoutMs)
    }

    reset()

    for (const event of ACTIVITY_EVENTS) {
      window.addEventListener(event, reset, { passive: true })
    }

    return () => {
      if (timer.current !== null) {
        window.clearTimeout(timer.current)
      }
      for (const event of ACTIVITY_EVENTS) {
        window.removeEventListener(event, reset)
      }
    }
  }, [])
}
