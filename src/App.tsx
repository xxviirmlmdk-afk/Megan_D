import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import { NotificationProvider } from "./context/NotificationContext";
import Notifications from "./components/Notifications";

// Example pages — adjust imports to match your actual files
import Dashboard from "./pages/Dashboard";
import ThreatIntel from "./pages/ThreatIntel";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import Login from "./pages/Login";

const App: React.FC = () => {
  return (
    <NotificationProvider>
      <Router>
        {/* Global notifications bar */}
        <Notifications />

        {/* App routes */}
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/threatintel" element={<ThreatIntel />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Router>
    </NotificationProvider>
  );
};

export default App;
