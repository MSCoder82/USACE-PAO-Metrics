import { Navigate, useLocation, type Location } from "react-router-dom";
import Auth from "../components/Auth";
import { useAuth } from "../contexts/AuthProvider";

type RedirectState = {
  from?: Location;
};

export default function Register() {
  const { session, loading, supabaseEnabled } = useAuth();
  const location = useLocation();
  const redirectState = location.state as RedirectState | undefined;
  const redirectTo = redirectState?.from?.pathname ?? "/";

  if (supabaseEnabled && !loading && session) {
    return <Navigate to={redirectTo} replace />;
  }

  return <Auth initialMode="signUp" />;
}
