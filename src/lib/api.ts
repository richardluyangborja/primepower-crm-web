import axios, { isAxiosError } from "axios"

function resolveBaseUrl(): string {
  // VITE_API_URL="" (empty) => same-origin relative calls, for the
  // single-artifact deploy where Laravel serves the SPA. Any absolute URL
  // => split deploy (local :8000 or HostForge backend host).
  // NOTE: Vite bakes VITE_API_URL at build time from the build env. A prod
  // bundle built without overriding it would carry "http://localhost:8000",
  // so ignore loopback values when we're not actually on localhost.
  const fromEnv = (import.meta.env.VITE_API_URL as string | undefined)?.trim()
  const isLocalPage =
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1")

  if (fromEnv !== undefined && fromEnv !== "") {
    const isLoopback = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i.test(fromEnv)
    if (!isLoopback || isLocalPage) {
      return fromEnv.replace(/\/+$/, "")
    }
    // Prod page + baked-in localhost API URL => fall through to prod default.
  }

  if (fromEnv === "") {
    return ""
  }

  return "https://crm-backend-primepower.hostforgeplatforms.com"
}



const api = axios.create({
  baseURL: resolveBaseUrl(),
  withCredentials: true,
  withXSRFToken: true,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
})

let csrfInitialized = false
let csrfPromise: Promise<void> | null = null

export async function initializeCsrf(force = false): Promise<void> {
  if (csrfInitialized && !force) {
    return
  }

  if (csrfPromise) {
    return csrfPromise
  }

  csrfPromise = api
    .get("/sanctum/csrf-cookie")
    .then(() => {
      csrfInitialized = true
    })
    .finally(() => {
      csrfPromise = null
    })

  return csrfPromise
}

api.interceptors.request.use(async (config) => {
  const method = config.method?.toLowerCase()

  const requiresCsrf = ["post", "put", "patch", "delete"].includes(method ?? "")

  if (requiresCsrf) {
    await initializeCsrf()
  }

  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error?.response?.status
    const url: string = error?.config?.url ?? ""
    const path = window.location.pathname

    // First 419 on a mutating request usually means the session/CSRF cookie
    // went stale (cold jar, expired session, or cross-site cookie blocked on
    // the split HostForge deploy). Refresh the cookie once and retry so a
    // valid login doesn't fail on the first click.
    const canRetryCsrf =
      status === 419 &&
      !error?.config?._csrfRetried &&
      ["post", "put", "patch", "delete"].includes(
        error?.config?.method?.toLowerCase() ?? "",
      )

    if (canRetryCsrf) {
      error.config._csrfRetried = true
      csrfInitialized = false
      try {
        await initializeCsrf(true)
        return await api.request(error.config)
      } catch {
        // Fall through to the normal rejection below.
      }
    }

    const isAuthRequest =
      url.includes("/api/login") ||
      url.includes("/api/logout") ||
      url.includes("/api/auth/otp/") ||
      url.includes("/sanctum/csrf-cookie")
    const isPublicPage = path.startsWith("/login") || path.startsWith("/survey")

    if ((status === 401 || status === 419) && !isAuthRequest && !isPublicPage) {
      csrfInitialized = false
      window.location.href = "/login?expired=1"
    }

    return Promise.reject(error)
  }
)

export default api

export { isAxiosError }
