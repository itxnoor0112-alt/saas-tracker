import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await register(form.name, form.email, form.password);
      navigate("/workspaces", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Could not create account");
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

        <h1 className="mb-1 font-display text-2xl font-semibold text-ink">Create your account</h1>
        <p className="mb-6 text-sm text-ink/60">Set up a workspace for your team in minutes.</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <label className="label-field">Full name</label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="input-field"
              placeholder="Alex Rivera"
            />
          </div>
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
              minLength={8}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="input-field"
              placeholder="At least 8 characters"
            />
          </div>

          {error ? <p className="text-xs text-rust">{error}</p> : null}

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary mt-2 w-full"
          >
            {submitting ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-ink/60">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-teal-dark hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
