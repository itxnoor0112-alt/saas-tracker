import { createContext, useContext, useEffect, useState, useCallback } from "react";
import api from "../api/httpClient.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("ridgeline_token");
    const cached = localStorage.getItem("ridgeline_user");
    if (!token) {
      setLoading(false);
      return;
    }
    if (cached) {
      setUser(JSON.parse(cached));
    }
    api
      .get("/auth/me")
      .then(({ data }) => {
        setUser(data.data.user);
        localStorage.setItem("ridgeline_user", JSON.stringify(data.data.user));
      })
      .catch(() => {
        localStorage.removeItem("ridgeline_token");
        localStorage.removeItem("ridgeline_user");
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    localStorage.setItem("ridgeline_token", data.data.accessToken);
    localStorage.setItem("ridgeline_user", JSON.stringify(data.data.user));
    setUser(data.data.user);
    return data.data.user;
  }, []);

  const register = useCallback(async (name, email, password) => {
    const { data } = await api.post("/auth/register", { name, email, password });
    localStorage.setItem("ridgeline_token", data.data.accessToken);
    localStorage.setItem("ridgeline_user", JSON.stringify(data.data.user));
    setUser(data.data.user);
    return data.data.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout");
    } catch {}
    localStorage.removeItem("ridgeline_token");
    localStorage.removeItem("ridgeline_user");
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
