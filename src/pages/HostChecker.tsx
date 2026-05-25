import React from "react";
import { CheckCircle, Clock, ScanLine, Lock } from "lucide-react";

const HostChecker: React.FC = () => {
  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Host Checker</h1>
      <div className="flex space-x-4">
        <CheckCircle className="text-green-500" />
        <Clock className="text-blue-500" />
        <ScanLine className="text-purple-500" />
        <Lock className="text-red-500" />
      </div>
    </div>
  );
};

export default HostChecker;
