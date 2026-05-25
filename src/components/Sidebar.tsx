import React from "react";
import { Link } from "react-router-dom";

const Sidebar: React.FC = () => {
  return (
    <aside className="w-64 bg-gray-100 p-4 min-h-screen">
      <h2 className="font-bold mb-4">Navigation</h2>
      <nav>
        <ul className="space-y-2">
          <li>
            <Link to="/dashboard" className="block text-blue-600 hover:underline">
              Dashboard
            </Link>
          </li>
          <li>
            <Link to="/hostchecker" className="block text-blue-600 hover:underline">
              Host Checker
            </Link>
          </li>
          <li>
            <Link to="/threatintel" className="block text-blue-600 hover:underline">
              Threat Intel
            </Link>
          </li>
          <li>
            <Link to="/payloadengine" className="block text-blue-600 hover:underline">
              Payload Engine
            </Link>
          </li>
          <li>
            <Link to="/reports" className="block text-blue-600 hover:underline">
              Reports
            </Link>
          </li>
          <li>
            <Link to="/login" className="block text-blue-600 hover:underline">
              Login
            </Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
