import axios, { isAxiosError } from "axios"

const api = axios.create({
  baseURL:
    window.location.hostname === "localhost"
      ? "http://localhost:8000"
      : "https://primepower-crm-api-primepower.hostforgeplatforms.com",
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
