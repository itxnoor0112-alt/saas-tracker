import { useState } from "react";
import { Menu } from "lucide-react";
import Sidebar from "./Sidebar.jsx";

export default function AppShell({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen bg-canvas">
      <Sidebar isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center gap-3 border-b border-line bg-panel px-4 py-3 sm:hidden">
          <button
            onClick={() => setMobileOpen(true)}
            className="text-ink/60 hover:text-ink"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
          <span className="font-display text-base font-semibold text-ink">Ridgeline</span>
        </div>

        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}