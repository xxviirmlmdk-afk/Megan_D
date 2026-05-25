import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface User {
  id: string;
  username: string;
  email: string;
  role: "admin" | "analyst" | "viewer";
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const mockUsers: Record<string, { password: string; user: User }> = {
  "admin": {
    password: "admin123",
    user: { id: "1", username: "admin", email: "admin@megand.io", role: "admin" }
  },
  "analyst": {
    password: "analyst123",
    user: { id: "2", username: "analyst", email: "analyst@megand.io", role: "analyst" }
  },
  "viewer": {
    password: "viewer123",
    user: { id: "3", username: "viewer", email: "viewer@megand.io", role: "viewer" }
  }
};

const rolePermissions: Record<string, string[]> = {
  admin: ["scan", "payload", "threat_intel", "ai_agent", "settings", "export", "delete", "manage_users"],
  analyst: ["scan", "payload", "threat_intel", "ai_agent", "export"],
  viewer: ["view", "export"]
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem("megand_user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const userData = mockUsers[username];
    if (userData && userData.password === password) {
      setUser(userData.user);
      localStorage.setItem("megand_user", JSON.stringify(userData.user));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("megand_user");
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    return rolePermissions[user.role]?.includes(permission) || false;
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}