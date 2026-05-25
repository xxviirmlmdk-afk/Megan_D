import { createContext, useContext, useState, ReactNode } from "react";
import { useAuth } from "./AuthContext";

export interface AuditLog {
  id: string;
  userId: string;
  username: string;
  action: string;
  details: string;
  target?: string;
  timestamp: Date;
  ipAddress?: string;
}

interface AuditContextType {
  logs: AuditLog[];
  logAction: (action: string, details: string, target?: string) => void;
  getLogsByUser: (userId: string) => AuditLog[];
  clearLogs: () => void;
}

const AuditContext = createContext<AuditContextType | undefined>(undefined);

export function AuditProvider({ children }: { children: ReactNode }) {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const { user } = useAuth();

  const logAction = (action: string, details: string, target?: string) => {
    if (!user) return;
    
    const log: AuditLog = {
      id: Date.now().toString(),
      userId: user.id,
      username: user.username,
      action,
      details,
      target,
      timestamp: new Date(),
      ipAddress: "192.168.1.100"
    };
    
    setLogs(prev => [log, ...prev].slice(0, 500));
  };

  const getLogsByUser = (userId: string) => {
    return logs.filter(log => log.userId === userId);
  };

  const clearLogs = () => {
    setLogs([]);
  };

  return (
    <AuditContext.Provider value={{ logs, logAction, getLogsByUser, clearLogs }}>
      {children}
    </AuditContext.Provider>
  );
}

export function useAudit() {
  const context = useContext(AuditContext);
  if (!context) {
    throw new Error("useAudit must be used within an AuditProvider");
  }
  return context;
}