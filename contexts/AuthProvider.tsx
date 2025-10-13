import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase, isSupabaseConfigured, supabaseConfigurationError } from "../lib/supabase";

interface AuthContextValue {
  session: Session | null;
  loading: boolean;
  supabaseEnabled: boolean;
}

const AuthContext = createContext<AuthContextValue>({
  session: null,
  loading: true,
  supabaseEnabled: false,
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const supabaseEnabled = isSupabaseConfigured && supabaseConfigurationError === null;
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(supabaseEnabled);

  useEffect(() => {
    let isMounted = true;

    if (!supabaseEnabled) {
      setSession(null);
      setLoading(false);
      return () => {
        isMounted = false;
      };
    }

    const loadSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (!isMounted) return;
        if (error) {
          console.error("Failed to retrieve Supabase session", error);
        }
        setSession(data?.session ?? null);
      } catch (error) {
        if (isMounted) {
          console.error("Unexpected error while retrieving Supabase session", error);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    setLoading(true);
    void loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (!isMounted) return;
      setSession(newSession ?? null);
      setLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [supabaseEnabled]);

  const value = useMemo(
    () => ({ session, loading, supabaseEnabled }),
    [session, loading, supabaseEnabled],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
