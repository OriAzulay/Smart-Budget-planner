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
          const { getSession } = await import("next-auth/react")
          const session = await getSession()
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

export const gridsApi = {
  get: (key: string) => apiClient().get(`/grids/${key}`),
  addColumn: (key: string, label: string) =>
    apiClient().post(`/grids/${key}/columns`, { label }),
  addRow: (key: string, label: string) =>
    apiClient().post(`/grids/${key}/rows`, { label }),
  deleteColumn: (key: string, columnId: string) =>
    apiClient().delete(`/grids/${key}/columns/${columnId}`),
  deleteRow: (key: string, rowId: string) =>
    apiClient().delete(`/grids/${key}/rows/${rowId}`),
  upsertCell: (key: string, data: { row_id: string; column_id: string; value: number | null }) =>
    apiClient().put(`/grids/${key}/cells`, data),
}

export const monthsApi = {
  list: () => apiClient().get("/months"),
  create: (name: string) => apiClient().post("/months", { name }),
  get: (id: string) => apiClient().get(`/months/${id}`),
  update: (
    id: string,
    data: Partial<{ name: string; starting_balance: number; ending_balance: number; notes: string }>
  ) => apiClient().patch(`/months/${id}`, data),
  delete: (id: string) => apiClient().delete(`/months/${id}`),
  addLineItem: (
    monthId: string,
    data: { category: string; source: string; amount?: number; notes?: string | null }
  ) => apiClient().post(`/months/${monthId}/line-items`, data),
  updateLineItem: (
    monthId: string,
    itemId: string,
    data: Partial<{ source: string; amount: number; notes: string | null }>
  ) => apiClient().patch(`/months/${monthId}/line-items/${itemId}`, data),
  deleteLineItem: (monthId: string, itemId: string) =>
    apiClient().delete(`/months/${monthId}/line-items/${itemId}`),
}
