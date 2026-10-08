import axios from "axios";

export const TOKEN_KEY = "caketteToken";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
    "Cache-Control": "no-cache",
  },
});
let onUnauthorized: (() => void) | null = null;

export function setUnauthorizedHandler(handler: (() => void) | null) {
  onUnauthorized = handler;
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const url = String(error?.config?.url || "");
    const isAuthAttempt =
      url.includes("/auth/login") ||
      url.includes("/auth/register") ||
      url.includes("/auth/forgot-password") ||
      url.includes("/auth/reset-password") ||
      url.includes("/auth/logout");

    if (status === 401 && !isAuthAttempt) {
      localStorage.removeItem(TOKEN_KEY);
      onUnauthorized?.();
    }

    return Promise.reject(error);
  }
);

export const getApiError = (error: unknown, fallback = "Something went wrong. Please try again.") => {
  if (!axios.isAxiosError(error)) return fallback;
  if (error.code === "ECONNABORTED") return "Request timed out. Is the API running on port 8000?";
  if (error.code === "ERR_NETWORK") return "Cannot reach the API. Check that the server is running.";
  const message = error.response?.data?.message;
  return typeof message === "string" && message.trim() ? message : fallback;
};
