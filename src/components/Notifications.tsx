import React from "react";
import { useNotifications } from "../context/NotificationContext";

const Notifications: React.FC = () => {
  const { notifications, removeNotification } = useNotifications();

  return (
    <div className="notifications">
      {notifications.map((n) => (
        <div key={n.id} className={`notification ${n.type}`}>
          <span>{n.message}</span>
          <button onClick={() => removeNotification(n.id)}>×</button>
        </div>
      ))}
    </div>
  );
};

export default Notifications;
