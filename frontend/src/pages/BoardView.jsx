import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Plus, ChevronLeft, Search, Pencil, Trash2 } from "lucide-react";
import api from "../api/httpClient.js";
import AppShell from "../components/AppShell.jsx";
import TaskCard from "../components/TaskCard.jsx";
import TaskFormModal from "../components/TaskFormModal.jsx";
import { BoardSkeleton } from "../components/Skeletons.jsx";

const columns = [
  { key: "todo", label: "To do" },
  { key: "in-progress", label: "In progress" },
  { key: "review", label: "In review" },
  { key: "done", label: "Done" },
];

export default function BoardView() {
  const { workspaceId, boardId } = useParams();
  const navigate = useNavigate();
  const [board, setBoard] = useState(null);
  const [role, setRole] = useState("member");
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const [filters, setFilters] = useState({ search: "", priority: "" });
  const debounceRef = useRef(null);

  const [editingBoard, setEditingBoard] = useState(false);
  const [boardForm, setBoardForm] = useState({ name: "", description: "" });
  const [boardError, setBoardError] = useState("");

  const loadBoardAndMembers = useCallback(async () => {
    const [boardRes, wsRes] = await Promise.all([
      api.get(`/workspaces/${workspaceId}/boards/${boardId}`),
      api.get(`/workspaces/${workspaceId}`),
    ]);
    setBoard(boardRes.data.data.board);
    setRole(wsRes.data.data.role);
    setMembers(wsRes.data.data.workspace.members);
  }, [workspaceId, boardId]);

  const loadTasks = useCallback(async () => {
    const { data } = await api.get(`/workspaces/${workspaceId}/boards/${boardId}/tasks`, {
      params: { search: filters.search, priority: filters.priority, limit: 100 },
    });
    setTasks(data.data.tasks);
  }, [workspaceId, boardId, filters]);

  useEffect(() => {
    setLoading(true);
    Promise.all([loadBoardAndMembers(), loadTasks()]).finally(() => setLoading(false));
  }, [loadBoardAndMembers, loadTasks]);

  function handleSearchChange(value) {
    setSearchInput(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setFilters((prev) => ({ ...prev, search: value }));
    }, 400);
  }

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const columnTasks = useMemo(() => {
    const grouped = { todo: [], "in-progress": [], review: [], done: [] };
    for (const task of tasks) {
      if (grouped[task.status]) grouped[task.status].push(task);
    }
    return grouped;
  }, [tasks]);

  async function handleCreateTask(payload) {
    const { data } = await api.post(`/workspaces/${workspaceId}/boards/${boardId}/tasks`, payload);
    setTasks((prev) => [data.data.task, ...prev]);
  }

  async function handleUpdateTask(payload) {
    const { data } = await api.patch(`/workspaces/${workspaceId}/tasks/${editingTask._id}`, payload);
    setTasks((prev) => prev.map((t) => (t._id === editingTask._id ? data.data.task : t)));
  }

  async function handleStatusChange(taskId, status) {
    setTasks((prev) => prev.map((t) => (t._id === taskId ? { ...t, status } : t)));
    await api.patch(`/workspaces/${workspaceId}/tasks/${taskId}`, { status });
  }

  async function handleDelete(taskId) {
    setTasks((prev) => prev.filter((t) => t._id !== taskId));
    await api.delete(`/workspaces/${workspaceId}/tasks/${taskId}`);
  }

  function startEditingBoard() {
    setBoardForm({ name: board.name, description: board.description || "" });
    setBoardError("");
    setEditingBoard(true);
  }

  async function handleRenameBoard(e) {
    e.preventDefault();
    setBoardError("");
    try {
      const { data } = await api.patch(`/workspaces/${workspaceId}/boards/${boardId}`, boardForm);
      setBoard(data.data.board);
      setEditingBoard(false);
    } catch (err) {
      setBoardError(err.response?.data?.message || "Could not rename board");
    }
  }

  async function handleDeleteBoard() {
    const confirmed = window.confirm(
      `Delete "${board.name}"? This removes all its tasks permanently.`
    );
    if (!confirmed) return;
    try {
      await api.delete(`/workspaces/${workspaceId}/boards/${boardId}`);
      navigate(`/workspaces/${workspaceId}`);
    } catch (err) {
      alert(err.response?.data?.message || "Could not delete board");
    }
  }

  return (
    <AppShell>
      <div className="px-8 py-10">
        <Link
          to={`/workspaces/${workspaceId}`}
          className="mb-4 flex items-center gap-1 text-xs font-medium text-ink/50 hover:text-ink"
        >
          <ChevronLeft size={14} />
          All boards
        </Link>

        {editingBoard ? (
          <form onSubmit={handleRenameBoard} className="card mb-6 flex flex-col gap-3 p-5">
            <input
              required
              value={boardForm.name}
              onChange={(e) => setBoardForm({ ...boardForm, name: e.target.value })}
              className="input-field"
            />
            <input
              value={boardForm.description}
              onChange={(e) => setBoardForm({ ...boardForm, description: e.target.value })}
              placeholder="Description (optional)"
              className="input-field"
            />
            {boardError ? <p className="text-xs text-rust">{boardError}</p> : null}
            <div className="flex gap-2">
              <button type="submit" className="btn-secondary">
                Save
              </button>
              <button type="button" onClick={() => setEditingBoard(false)} className="btn-ghost">
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="font-display text-2xl font-semibold text-ink">{board?.name}</h1>
              <p className="text-sm text-ink/60">{board?.description || "No description"}</p>
            </div>
            <div className="flex items-center gap-2">
              {role === "admin" ? (
                <>
                  <button
                    onClick={startEditingBoard}
                    className="flex items-center gap-1 rounded-md px-3 py-2 text-sm text-ink/60 hover:bg-ink/5 hover:text-ink"
                  >
                    <Pencil size={15} />
                    Rename
                  </button>
                  <button
                    onClick={handleDeleteBoard}
                    className="flex items-center gap-1 rounded-md px-3 py-2 text-sm text-ink/60 hover:bg-rust-light hover:text-rust"
                  >
                    <Trash2 size={15} />
                    Delete
                  </button>
                </>
              ) : null}
              <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
                <Plus size={16} />
                New task
              </button>
            </div>
          </div>
        )}

        <div className="mb-6 flex flex-wrap items-center gap-3">
          <div className="relative w-full max-w-xs">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/40" />
            <input
              value={searchInput}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search tasks…"
              className="input-field pl-9"
            />
          </div>
          <select
            value={filters.priority}
            onChange={(e) => setFilters((prev) => ({ ...prev, priority: e.target.value }))}
            className="input-field w-auto"
          >
            <option value="">All priorities</option>
            <option value="low">Low priority</option>
            <option value="medium">Medium priority</option>
            <option value="high">High priority</option>
          </select>
        </div>

        {loading ? (
          <BoardSkeleton />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {columns.map((col) => (
              <div key={col.key} className="flex flex-col">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-ink">{col.label}</h2>
                  <span className="rounded-full bg-ink/5 px-2 py-0.5 text-xs text-ink/50">
                    {columnTasks[col.key].length}
                  </span>
                </div>
                <div className="flex min-h-[120px] flex-col gap-3 rounded-lg bg-ink/[0.03] p-2">
                  {columnTasks[col.key].map((task) => (
                    <TaskCard
                      key={task._id}
                      task={task}
                      onStatusChange={handleStatusChange}
                      onDelete={handleDelete}
                      onEdit={setEditingTask}
                    />
                  ))}
                  {columnTasks[col.key].length === 0 ? (
                    <p className="px-2 py-4 text-center text-xs text-ink/30">No tasks</p>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal ? (
        <TaskFormModal
          members={members}
          onClose={() => setShowModal(false)}
          onSubmit={handleCreateTask}
        />
      ) : null}

      {editingTask ? (
        <TaskFormModal
          members={members}
          task={editingTask}
          onClose={() => setEditingTask(null)}
          onSubmit={handleUpdateTask}
        />
      ) : null}
    </AppShell>
  );
}
