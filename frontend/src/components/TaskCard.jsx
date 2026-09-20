import { Trash2 } from "lucide-react";
import PriorityBadge from "./PriorityBadge.jsx";

const statusOrder = ["todo", "in-progress", "review", "done"];
const statusLabels = {
  todo: "To do",
  "in-progress": "In progress",
  review: "In review",
  done: "Done",
};

export default function TaskCard({ task, onStatusChange, onDelete }) {
  return (
    <div className="card p-3 shadow-sm">
      <div className="mb-2 flex items-start justify-between gap-2">
        <p className="text-sm font-medium leading-snug text-ink">{task.title}</p>
        <button
          onClick={() => onDelete(task._id)}
          className="shrink-0 text-ink/30 transition-colors hover:text-rust"
          aria-label="Delete task"
        >
          <Trash2 size={15} />
        </button>
      </div>

      {task.description ? (
        <p className="mb-3 line-clamp-2 text-xs text-ink/60">{task.description}</p>
      ) : null}

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <PriorityBadge priority={task.priority} />
        {task.assignee ? (
          <span className="flex items-center gap-1 text-xs text-ink/60">
            <span
              className="flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-semibold text-white"
              style={{ backgroundColor: task.assignee.avatarColor || "#2F6F6B" }}
            >
              {task.assignee.name?.charAt(0)?.toUpperCase()}
            </span>
            {task.assignee.name}
          </span>
        ) : (
          <span className="text-xs text-ink/40">Unassigned</span>
        )}
        {task.dueDate ? (
          <span className="text-xs text-ink/40">
            Due {new Date(task.dueDate).toLocaleDateString()}
          </span>
        ) : null}
      </div>

      <select
        value={task.status}
        onChange={(e) => onStatusChange(task._id, e.target.value)}
        className="w-full rounded-md border border-line bg-canvas px-2 py-1.5 text-xs font-medium text-ink outline-none transition-colors focus-visible:border-teal"
      >
        {statusOrder.map((s) => (
          <option key={s} value={s}>
            {statusLabels[s]}
          </option>
        ))}
      </select>
    </div>
  );
}
