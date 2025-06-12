import axios from "axios";

const API_BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://laudofy-backend-production.up.railway.app/api"
    : "http://localhost:3000/api";

// CSRF Service
const csrfService = {
  getToken: () => {
    const token = localStorage.getItem("csrfToken");
    console.log("CSRF Service - getToken:", token ? "Token encontrado" : "Token não encontrado");
    return token;
  },

  refreshToken: async () => {
    try {
      console.log("CSRF Service - Solicitando novo token...");
      const response = await axios.get(`${API_BASE_URL}/csrf-token`, {
        withCredentials: true,
      });

      const token = response.data.csrfToken;
      localStorage.setItem("csrfToken", token);
      console.log("CSRF Service - Novo token obtido e armazenado");

      return token;
    } catch (error) {
      console.error("CSRF Service - Falha ao obter token:", error);
      throw error;
    }
  },

  clearToken: () => {
    localStorage.removeItem("csrfToken");
    console.log("CSRF Service - Token removido");
  }
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
api.interceptors.request.use(async (config) => {
  // Skip CSRF for these endpoints
  const excludedEndpoints = [
    "/csrf-token",
    "/auth/login",
    "/auth/refresh-token",
    "/auth/logout",
  ];

  if (excludedEndpoints.some((ep) => config.url.includes(ep))) {
    console.log(`API Request - Endpoint excluído do CSRF: ${config.method.toUpperCase()} ${config.url}`);
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
    console.log(`API Request - Método ${config.method.toUpperCase()} requer CSRF token`);
    let token = csrfService.getToken();
    
    // **SE NÃO TEM TOKEN CSRF, OBTER UM NOVO**
    if (!token) {
      console.log("API Request - Não há CSRF token, obtendo um novo...");
      try {
        token = await csrfService.refreshToken();
        console.log("API Request - CSRF token obtido com sucesso");
      } catch (error) {
        console.warn("API Request - Falha ao obter CSRF token:", error);
      }
    }
    
    if (token) {
      config.headers["X-CSRF-Token"] = token;
      console.log(`API Request - CSRF token adicionado ao header: ${config.method.toUpperCase()} ${config.url}`);
    } else {
      console.warn(`API Request - Nenhum CSRF token disponível para: ${config.method.toUpperCase()} ${config.url}`);
    }
  }

  return config;
});

// Response Interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle CSRF token errors (múltiplas variações)
    const isCsrfError = error.response?.status === 403 && (
      error.response.data?.error === "Invalid CSRF token" ||
      error.response.data?.code === "EBADCSRFTOKEN" ||
      error.response.data?.error?.includes("CSRF") ||
      error.response.data?.message?.includes("csrf")
    );

    if (isCsrfError && !originalRequest._retry) {
      originalRequest._retry = true;
      console.log("CSRF token inválido, tentando renovar...");
      
      try {
        // Limpar token antigo
        localStorage.removeItem("csrfToken");
        
        // Obter novo token
        const newToken = await csrfService.refreshToken();
        originalRequest.headers["X-CSRF-Token"] = newToken;
        
        console.log("CSRF token renovado, reexecutando requisição...");
        return api(originalRequest);
      } catch (refreshError) {
        console.error("Falha ao renovar CSRF token:", refreshError);
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
