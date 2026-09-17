import * as React from "react"
import { useMutation } from "@tanstack/react-query"
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Info,
  MailCheck,
  RefreshCw,
  ShieldAlert,
  TriangleAlert,
} from "lucide-react"
import api, { isAxiosError } from "@/lib/api"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"

type ChallengeStatus =
  | "awaiting"
  | "verifying"
  | "expired"
  | "locked"
  | "failed"

type ChallengeError = {
  title: string
  message: string
  variant: "destructive" | "default"
}

function formatCountdown(totalSeconds: number): string {
  const clamped = Math.max(0, totalSeconds)
  const minutes = Math.floor(clamped / 60)
  const seconds = clamped % 60
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
}

export function TwoFactorChallenge({
  email,
  maskedEmail,
  expiresInSeconds,
  onVerified,
  onBack,
}: {
  email: string
  maskedEmail: string
  expiresInSeconds: number
  onVerified: (role: string | null) => void
  onBack: () => void
}) {
  const [code, setCode] = React.useState("")
  const [expiresAt, setExpiresAt] = React.useState(() =>
    Date.now() + expiresInSeconds * 1000
  )
  const [now, setNow] = React.useState(() => Date.now())
  const [status, setStatus] = React.useState<ChallengeStatus>("awaiting")
  const [error, setError] = React.useState<ChallengeError | null>(null)
  const [notice, setNotice] = React.useState<string | null>(
    `We sent a 6-digit verification code to ${maskedEmail}.`
  )
  const [resendAvailableAt, setResendAvailableAt] = React.useState(() =>
    Date.now() + 60 * 1000
  )
  // True when the session/CSRF cookie died mid-ceremony (HTTP 419).
  // Neither verify nor resend can succeed — the user must restart login.
  const [sessionExpired, setSessionExpired] = React.useState(false)
  const verifyingRef = React.useRef(false)

  React.useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  const remainingSeconds = Math.max(
    0,
    Math.round((expiresAt - now) / 1000)
  )
  const isExpired = remainingSeconds <= 0
  const resendWaitSeconds = Math.max(
    0,
    Math.round((resendAvailableAt - now) / 1000)
  )

  // Expiry is derived from the clock, not stored — no effect needed.
  // Once the countdown hits zero the code is unusable until resend().
  const expiredView =
    isExpired && (status === "awaiting" || status === "failed")
  const viewStatus: ChallengeStatus = expiredView ? "expired" : status
  const viewError: ChallengeError | null =
    expiredView && !error
      ? {
          title: "Code expired",
          message:
            "This verification code is no longer valid. Request a new code below and try again.",
          variant: "default",
        }
      : error

  const verifyMutation = useMutation({
    mutationFn: async (value: string) => {
      return api.post("/api/auth/otp/verify", { email, code: value })
    },
    retry: false,
    onSuccess: (response) => {
      verifyingRef.current = false
      const role =
        response.data?.user?.role ?? response.data?.role ?? null
      onVerified(role)
    },
    onError: (mutationError) => {
      verifyingRef.current = false
      if (!isAxiosError(mutationError)) {
        setStatus("failed")
        setError({
          title: "Something went wrong",
          message:
            "We could not verify the code because of an unexpected error. Please try again.",
          variant: "destructive",
        })
        return
      }
      const statusCode = mutationError.response?.status
      const data = mutationError.response?.data as
        | {
            message?: string
            code?: string
            attempts_remaining?: number
            retry_after_seconds?: number
          }
        | undefined

      // The session (and its CSRF token) died mid-ceremony — e.g. the
      // tab sat on this screen past the session lifetime. Verify and
      // resend cannot succeed until the user logs in again.
      if (statusCode === 419) {
        setSessionExpired(true)
        setCode("")
        setStatus("failed")
        setError({
          title: "Login session expired",
          message:
            "Your login session timed out before the code was entered. Go back and log in again to get a fresh code.",
          variant: "destructive",
        })
        return
      }
      const serverCode = data?.code
      const message =
        data?.message ?? "The code could not be verified. Please try again."

      if (statusCode === 410 || serverCode === "expired") {
        setStatus("expired")
        setError({ title: "Code expired", message, variant: "default" })
        return
      }
      if (statusCode === 429 && serverCode === "locked") {
        setStatus("locked")
        setCode("")
        setError({ title: "Too many attempts", message, variant: "destructive" })
        return
      }
      if (statusCode === 429 && serverCode === "cooldown") {
        const wait = data?.retry_after_seconds ?? 60
        setResendAvailableAt(Date.now() + wait * 1000)
        setStatus("failed")
        setError({ title: "Please slow down", message, variant: "default" })
        return
      }
      if (statusCode === 422 && serverCode === "no_pending_code") {
        setStatus("expired")
        setCode("")
        setError({ title: "No active code", message, variant: "default" })
        return
      }
      // Wrong code (with attempts left) or any other validation error.
      setStatus("failed")
      setCode("")
      setError({ title: "Incorrect code", message, variant: "destructive" })
    },
  })

  const resendMutation = useMutation({
    mutationFn: async () => {
      return api.post("/api/auth/otp/resend", { email })
    },
    retry: false,
    onSuccess: (response) => {
      const freshTtl =
        (response.data?.expires_in_seconds as number | undefined) ??
        expiresInSeconds
      const freshMasked =
        (response.data?.masked_email as string | undefined) ?? maskedEmail
      setExpiresAt(Date.now() + freshTtl * 1000)
      setResendAvailableAt(Date.now() + 60 * 1000)
      setCode("")
      setStatus("awaiting")
      setError(null)
      setSessionExpired(false)
      setNotice(
        `A new code is on its way to ${freshMasked}. The previous code no longer works.`
      )
    },
    onError: (mutationError) => {
      if (isAxiosError(mutationError)) {
        if (mutationError.response?.status === 419) {
          setSessionExpired(true)
          setCode("")
          setError({
            title: "Login session expired",
            message:
              "Your login session timed out. Go back and log in again to get a fresh code.",
            variant: "destructive",
          })
          return
        }
        const data = mutationError.response?.data as
          | { message?: string; retry_after_seconds?: number }
          | undefined
        const wait = data?.retry_after_seconds ?? 60
        setResendAvailableAt(Date.now() + wait * 1000)
        setError({
          title: "Resend too soon",
          message:
            data?.message ??
            `Please wait ${wait} seconds before requesting another code.`,
          variant: "default",
        })
        return
      }
      setError({
        title: "Resend failed",
        message:
          "We could not send a new code because of a network problem. Check your connection and try again.",
        variant: "destructive",
      })
    },
  })

  const submitCode = (value: string) => {
    if (verifyingRef.current || verifyMutation.isPending) return
    if (value.length !== 6) return
    if (status === "locked") return
    verifyingRef.current = true
    setStatus("verifying")
    setError(null)
    setNotice(null)
    verifyMutation.mutate(value)
  }

  const handleCodeChange = (value: string) => {
    if (status === "verifying" || status === "locked") return
    if (sessionExpired || isExpired) return
    setCode(value)
    if (status === "failed") {
      setStatus("awaiting")
      setError(null)
    }
    if (value.length === 6) {
      submitCode(value)
    }
  }

  const inputDisabled =
    verifyMutation.isPending ||
    viewStatus === "locked" ||
    sessionExpired ||
    isExpired
  const canResend =
    !sessionExpired && resendWaitSeconds <= 0 && !resendMutation.isPending

  return (
    <FieldGroup>
      <div className="flex flex-col items-center gap-1 text-center">
        <span className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
          <MailCheck className="size-5" />
        </span>
        <h1 className="text-2xl font-bold">Check your email</h1>
        <p className="text-sm text-balance text-muted-foreground">
          Enter the 6-digit code we sent to{" "}
          <span className="font-medium text-foreground">{maskedEmail}</span>
        </p>
      </div>

      {notice && (
        <Alert>
          <Info />
          <AlertTitle>Code sent</AlertTitle>
          <AlertDescription>{notice}</AlertDescription>
        </Alert>
      )}

      {viewError && (
        <Alert variant={viewError.variant}>
          {viewStatus === "locked" ? (
            <ShieldAlert />
          ) : viewStatus === "expired" ? (
            <Clock3 />
          ) : viewError.variant === "destructive" ? (
            <TriangleAlert />
          ) : (
            <Info />
          )}
          <AlertTitle>{viewError.title}</AlertTitle>
          <AlertDescription>{viewError.message}</AlertDescription>
        </Alert>
      )}

      <Field>
        <FieldLabel htmlFor="otp-code">Verification code</FieldLabel>
        <div className="flex justify-center py-1">
          <InputOTP
            id="otp-code"
            maxLength={6}
            inputMode="numeric"
            value={code}
            onChange={handleCodeChange}
            disabled={inputDisabled}
            aria-label="6-digit verification code"
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
            </InputOTPGroup>
            <InputOTPSeparator />
            <InputOTPGroup>
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
        </div>
        <FieldDescription
          className={cn(
            "flex items-center justify-center gap-1.5",
            isExpired && "font-medium text-amber-600 dark:text-amber-400"
          )}
        >
          <Clock3 className="size-3.5" />
          {isExpired ? (
            <>This code has expired — request a new one below.</>
          ) : (
            <>
              Code expires in{" "}
              <span className="font-mono font-semibold">
                {formatCountdown(remainingSeconds)}
              </span>
            </>
          )}
        </FieldDescription>
      </Field>

      <Field>
        <Button
          type="button"
          disabled={code.length !== 6 || inputDisabled}
          onClick={() => submitCode(code)}
        >
          {verifyMutation.isPending && <Spinner />}
          {verifyMutation.isPending ? "Verifying code…" : "Verify code"}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={!canResend}
          onClick={() => resendMutation.mutate()}
        >
          {resendMutation.isPending ? (
            <>
              <Spinner /> Sending new code…
            </>
          ) : resendWaitSeconds > 0 ? (
            <>
              <RefreshCw className="size-4" />
              Resend code in {resendWaitSeconds}s
            </>
          ) : (
            <>
              <RefreshCw className="size-4" />
              {viewStatus === "expired" || viewStatus === "locked"
                ? "Request a new code"
                : "Resend code"}
            </>
          )}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={onBack}
          disabled={verifyMutation.isPending}
        >
          <ArrowLeft className="size-4" />
          Use a different account
        </Button>
      </Field>

      {status === "verifying" && (
        <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
          <CheckCircle2 className="size-3.5" />
          Code accepted format — confirming with the server…
        </p>
      )}
    </FieldGroup>
  )
}
