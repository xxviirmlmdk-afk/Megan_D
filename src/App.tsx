import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { NotificationProvider } from "./context/NotificationContext";
import { AuditProvider } from "./context/AuditContext";

import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Notifications from "./components/Notifications";

import Dashboard from "./pages/Dashboard";
import HostChecker from "./pages/HostChecker";
import ThreatIntel from "./pages/ThreatIntel";
import PayloadEngine from "./pages/PayloadEngine";
import Reports from "./pages/Reports";
import Login from "./pages/Login";

import ProtectedRoute from "./routes/ProtectedRoute";

function AppContent() {
  return (
    <Router>
      <NotificationProvider>
        <AuditProvider>
          <div className="flex">
            {/* Sidebar navigation */}
            <Sidebar />

            {/* Main content area */}
            <div className="flex-1">
              <Header />
              <Notifications />

              <Routes>
                {/* Public routes */}
                <Route path="/" element={<Dashboard />} />
                <Route path="/login" element={<Login />} />
                <Route path="/hostchecker" element={<HostChecker />} />
                <Route path="/threatintel" element={<ThreatIntel />} />
                <Route path="/payloadengine" element={<PayloadEngine />} />

                {/* Protected routes */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/reports"
                  element={
                    <ProtectedRoute>
                      <Reports />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </div>
          </div>
        </AuditProvider>
      </NotificationProvider>
    </Router>
  );
}

export default AppContent;
