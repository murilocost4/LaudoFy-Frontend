import axios from "axios";

const API_BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://laudofy-backend-production.up.railway.app/api"
    : "http://localhost:3000/api";

// CSRF Service
const csrfService = {
  getToken: () => {
    return localStorage.getItem("csrfToken"); // ← seguro e funciona em mobile
  },

  refreshToken: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/csrf-token`, {
        withCredentials: true,
      });

      const token = response.data.csrfToken;
      localStorage.setItem("csrfToken", token); // ← armazena manualmente

      return token;
    } catch (error) {
      console.error("CSRF token refresh failed:", error);
      throw error;
    }
  },
};

// Axios Instance
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

// Request Interceptor
api.interceptors.request.use((config) => {
  // Skip CSRF for these endpoints
  const excludedEndpoints = [
    "/csrf-token",
    "/auth/login",
    "/auth/refresh-token",
    "/auth/logout",
  ];

  if (excludedEndpoints.some((ep) => config.url.includes(ep))) {
    return config;
  }

  // Add Authorization Bearer token for all protected requests
  const accessToken = localStorage.getItem("accessToken");
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  // Add CSRF token only for modifying requests (POST, PUT, PATCH, DELETE)
  if (
    ["post", "put", "patch", "delete"].includes(config.method.toLowerCase())
  ) {
    const token = csrfService.getToken();
    if (token) {
      config.headers["X-CSRF-Token"] = token;
    }
  }

  return config;
});

// Response Interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle CSRF token errors
    if (
      error.response?.status === 403 &&
      error.response.data?.error === "Invalid CSRF token" &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      try {
        const newToken = await csrfService.refreshToken();
        originalRequest.headers["X-CSRF-Token"] = newToken;
        return api(originalRequest);
      } catch (refreshError) {
        console.error("Failed to refresh CSRF token:", refreshError);
        // Don't redirect for CSRF errors, just let the request fail
        return Promise.reject(error);
      }
    }

    // Handle JWT token errors (401 Unauthorized)
    if (error.response?.status === 401 && !originalRequest._retry) {
      console.warn("Authentication failed - clearing tokens and redirecting to login");
      // Clear invalid tokens and redirect to login
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("userInfo");
      localStorage.removeItem("csrfToken");
      
      // Only redirect if not already on login page
      if (!window.location.pathname.includes('/login')) {
        window.location.href = "/login?error=session_expired";
      }
      return Promise.reject(error);
    }
    
    return Promise.reject(error);
  },
);

export const initializeCSRF = async () => {
  try {
    await csrfService.refreshToken();
  } catch (error) {
    console.error("CSRF initialization failed:", error);
    throw error;
  }
};

export default api;
