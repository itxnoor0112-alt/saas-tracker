import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import api from "../api/httpClient.js";
import AppShell from "../components/AppShell.jsx";
import { CardGridSkeleton } from "../components/Skeletons.jsx";

const STATUS_COLORS = {
  todo: "#9AA0A6",
  "in-progress": "#2F6F6B",
  review: "#E0932F",
  done: "#3F8F5F",
};

const PRIORITY_COLORS = {
  low: "#2F6F6B",
  medium: "#E0932F",
  high: "#B4523C",
};

function StatCard({ label, value }) {
  return (
    <div className="rounded-lg border border-line bg-panel p-5">
      <p className="mb-1 text-xs font-medium text-ink/50">{label}</p>
      <p className="font-display text-3xl font-semibold text-ink">{value}</p>
    </div>
  );
}

export default function Analytics() {
  const { workspaceId } = useParams();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/workspaces/${workspaceId}/analytics`).then(({ data }) => {
      setAnalytics(data.data.analytics);
      setLoading(false);
    });
  }, [workspaceId]);

  const statusData = useMemo(
    () => (analytics ? analytics.byStatus.map((s) => ({ name: s.status, value: s.count })) : []),
    [analytics]
  );
  const memberData = useMemo(
    () =>
      analytics
        ? analytics.byMember.map((m) => ({ name: m.name, total: m.total, done: m.done }))
        : [],
    [analytics]
  );

  if (loading) {
    return (
      <AppShell>
        <div className="mx-auto max-w-5xl px-8 py-10">
          <CardGridSkeleton count={4} />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl px-8 py-10">
        <h1 className="mb-1 font-display text-2xl font-semibold text-ink">Analytics</h1>
        <p className="mb-8 text-sm text-ink/60">A live snapshot of how work is moving.</p>

        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard label="Total tasks" value={analytics.totalTasks} />
          <StatCard label="Completion rate" value={`${analytics.completionRate}%`} />
          <StatCard
            label="In progress"
            value={analytics.byStatus.find((s) => s.status === "in-progress")?.count || 0}
          />
          <StatCard
            label="High priority"
            value={analytics.byPriority.find((p) => p.priority === "high")?.count || 0}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="rounded-lg border border-line bg-panel p-5">
            <h2 className="mb-4 text-sm font-semibold text-ink">Tasks by status</h2>
            {statusData.length === 0 ? (
              <p className="py-10 text-center text-xs text-ink/40">No tasks yet</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80}>
                    {statusData.map((entry) => (
                      <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || "#9AA0A6"} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
            <div className="mt-3 flex flex-wrap gap-3">
              {statusData.map((s) => (
                <span key={s.name} className="flex items-center gap-1.5 text-xs text-ink/60">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: STATUS_COLORS[s.name] || "#9AA0A6" }}
                  />
                  {s.name} · {s.value}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-line bg-panel p-5">
            <h2 className="mb-4 text-sm font-semibold text-ink">Workload by member</h2>
            {memberData.length === 0 ? (
              <p className="py-10 text-center text-xs text-ink/40">No assigned tasks yet</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={memberData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E4E1D8" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="total" fill="#E4EFEE" radius={[4, 4, 0, 0]} name="Assigned" />
                  <Bar dataKey="done" fill="#2F6F6B" radius={[4, 4, 0, 0]} name="Completed" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="mt-4 rounded-lg border border-line bg-panel p-5">
          <h2 className="mb-4 text-sm font-semibold text-ink">Boards overview</h2>
          {analytics.byBoard.length === 0 ? (
            <p className="text-xs text-ink/40">No boards with tasks yet</p>
          ) : (
            <div className="flex flex-col gap-3">
              {analytics.byBoard.map((b) => (
                <div key={b.boardId} className="flex items-center gap-3">
                  <span className="w-32 shrink-0 truncate text-xs font-medium text-ink">{b.name}</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-ink/5">
                    <div
                      className="h-full bg-teal"
                      style={{ width: `${b.total === 0 ? 0 : Math.round((b.done / b.total) * 100)}%` }}
                    />
                  </div>
                  <span className="w-16 shrink-0 text-right text-xs text-ink/50">
                    {b.done}/{b.total}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
