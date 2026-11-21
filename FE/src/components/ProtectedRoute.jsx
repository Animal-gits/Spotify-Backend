import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div className="screen-loader"><span className="brand-mark" />Loading Pavi…</div>;
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  return <Outlet />;
}

export function RoleRoute({ role }) {
  const { user } = useAuth();
  if (user?.role !== role) {
    return <Navigate to={user?.role === "artist" ? "/artist" : "/home"} replace />;
  }
  return <Outlet />;
}
