import axios, { AxiosInstance } from "axios"

let instance: AxiosInstance | null = null

export const apiClient = (): AxiosInstance => {
  if (!instance) {
    instance = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL,
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
      },
    })

    // Request interceptor to add auth token
    instance.interceptors.request.use(
      async (config) => {
        try {
          const { useSession } = await import("next-auth/react")
          const { data: session } = useSession()
          
          if (session?.accessToken) {
            config.headers.Authorization = `Bearer ${session.accessToken}`
          }
        } catch (error) {
          // Session not available in SSR context
        }
        return config
      },
      (error) => Promise.reject(error)
    )

    // Response interceptor to handle 401
    instance.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          try {
            const { signOut } = await import("next-auth/react")
            await signOut({ redirect: true })
          } catch (err) {
            // Fallback
          }
        }
        return Promise.reject(error)
      }
    )
  }

  return instance
}

// API endpoints
export const authApi = {
  register: (data: { name: string; email: string; password: string }) =>
    apiClient().post("/auth/register", data),
  login: (data: { email: string; password: string }) =>
    apiClient().post("/auth/login", data),
  getMe: () => apiClient().get("/auth/me"),
}

export const usersApi = {
  list: () => apiClient().get("/users"),
  get: (id: string) => apiClient().get(`/users/${id}`),
  update: (id: string, data: any) =>
    apiClient().patch(`/users/${id}`, data),
  delete: (id: string) => apiClient().delete(`/users/${id}`),
}

export const statsApi = {
  overview: () => apiClient().get("/stats/overview"),
}
