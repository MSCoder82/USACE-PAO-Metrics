import { FormEvent, useState } from "react";
import { Navigate, useLocation, type Location } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../lib/firebase";
import { useAuth } from "../contexts/AuthProvider";

export default function Login() {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const redirectState = location.state as { from?: Location } | undefined;
  const redirectTo = redirectState?.from?.pathname ?? "/";

  if (!loading && user) {
    return <Navigate to={redirectTo} replace />;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to sign in. Please try again.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-navy-50 p-6 dark:bg-navy-900">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm space-y-6 rounded-2xl bg-white p-8 shadow-xl dark:bg-navy-800"
      >
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold text-navy-900 dark:text-white">Sign in</h1>
          <p className="text-sm text-navy-600 dark:text-navy-200">
            Enter your credentials to access the dashboard.
          </p>
        </div>

        <div className="space-y-4">
          <label className="block text-left text-sm font-medium text-navy-700 dark:text-navy-100">
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-1 w-full rounded-lg border border-navy-200 px-3 py-2 focus:border-usace-blue focus:outline-none focus:ring-2 focus:ring-usace-blue dark:border-navy-600 dark:bg-navy-900 dark:text-navy-100"
              required
              autoComplete="email"
            />
          </label>

          <label className="block text-left text-sm font-medium text-navy-700 dark:text-navy-100">
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-1 w-full rounded-lg border border-navy-200 px-3 py-2 focus:border-usace-blue focus:outline-none focus:ring-2 focus:ring-usace-blue dark:border-navy-600 dark:bg-navy-900 dark:text-navy-100"
              required
              autoComplete="current-password"
            />
          </label>
        </div>

        {error ? (
          <p className="text-sm text-usace-red" role="alert">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-usace-blue px-4 py-2 text-white transition hover:bg-usace-red disabled:cursor-not-allowed disabled:opacity-70"
        >
          {submitting ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
