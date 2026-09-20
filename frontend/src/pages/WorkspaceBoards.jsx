import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Plus, LayoutGrid } from "lucide-react";
import api from "../api/httpClient.js";
import AppShell from "../components/AppShell.jsx";
import { CardGridSkeleton } from "../components/Skeletons.jsx";

export default function WorkspaceBoards() {
  const { workspaceId } = useParams();
  const navigate = useNavigate();
  const [workspace, setWorkspace] = useState(null);
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", description: "" });
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    const [wsRes, boardsRes] = await Promise.all([
      api.get(`/workspaces/${workspaceId}`),
      api.get(`/workspaces/${workspaceId}/boards`),
    ]);
    setWorkspace(wsRes.data.data);
    setBoards(boardsRes.data.data.boards);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [workspaceId]);

  async function handleCreate(e) {
    e.preventDefault();
    setError("");
    try {
      await api.post(`/workspaces/${workspaceId}/boards`, form);
      setForm({ name: "", description: "" });
      setShowForm(false);
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Could not create board");
    }
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-4xl px-8 py-10">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-semibold text-ink">
              {workspace?.workspace?.name || "Workspace"}
            </h1>
            <p className="text-sm text-ink/60">
              {loading ? "Loading…" : `${boards.length} board${boards.length === 1 ? "" : "s"}`}
            </p>
          </div>
          <button
            onClick={() => setShowForm((v) => !v)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={16} />
            New board
          </button>
        </div>

        {showForm ? (
          <form onSubmit={handleCreate} className="card mb-8 flex flex-col gap-3 p-5">
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Board name, e.g. Q3 Launch"
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
        ) : boards.length === 0 ? (
          <div className="rounded-lg border border-dashed border-line py-16 text-center">
            <p className="text-sm text-ink/60">No boards yet. Create one to start tracking work.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {boards.map((b) => (
              <button
                key={b._id}
                onClick={() => navigate(`/workspaces/${workspaceId}/boards/${b._id}`)}
                className="card group flex items-start gap-3 p-5 text-left transition-colors hover:border-teal"
              >
                <div className="mt-0.5 rounded-md bg-teal-light p-2 text-teal-dark">
                  <LayoutGrid size={16} />
                </div>
                <div>
                  <h3 className="font-display text-base font-semibold text-ink">{b.name}</h3>
                  <p className="line-clamp-2 text-xs text-ink/60">{b.description || "No description"}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
