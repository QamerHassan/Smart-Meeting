import axios, { AxiosInstance } from "axios";

// ---------------------------
// BASE URL CONFIG
// ---------------------------
// For Next.js API routes, use empty string or '/api'
// For external backend, use the full URL
const USE_NEXT_API = process.env.NEXT_PUBLIC_USE_NEXT_API === 'true';
const API_URL = USE_NEXT_API 
  ? '/api' // Use Next.js API routes
  : (process.env.NEXT_PUBLIC_API_URL?.trim() || "http://localhost:5000");

console.log("📡 Using API URL:", API_URL);
console.log("📡 Using Next.js API:", USE_NEXT_API);

// ---------------------------
// AXIOS INSTANCE
// ---------------------------
const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: !USE_NEXT_API, // Only for external backend
});

// ---------------------------
// REQUEST INTERCEPTOR
// ---------------------------
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("authToken");
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    console.log("➡️ Request:", `${config.baseURL}${config.url}`, config.data || "");
    return config;
  },
  (error) => {
    console.error("❌ Request Error:", error);
    return Promise.reject(error);
  }
);

// ---------------------------
// RESPONSE INTERCEPTOR
// ---------------------------
api.interceptors.response.use(
  (response) => {
    console.log("✅ Response:", response.config.url, response.data);
    return response;
  },
  (error) => {
    if (error.response) {
      console.error("❌ Server Error:", error.response.status, error.response.data);
    } else if (error.request) {
      console.error("⚠️ No response from backend:", API_URL);
    } else {
      console.error("❌ Request Setup Error:", error.message);
    }
    return Promise.reject(error);
  }
);

// ---------------------------
// AUTH API
// ---------------------------
export const authAPI = {
  register: (data: { name: string; email: string; password: string }) =>
    api.post("/auth/signup", data),

  login: (data: { email: string; password: string }) =>
    api.post("/auth/login", data),

  getMe: () => api.get("/auth/me"),
};

// ---------------------------
// TASKS API
// ---------------------------
export const tasksAPI = {
  getAll: async () => {
    const res = await api.get("/tasks");
    return Array.isArray(res.data) ? res.data : [];
  },

  getMyTasks: async () => {
    const res = await api.get("/tasks");
    return Array.isArray(res.data) ? res.data : [];
  },

  getByMeeting: async (meetingId: string | number) => {
    const res = await api.get(`/tasks/meeting/${meetingId}`);
    return Array.isArray(res.data) ? res.data : [];
  },

  create: (data: {
    title: string;
    description?: string;
    priority?: "low" | "medium" | "high";
    due_date?: string;
    meeting_id?: string | number;
    assigned_to?: string | number;
    status?: "pending" | "in-progress" | "completed" | "cancelled";
  }) => api.post("/tasks", data),

  update: (
    id: string | number,
    data: Partial<{
      title: string;
      description: string;
      priority: "low" | "medium" | "high";
      due_date: string;
      meeting_id: string | number;
      assigned_to: string | number;
      status: "pending" | "completed" | "in-progress" | "cancelled";
    }>
  ) => api.put(`/tasks/${id}`, data),

  updateStatus: (id: string | number, status: "pending" | "completed" | "in-progress" | "cancelled") =>
    api.patch(`/tasks/${id}/status`, { status }),

  delete: (id: string | number) => api.delete(`/tasks/${id}`),
};

// ---------------------------
// MEETINGS API
// ---------------------------
export const meetingsAPI = {
  getAll: async () => {
    const res = await api.get("/meetings");
    return Array.isArray(res.data) ? res.data : [];
  },

  getById: (id: string | number) => api.get(`/meetings/${id}`),

  getMyMeetings: async () => {
    const res = await api.get("/meetings");
    return Array.isArray(res.data) ? res.data : [];
  },

  create: (data: {
    title: string;
    description?: string;
    start_time: string;
    end_time?: string;
    location?: string;
    meeting_link?: string;
  }) => api.post("/meetings", data),

  update: (
    id: string | number,
    data: Partial<{
      title: string;
      description: string;
      start_time: string;
      end_time: string;
      location: string;
      meeting_link: string;
      status: "scheduled" | "in-progress" | "completed" | "cancelled";
    }>
  ) => api.put(`/meetings/${id}`, data),

  delete: (id: string | number) => api.delete(`/meetings/${id}`),

  addParticipant: (meetingId: string | number, userId: string | number) =>
    api.post(`/meetings/${meetingId}/participants`, { userId }),
};

// ---------------------------
// EXPORT AXIOS INSTANCE
// ---------------------------
export default api;