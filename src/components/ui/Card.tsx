import React from "react";

export const Card: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="border rounded shadow p-4 bg-white">{children}</div>
);

export const CardHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="border-b pb-2 mb-2">{children}</div>
);

export const CardTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h2 className="text-lg font-semibold">{children}</h2>
);

export const CardContent: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="mt-2">{children}</div>
);

export const CardDescription: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="text-gray-600">{children}</p>
);
