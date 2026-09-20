import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-canvas px-4 text-center">
      <p className="font-display text-4xl font-semibold text-ink">404</p>
      <p className="text-sm text-ink/60">This page doesn't exist, or you don't have access to it.</p>
      <Link to="/workspaces" className="mt-2 text-sm font-medium text-teal-dark hover:underline">
        Back to workspaces
      </Link>
    </div>
  );
}
