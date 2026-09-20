import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Workspaces from "./pages/Workspaces.jsx";
import WorkspaceBoards from "./pages/WorkspaceBoards.jsx";
import BoardView from "./pages/BoardView.jsx";
import Analytics from "./pages/Analytics.jsx";
import Members from "./pages/Members.jsx";
import NotFound from "./pages/NotFound.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/workspaces" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/workspaces"
        element={
          <ProtectedRoute>
            <Workspaces />
          </ProtectedRoute>
        }
      />
      <Route
        path="/workspaces/:workspaceId"
        element={
          <ProtectedRoute>
            <WorkspaceBoards />
          </ProtectedRoute>
        }
      />
      <Route
        path="/workspaces/:workspaceId/boards/:boardId"
        element={
          <ProtectedRoute>
            <BoardView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/workspaces/:workspaceId/analytics"
        element={
          <ProtectedRoute>
            <Analytics />
          </ProtectedRoute>
        }
      />
      <Route
        path="/workspaces/:workspaceId/members"
        element={
          <ProtectedRoute>
            <Members />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
