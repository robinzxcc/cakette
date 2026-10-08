import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { api, setUnauthorizedHandler, TOKEN_KEY } from "./api";

export type User = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "customer" | "admin";
};

type Credentials = {
  email: string;
  password: string;
};

type Registration = Credentials & {
  name: string;
};

type AuthContextValue = {
  user: User | null;
  ready: boolean;
  login: (data: Credentials) => Promise<void>;
  register: (data: Registration) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setUnauthorizedHandler(() => setUser(null));
    return () => setUnauthorizedHandler(null);
  }, []);

  useEffect(() => {
    const restore = async () => {
      // migrate old token key if present
      const legacy = localStorage.getItem("cakecraftToken");
      if (legacy && !localStorage.getItem(TOKEN_KEY)) {
        localStorage.setItem(TOKEN_KEY, legacy);
        localStorage.removeItem("cakecraftToken");
      }

      if (!localStorage.getItem(TOKEN_KEY)) {
        setReady(true);
        return;
      }

      try {
        const { data } = await api.get<{ user: User }>("/auth/me");
        setUser(data.user);
      } catch {
        localStorage.removeItem(TOKEN_KEY);
        setUser(null);
      } finally {
        setReady(true);
      }
    };

    void restore();
  }, []);

  const accept = (data: { token: string; user: User }) => {
    localStorage.setItem(TOKEN_KEY, data.token);
    setUser(data.user);
  };

  const value: AuthContextValue = {
    user,
    ready,
    login: async (data) => {
      const response = await api.post("/auth/login", data);
      accept(response.data);
    },
    register: async (data) => {
      const response = await api.post("/auth/register", data);
      accept(response.data);
    },
    logout: () => {
      const token = localStorage.getItem(TOKEN_KEY);
      if (token) {
        void api
          .post("/auth/logout", null, { headers: { Authorization: `Bearer ${token}` } })
          .catch(() => undefined);
      }
      localStorage.removeItem(TOKEN_KEY);
      setUser(null);
    },
    updateUser: setUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
};
