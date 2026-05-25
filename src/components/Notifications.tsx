import React, { useContext } from "react";
import { NotificationContext } from "../context/NotificationContext";

const Notifications: React.FC = () => {
  const { notifications } = useContext(NotificationContext);

  return (
    <section className="p-4 bg-yellow-50 border rounded">
      <h2 className="text-lg font-bold mb-2">Notifications</h2>
      <ul className="space-y-2">
        {notifications.length === 0 ? (
          <li className="text-sm text-gray-700">No new alerts</li>
        ) : (
          notifications.map((note, idx) => (
            <li key={idx} className="text-sm text-gray-700">
              {note.message}
            </li>
          ))
        )}
      </ul>
    </section>
  );
};

export default Notifications;
