// src/contexts/AuthContext.js
import React, { createContext, useContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import api from "../api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    accessToken: localStorage.getItem("accessToken") || null,
    refreshToken: localStorage.getItem("refreshToken") || null,
    csrfToken: localStorage.getItem("csrfToken") || null,
    usuario: null,
    tenant_id: null,
    isAdminMaster: false,
    permissaoFinanceiro: false,
  });

  const navigate = useNavigate();

  // Decodifica o token e atualiza o estado do usuário
  const updateUserFromToken = (token) => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setAuthState((prev) => ({
          ...prev,
          usuario: decoded,
          tenant_id: decoded.tenant_id,
          isAdminMaster: decoded.isAdminMaster,
          permissaoFinanceiro: decoded.permissaoFinanceiro || false,
        }));
      } catch (error) {
        logout();
      }
    }
  };

  // Armazena o token CSRF
  const setCsrfToken = (token) => {
    localStorage.setItem("csrfToken", token);
    setAuthState((prev) => ({ ...prev, csrfToken: token }));
  };

  // **FUNÇÃO PARA GARANTIR QUE TEMOS UM CSRF TOKEN VÁLIDO**
  const ensureCsrfToken = async () => {
    const currentToken = localStorage.getItem("csrfToken");
    if (currentToken) {
      return currentToken;
    }

    try {
      const response = await api.get("/csrf-token");
      const newToken = response.data.csrfToken;
      localStorage.setItem("csrfToken", newToken);
      setAuthState((prev) => ({ ...prev, csrfToken: newToken }));
      return newToken;
    } catch (error) {
      console.error("Falha ao obter CSRF token:", error);
      throw error;
    }
  };

  // Efeito para decodificar o token ao carregar
  useEffect(() => {
    if (authState.accessToken) {
      api.defaults.headers.common["Authorization"] =
        `Bearer ${authState.accessToken}`;
      updateUserFromToken(authState.accessToken);
      
      // **SE NÃO TEM CSRF TOKEN, OBTER UM**
      if (!authState.csrfToken) {
        api.get("/csrf-token")
          .then(response => {
            const csrfToken = response.data.csrfToken;
            localStorage.setItem("csrfToken", csrfToken);
            setAuthState((prev) => ({ ...prev, csrfToken }));
          })
          .catch(error => {
            console.warn("Falha ao obter CSRF token no carregamento:", error);
          });
      }
    }
  }, [authState.accessToken]);

  // Função de login: armazena ambos os tokens
  const login = async (accessToken, refreshToken) => {
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);

    // Setar Authorization globalmente
    api.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;

    setAuthState((prev) => ({
      ...prev,
      accessToken,
      refreshToken,
      usuario: null,
      tenant_id: null,
      isAdminMaster: false,
      permissaoFinanceiro: false,
    }));
    updateUserFromToken(accessToken);

    // **OBTER CSRF TOKEN AUTOMATICAMENTE APÓS LOGIN**
    try {
      const csrfResponse = await api.get("/csrf-token");
      const csrfToken = csrfResponse.data.csrfToken;
      localStorage.setItem("csrfToken", csrfToken);
      setAuthState((prev) => ({ ...prev, csrfToken }));
    } catch (error) {
      console.warn("Falha ao obter CSRF token após login:", error);
    }

    // Redirect based on role
    const decoded = jwtDecode(accessToken);
    if (decoded.isAdminMaster) {
      navigate("/adminmaster/dashboard");
    } else {
      navigate("/dashboard");
    }
  };

  const logout = () => {
    // Limpa todos os tokens
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("csrfToken");
    setAuthState({
      accessToken: null,
      refreshToken: null,
      csrfToken: null,
      usuario: null,
      tenant_id: null,
      isAdminMaster: false,
      permissaoFinanceiro: false,
    });
    navigate("/");
  };

  // Verifica se o usuário está autenticado
  const isAuthenticated = () => {
    if (!authState.accessToken) return false;

    try {
      const decoded = jwtDecode(authState.accessToken);
      return decoded.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        setCsrfToken,
        ensureCsrfToken,
        login,
        logout,
        isAuthenticated,
        tenant_id: authState.tenant_id,
        isAdminMaster: authState.isAdminMaster,
        permissaoFinanceiro: authState.permissaoFinanceiro,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
};
