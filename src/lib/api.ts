import axios, { isAxiosError } from "axios"

function resolveBaseUrl(): string {
  // Explicit build-time override wins (set VITE_API_URL in prod builds).
  const configured = import.meta.env.VITE_API_URL as string | undefined
  if (configured && configured.length > 0) {
    return configured
  }

  // Local dev default; the deployed frontend must set VITE_API_URL.
  if (window.location.hostname === "localhost") {
    return "http://localhost:8000"
  }

  return "https://primepower-crm-api-primepower.hostforgeplatforms.com"
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
