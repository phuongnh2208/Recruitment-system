import { Navigate, Outlet, useLocation } from "react-router-dom";

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

/**
 * ProtectedRoute component that guards routes based on authentication and roles.
 *
 * - If no token is found, redirects to /unauthorized (or login page).
 * - If allowedRoles is specified, checks if the user's role is included.
 * - If the user's role is not allowed, redirects to /forbidden.
 */
export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const location = useLocation();
  const token = localStorage.getItem("accessToken");
  const userRole = localStorage.getItem("userRole");

  // Not authenticated
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Role-specific check
  if (allowedRoles && allowedRoles.length > 0) {
    if (!userRole || !allowedRoles.includes(userRole)) {
      return <Navigate to="/forbidden" state={{ from: location }} replace />;
    }
  }

  // Authenticated and authorized
  return <Outlet />;
}
