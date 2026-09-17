import axios, { isAxiosError } from "axios"

function resolveBaseUrl(): string {
  // Explicit build-time override wins.
  // - Local dev (.env): VITE_API_URL=http://localhost:8000
  // - Single-artifact prod (Laravel serves the SPA): leave VITE_API_URL empty
  //   so requests stay same-origin (relative /api/*, /sanctum/*) — no CORS,
  //   no mixed-content, cookies stay first-party.
  // - Split prod (separate static host + API host): set VITE_API_URL to the
  //   absolute API origin, e.g. https://api.example.com
  const configured = import.meta.env.VITE_API_URL as string | undefined
  if (configured !== undefined) {
    return configured
  }

  // Local dev default when no env is set at all.
  if (window.location.hostname === "localhost") {
    return "http://localhost:8000"
  }

  // Same-origin fallback for single-artifact deployments.
  return ""
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

export async function initializeCsrf(): Promise<void> {
  if (csrfInitialized) {
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
  (error) => {
    const status = error?.response?.status
    const url: string = error?.config?.url ?? ""
    const path = window.location.pathname

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
