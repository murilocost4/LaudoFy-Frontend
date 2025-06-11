// src/components/RequireRole.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const RequireRole = ({ children, roles }) => {
  const { usuario } = useAuth();

  if (usuario && usuario.isAdminMaster) {
    if (!window.location.pathname.startsWith("/adminmaster")) {
      return <Navigate to="/adminmaster/dashboard" replace />;
    }
    return children;
  } else if (!usuario || !roles.includes(usuario.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default RequireRole;
