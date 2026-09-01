import axios from "axios"

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
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

export default api
