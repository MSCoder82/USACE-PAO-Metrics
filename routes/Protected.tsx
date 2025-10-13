import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthProvider";

export default function Protected() {
  const { session, loading, supabaseEnabled } = useAuth();
  const location = useLocation();

  if (!supabaseEnabled) {
    return <Outlet />;
  }

  if (loading) {
    return <div className="p-6">Loading…</div>;
  }

  if (!session) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
