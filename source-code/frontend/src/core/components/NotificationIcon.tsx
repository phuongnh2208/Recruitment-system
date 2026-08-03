/**
 * NotificationIcon — Real-time notification bell with badge.
 *
 * ═══════════════════════════════════════════════════════════════════
 * PURPOSE
 * ═══════════════════════════════════════════════════════════════════
 *
 * Displays a bell icon in the header with a badge showing unread
 * notification count. Connects to the backend WebSocket gateway to
 * receive real-time notifications.
 *
 * @category Frontend / Component
 */

import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

interface NotificationData {
  id?: string;
  title: string;
  message: string;
  type?: string;
}

export function NotificationIcon() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    const socket = io({
      auth: { token },
      transports: ["websocket"],
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      // Connected to notification gateway
    });

    socket.on("notification", (data: NotificationData) => {
      setNotifications((prev) => [data, ...prev].slice(0, 20));
      setUnreadCount((prev) => prev + 1);
    });

    socket.on("unreadCount", (count: number) => {
      setUnreadCount(count);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
    if (!isOpen) {
      setUnreadCount(0);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handleToggle}
        className="relative rounded-full p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
        aria-label="Notifications"
      >
        <svg
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
          {notifications.length === 0 ? (
            <p className="p-4 text-center text-sm text-gray-400">
              Không có thông báo nào
            </p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {notifications.map((n, i) => (
                <li key={i} className="p-3 hover:bg-gray-50">
                  <p className="text-sm font-medium text-gray-900">{n.title}</p>
                  <p className="mt-1 text-xs text-gray-500">{n.message}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
