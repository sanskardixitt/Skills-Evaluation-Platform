import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (token) localStorage.setItem("token", token);
    else localStorage.removeItem("token");
  }, [token]);

  const login = async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    setToken(res.data.data.token);
    setUser(res.data.data.user);
    return res.data;
  };

  const register = async (payload) => {
    const res = await api.post("/auth/register", payload);
    setToken(res.data.data.token);
    setUser(res.data.data.user);
    return res.data;
  };

  const fetchProfile = async () => {
    const res = await api.get("/auth/me");
    setUser(res.data.data.user);
  };

  const logout = () => {
    setToken("");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ token, user, login, register, fetchProfile, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
