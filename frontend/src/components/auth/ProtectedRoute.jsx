import { Navigate } from "react-router-dom";
import { getUser } from "@/lib/auth-storage";

/**
 * Wrap a route element to require login (and optionally a specific role).
 * Usage: <Route path="/trainer" element={<ProtectedRoute allowedRoles={["Trainer"]}><TrainerHome /></ProtectedRoute>} />
 */
export function ProtectedRoute({ allowedRoles, children }) {
  const user = getUser();

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}