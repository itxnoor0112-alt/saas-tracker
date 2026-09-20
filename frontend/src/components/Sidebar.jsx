import { NavLink, useParams, Link } from "react-router-dom";
import { LayoutGrid, BarChart3, Users, LogOut, Sun, Moon } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";

export default function Sidebar() {
  const { workspaceId } = useParams();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
      isActive ? "bg-teal-light text-teal-dark" : "text-ink/60 hover:bg-ink/5 hover:text-ink"
    }`;

  return (
    <aside className="flex h-full w-60 shrink-0 flex-col border-r border-line bg-panel px-4 py-6">
      <Link to="/workspaces" className="mb-8 flex items-center gap-2 px-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-ink font-display text-sm font-semibold text-canvas">
          R
        </div>
        <span className="font-display text-lg font-semibold text-ink">Ridgeline</span>
      </Link>

      {workspaceId ? (
        <nav className="flex flex-col gap-1">
          <NavLink to="/workspaces" className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-ink/60 transition-colors hover:bg-ink/5 hover:text-ink">
            <LayoutGrid size={17} />
            All workspaces
          </NavLink>
          <div className="my-2 border-t border-line" />
          <NavLink to={`/workspaces/${workspaceId}`} end className={linkClass}>
            <LayoutGrid size={17} />
            Boards
          </NavLink>
          <NavLink to={`/workspaces/${workspaceId}/analytics`} className={linkClass}>
            <BarChart3 size={17} />
            Analytics
          </NavLink>
          <NavLink to={`/workspaces/${workspaceId}/members`} className={linkClass}>
            <Users size={17} />
            Members
          </NavLink>
        </nav>
      ) : null}

      <div className="mt-auto flex flex-col gap-3 border-t border-line pt-4">
        <div className="flex items-center gap-2 px-2">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold text-white"
            style={{ backgroundColor: user?.avatarColor || "#2F6F6B" }}
          >
            {user?.name?.charAt(0)?.toUpperCase() || "?"}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-ink">{user?.name}</p>
            <p className="truncate text-xs text-ink/50">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={toggleTheme}
          className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-ink/60 transition-colors hover:bg-ink/5 hover:text-ink"
        >
          {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          {theme === "dark" ? "Light mode" : "Dark mode"}
        </button>
        <button
          onClick={logout}
          className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-ink/60 transition-colors hover:bg-rust-light hover:text-rust"
        >
          <LogOut size={16} />
          Sign out
        </button>
      </div>
    </aside>
  );
}