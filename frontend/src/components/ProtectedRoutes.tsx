import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.tsx";
import type { ReactNode } from "react";

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div
          className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full
                animate-spin"
        />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
