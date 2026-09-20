import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { UserPlus, Shield } from "lucide-react";
import api from "../api/httpClient.js";
import AppShell from "../components/AppShell.jsx";
import { ListSkeleton } from "../components/Skeletons.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function Members() {
  const { workspaceId } = useParams();
  const { user } = useAuth();
  const [workspace, setWorkspace] = useState(null);
  const [role, setRole] = useState("member");
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function load() {
    setLoading(true);
    const { data } = await api.get(`/workspaces/${workspaceId}`);
    setWorkspace(data.data.workspace);
    setRole(data.data.role);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [workspaceId]);

  async function handleInvite(e) {
    e.preventDefault();
    setError("");
    setMessage("");
    try {
      await api.post(`/workspaces/${workspaceId}/invite`, { email: inviteEmail });
      setInviteEmail("");
      setMessage("Member added to the workspace");
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Could not invite member");
    }
  }

  async function handleRoleChange(memberId, newRole) {
    await api.patch(`/workspaces/${workspaceId}/members/${memberId}`, { role: newRole });
    load();
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl px-8 py-10">
        <h1 className="mb-1 font-display text-2xl font-semibold text-ink">Members</h1>
        <p className="mb-8 text-sm text-ink/60">
          {loading ? "Loading…" : `${workspace.members.length} member${workspace.members.length === 1 ? "" : "s"} in this workspace`}
        </p>

        {!loading && role === "admin" ? (
          <form onSubmit={handleInvite} className="mb-8 flex gap-2">
            <input
              type="email"
              required
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="teammate@company.com"
              className="input-field flex-1"
            />
            <button type="submit" className="btn-primary flex items-center gap-2">
              <UserPlus size={16} />
              Invite
            </button>
          </form>
        ) : null}

        {error ? <p className="mb-4 text-xs text-rust">{error}</p> : null}
        {message ? <p className="mb-4 text-xs text-teal-dark">{message}</p> : null}

        {loading ? (
          <ListSkeleton rows={4} />
        ) : (
          <div className="card flex flex-col divide-y divide-line">
            {workspace.members.map((m) => (
              <div key={m.user._id} className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold text-white"
                    style={{ backgroundColor: m.user.avatarColor || "#2F6F6B" }}
                  >
                    {m.user.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-ink">{m.user.name}</p>
                    <p className="text-xs text-ink/50">{m.user.email}</p>
                  </div>
                </div>

                {role === "admin" && m.user._id !== user.id ? (
                  <select
                    value={m.role}
                    onChange={(e) => handleRoleChange(m.user._id, e.target.value)}
                    className="rounded-md border border-line bg-panel px-2 py-1 text-xs font-medium text-ink outline-none focus-visible:border-teal"
                  >
                    <option value="member">Member</option>
                    <option value="admin">Admin</option>
                  </select>
                ) : (
                  <span className="flex items-center gap-1 text-xs font-medium text-ink/50">
                    {m.role === "admin" ? <Shield size={13} /> : null}
                    {m.role === "admin" ? "Admin" : "Member"}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
