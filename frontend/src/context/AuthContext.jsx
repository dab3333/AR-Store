import { createContext, useContext, useState, useCallback, useMemo } from "react";
import { loginUser, registerUser } from "../api/endpoints";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("arstore_token"));
  const [username, setUsername] = useState(() => localStorage.getItem("arstore_username"));
  const [role, setRole] = useState(() => localStorage.getItem("arstore_role"));

  const persist = useCallback((nextToken, nextUsername, nextRole) => {
    if (nextToken) {
      localStorage.setItem("arstore_token", nextToken);
      localStorage.setItem("arstore_username", nextUsername || "");
      localStorage.setItem("arstore_role", nextRole || "");
    } else {
      localStorage.removeItem("arstore_token");
      localStorage.removeItem("arstore_username");
      localStorage.removeItem("arstore_role");
    }
    setToken(nextToken);
    setUsername(nextUsername);
    setRole(nextRole);
  }, []);

  const login = useCallback(
    async (email, password) => {
      const { data } = await loginUser({ email, password });
      persist(data.token, data.username, data.role);
      return data;
    },
    [persist]
  );

  const register = useCallback(async (payload) => {
    const { data } = await registerUser(payload);
    return data;
  }, []);

  const logout = useCallback(() => {
    persist(null, null, null);
  }, [persist]);

  const value = useMemo(
    () => ({
      token,
      username,
      role,
      isAuthenticated: Boolean(token),
      isAdmin: role === "ADMIN",
      login,
      register,
      logout,
    }),
    [token, username, role, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
