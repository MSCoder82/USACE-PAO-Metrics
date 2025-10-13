import { FormEvent, useMemo, useState } from "react";
import {
  Navigate,
  useLocation,
  useNavigate,
  type Location,
} from "react-router-dom";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../lib/firebase";
import { useAuth } from "../contexts/AuthProvider";
import { UsaceLogoIcon } from "./Icons";

type Mode = "login" | "register";

type AuthCardProps = {
  initialMode: Mode;
};

type RedirectState = {
  from?: Location;
};

export default function AuthCard({ initialMode }: AuthCardProps) {
  const { user, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const redirectState = location.state as RedirectState | undefined;
  const redirectTo = redirectState?.from?.pathname ?? "/";

  const [mode, setMode] = useState<Mode>(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!loading && user) {
    return <Navigate to={redirectTo} replace />;
  }

  const toggleLabel = useMemo(
    () => (mode === "login" ? "Sign up" : "Sign in"),
    [mode],
  );

  const toggleDescription = useMemo(
    () => (mode === "login" ? "Need an account?" : "Already have an account?"),
    [mode],
  );

  const headline = useMemo(
    () => (mode === "login" ? "Welcome back" : "Create an account"),
    [mode],
  );

  const subhead = useMemo(
    () =>
      mode === "login"
        ? "Sign in with your credentials to access the dashboard."
        : "Register with your work email to get started.",
    [mode],
  );

  const submitLabel = useMemo(
    () => (mode === "login" ? "Sign in" : "Create account"),
    [mode],
  );

  const submittingLabel = useMemo(
    () => (mode === "login" ? "Signing in…" : "Creating account…"),
    [mode],
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (mode === "register" && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    try {
      if (mode === "login") {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
        navigate(redirectTo, { replace: true, state: redirectState });
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = () => {
    const nextMode: Mode = mode === "login" ? "register" : "login";
    setMode(nextMode);
    setError(null);
    setPassword("");
    setConfirmPassword("");
    navigate(nextMode === "login" ? "/login" : "/register", {
      replace: true,
      state: redirectState,
    });
  };

  return (
    <div className="relative min-h-screen">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-white/70 via-white/30 to-navy-100/30 dark:from-navy-950 dark:via-navy-950/80 dark:to-navy-900" />
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
        <div className="glass-panel w-full max-w-md space-y-8 md:p-10">
          <div className="space-y-4 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-usace-red/20 to-usace-blue/20 text-usace-blue">
              <UsaceLogoIcon className="h-8 w-8" />
            </div>
            <div className="space-y-1">
              <h1 className="text-3xl font-semibold text-navy-900 dark:text-white">{headline}</h1>
              <p className="text-sm text-navy-600 dark:text-navy-200">{subhead}</p>
            </div>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="space-y-2 text-left">
                <label className="text-xs font-semibold uppercase tracking-wide text-navy-500 dark:text-navy-200" htmlFor="email">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="name@usace.army.mil"
                  className="input-modern"
                />
              </div>

              <div className="space-y-2 text-left">
                <label className="text-xs font-semibold uppercase tracking-wide text-navy-500 dark:text-navy-200" htmlFor="password">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  placeholder="••••••••"
                  className="input-modern"
                />
              </div>

              {mode === "register" ? (
                <div className="space-y-2 text-left">
                  <label className="text-xs font-semibold uppercase tracking-wide text-navy-500 dark:text-navy-200" htmlFor="confirm-password">
                    Confirm password
                  </label>
                  <input
                    id="confirm-password"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    autoComplete="new-password"
                    placeholder="••••••••"
                    className="input-modern"
                  />
                </div>
              ) : null}
            </div>

            {error ? (
              <p className="rounded-xl border border-usace-red/40 bg-usace-red/10 p-3 text-sm text-usace-red" role="alert">
                {error}
              </p>
            ) : null}

            <div className="space-y-3">
              <button type="submit" disabled={submitting} className="surface-button w-full justify-center text-base disabled:cursor-not-allowed disabled:opacity-60">
                {submitting ? submittingLabel : submitLabel}
              </button>
              <p className="text-center text-sm text-navy-600 dark:text-navy-200">
                {toggleDescription}{" "}
                <button
                  type="button"
                  onClick={handleToggle}
                  className="font-semibold text-usace-blue hover:text-usace-red"
                >
                  {toggleLabel}
                </button>
              </p>
            </div>
          </form>

          <p className="text-center text-xs text-navy-400 dark:text-navy-300">
            Need help?{" "}
            <a
              href="mailto:pa.support@usace.mil"
              className="font-semibold text-usace-blue hover:text-usace-red"
            >
              Contact the PAO support team
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
