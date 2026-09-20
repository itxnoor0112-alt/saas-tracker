import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await login(form.email, form.password);
      navigate(location.state?.from?.pathname || "/workspaces", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Could not sign in");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-ink font-display text-sm font-semibold text-canvas">
            R
          </div>
          <span className="font-display text-xl font-semibold text-ink">Ridgeline</span>
        </div>

        <h1 className="mb-1 font-display text-2xl font-semibold text-ink">Welcome back</h1>
        <p className="mb-6 text-sm text-ink/60">Sign in to keep your team's work moving.</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <label className="label-field">Email</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="input-field"
              placeholder="you@company.com"
            />
          </div>
          <div>
            <label className="label-field">Password</label>
            <input
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="input-field"
              placeholder="••••••••"
            />
          </div>

          {error ? <p className="text-xs text-rust">{error}</p> : null}

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary mt-2 w-full"
          >
            {submitting ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-ink/60">
          Don't have an account?{" "}
          <Link to="/register" className="font-medium text-teal-dark hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
