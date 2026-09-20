import Sidebar from "./Sidebar.jsx";

export default function AppShell({ children }) {
  return (
    <div className="flex h-screen bg-canvas">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
