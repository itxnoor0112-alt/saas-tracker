import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, ArrowRight } from "lucide-react";
import api from "../api/httpClient.js";
import AppShell from "../components/AppShell.jsx";
import { CardGridSkeleton } from "../components/Skeletons.jsx";

export default function Workspaces() {
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", description: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function load() {
    setLoading(true);
    const { data } = await api.get("/workspaces");
    setWorkspaces(data.data.workspaces);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(e) {
    e.preventDefault();
    setError("");
    try {
      const { data } = await api.post("/workspaces", form);
      setShowForm(false);
      setForm({ name: "", description: "" });
      navigate(`/workspaces/${data.data.workspace._id}`);
    } catch (err) {
      setError(err.response?.data?.message || "Could not create workspace");
    }
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-4xl px-8 py-10">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-semibold text-ink">Workspaces</h1>
            <p className="text-sm text-ink/60">Pick up where your team left off.</p>
          </div>
          <button
            onClick={() => setShowForm((v) => !v)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={16} />
            New workspace
          </button>
        </div>

        {showForm ? (
          <form onSubmit={handleCreate} className="card mb-8 flex flex-col gap-3 p-5">
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Workspace name"
              className="input-field"
            />
            <input
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Description (optional)"
              className="input-field"
            />
            {error ? <p className="text-xs text-rust">{error}</p> : null}
            <div className="flex gap-2">
              <button type="submit" className="btn-secondary">
                Create
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-ghost">
                Cancel
              </button>
            </div>
          </form>
        ) : null}

        {loading ? (
          <CardGridSkeleton count={4} />
        ) : workspaces.length === 0 ? (
          <div className="rounded-lg border border-dashed border-line py-16 text-center">
            <p className="text-sm text-ink/60">No workspaces yet. Create one to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {workspaces.map((w) => (
              <button
                key={w._id}
                onClick={() => navigate(`/workspaces/${w._id}`)}
                className="card group flex flex-col items-start p-5 text-left transition-colors hover:border-teal"
              >
                <h3 className="mb-1 font-display text-base font-semibold text-ink">{w.name}</h3>
                <p className="mb-4 line-clamp-2 text-xs text-ink/60">
                  {w.description || "No description"}
                </p>
                <span className="mt-auto flex items-center gap-1 text-xs font-medium text-teal-dark">
                  Open workspace
                  <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
