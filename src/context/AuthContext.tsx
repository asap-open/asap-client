import React, { createContext, useContext, useState, useEffect } from "react";
import { cacheService } from "../utils/cacheService";
import { storageService } from "../utils/storageService";

interface AuthContextType {
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const getCookie = (name: string): string | null => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
  return null;
};

const setCookie = (name: string, value: string, days: number) => {
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  const expires = `expires=${date.toUTCString()}`;
  document.cookie = `${name}=${value};${expires};path=/;SameSite=Strict`;
};

const deleteCookie = (name: string) => {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:01 GMT;path=/;SameSite=Strict`;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Initialize from cookie
  const [token, setToken] = useState<string | null>(() => getCookie("token"));

  const login = (newToken: string) => {
    setToken(newToken);
    setCookie("token", newToken, 7); // Store for 7 days
  };

  const logout = () => {
    setToken(null);
    deleteCookie("token");
    cacheService.clear(); // Clear memory cache
    storageService.clear(); // Clear localStorage with TTL data
  };

  // Sync state with cookie (in case it's mutated elsewhere, though Context usually drives this)
  useEffect(() => {
    const cookieToken = getCookie("token");
    if (cookieToken !== token) {
      setToken(cookieToken);
    }
  }, []);

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider value={{ token, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
export { AuthContext };
