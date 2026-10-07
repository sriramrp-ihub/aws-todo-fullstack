import axios from "axios";
import type {
  User,
  Todo,
  AuthResponse,
  RegisterData,
  LoginData,
} from "@/types/index";

// Create axios instance with base
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authApi = {
  login: async (credentials: LoginData): Promise<AuthResponse> => {
    const response = await api.post("/auth/login", credentials);
    return response.data;
  },

  register: async (userData: RegisterData): Promise<AuthResponse> => {
    const response = await api.post("/auth/register", userData);
    return response.data;
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await api.get("/auth/me");
    return response.data;
  },

  logout: async (): Promise<void> => {
    await api.post("/auth/logout");
  },
};

// Todos API
export const todosApi = {
  getAll: async (): Promise<Todo[]> => {
    const response = await api.get<{ todos: Todo[] }>("/todos");
    return response.data.todos;
  },

  create: async (todoData: {
    title: string;
    description?: string;
  }): Promise<Todo> => {
    const response = await api.post<{ todo: Todo }>("/todos", todoData);
    return response.data.todo;
  },

  update: async (id: string, data: Partial<Todo>): Promise<Todo> => {
    const response = await api.put<{ todo: Todo }>(`/todos/${id}`, data);
    return response.data.todo;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/todos/${id}`);
  },
};

export default api;
