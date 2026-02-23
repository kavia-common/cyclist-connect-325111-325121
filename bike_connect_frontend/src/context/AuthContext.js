import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api, authStore } from "../api/client";

const AuthContext = createContext(null);

// PUBLIC_INTERFACE
export function AuthProvider({ children }) {
  /** Provides auth state (user, token presence) and actions (login/register/logout/refresh). */
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState("idle"); // idle | loading | authed | guest
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    const token = authStore().getToken();
    if (!token) {
      setUser(null);
      setStatus("guest");
      return;
    }

    setStatus("loading");
    setError(null);
    try {
      const me = await api.auth.me();
      setUser(me);
      setStatus("authed");
    } catch (e) {
      // Token likely invalid; clear it.
      authStore().clear();
      setUser(null);
      setStatus("guest");
      setError(e?.message || "Authentication failed");
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = useCallback(async ({ email, password }) => {
    setStatus("loading");
    setError(null);
    try {
      await api.auth.login({ email, password });
      await refresh();
      return true;
    } catch (e) {
      setStatus("guest");
      setError(e?.message || "Login failed");
      return false;
    }
  }, [refresh]);

  const register = useCallback(async ({ email, password, displayName }) => {
    setStatus("loading");
    setError(null);
    try {
      await api.auth.register({ email, password, displayName });
      // After register, attempt login for convenience.
      await api.auth.login({ email, password });
      await refresh();
      return true;
    } catch (e) {
      setStatus("guest");
      setError(e?.message || "Registration failed");
      return false;
    }
  }, [refresh]);

  const logout = useCallback(() => {
    api.auth.logout();
    setUser(null);
    setStatus("guest");
  }, []);

  const value = useMemo(
    () => ({
      user,
      status,
      error,
      isAuthenticated: status === "authed",
      login,
      register,
      logout,
      refresh,
    }),
    [user, status, error, login, register, logout, refresh]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// PUBLIC_INTERFACE
export function useAuth() {
  /** Hook to access auth context. */
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
