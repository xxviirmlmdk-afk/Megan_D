import React, { createContext, useState } from "react";

type Notification = {
  message: string;
};

type NotificationContextType = {
  notifications: Notification[];
  addNotification: (message: string) => void;
};

export const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  addNotification: () => {},
});

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (message: string) => {
    setNotifications((prev) => [...prev, { message }]);
  };

  return (
    <NotificationContext.Provider value={{ notifications, addNotification }}>
      {children}
    </NotificationContext.Provider>
  );
};
