/**
 * NotificationGateway – WebSocket Event Handler
 *
 * ═══════════════════════════════════════════════════════════════════
 * PURPOSE
 * ═══════════════════════════════════════════════════════════════════
 *
 * Provides a clean interface for the Notification Module to send
 * real-time events through Socket.io. This gateway wraps the
 * {@link SocketManagerPort} abstraction and exposes domain-friendly
 * methods.
 *
 * ═══════════════════════════════════════════════════════════════════
 * DEPENDENCY INVERSION
 * ═══════════════════════════════════════════════════════════════════
 *
 * The gateway depends on the {@link SocketManagerPort} interface, not on
 * the concrete SocketManager class. This keeps the notification layer
 * decoupled from the Socket.io infrastructure.
 *
 * ═══════════════════════════════════════════════════════════════════
 */

import { SocketManagerPort } from "../../common/interfaces/socket-manager-port";

export interface NotificationGatewayPort {
  sendNotification(userId: string, notification: unknown): void;
  sendUnreadCount(userId: string, unreadCount: number): void;
  broadcastAnnouncement(title: string, message: string, data?: unknown): void;
}

// ── Event name constants ──────────────────────────────────────────────────────

/**
 * Standard event names used for real-time notifications.
 *
 * The Notification Module should use these constants when emitting events
 * to ensure consistency between backend and frontend.
 */
export const NotificationEvents = {
  /** A new notification has been created for the user. */
  NEW_NOTIFICATION: "notification:new",

  /** A notification has been marked as read. */
  NOTIFICATION_READ: "notification:read",

  /** All notifications for the user have been marked as read. */
  ALL_NOTIFICATIONS_READ: "notification:all-read",

  /** A notification has been deleted. */
  NOTIFICATION_DELETED: "notification:deleted",

  /** Unread count has changed. */
  UNREAD_COUNT_CHANGED: "notification:unread-count",
} as const;

// ── NotificationGateway ───────────────────────────────────────────────────────

export class NotificationGateway implements NotificationGatewayPort {
  constructor(private readonly socketManager: SocketManagerPort) {}

  /**
   * Send a real-time notification to a specific user.
   *
   * The Notification Module should call this after persisting a notification
   * record to the database.
   *
   * @param userId - The target user's UUID.
   * @param notification - The notification payload (must be JSON-serialisable).
   */
  sendNotification(userId: string, notification: unknown): void {
    this.socketManager.sendToUser(userId, NotificationEvents.NEW_NOTIFICATION, notification);
  }

  /**
   * Notify a user that their unread notification count has changed.
   *
   * @param userId - The target user's UUID.
   * @param unreadCount - The new unread count.
   */
  sendUnreadCount(userId: string, unreadCount: number): void {
    this.socketManager.sendToUser(userId, NotificationEvents.UNREAD_COUNT_CHANGED, {
      unreadCount,
    });
  }

  /**
   * Broadcast a system-wide announcement to all connected clients.
   *
   * @param title   - Announcement title.
   * @param message - Announcement body.
   * @param data    - Optional additional data.
   */
  broadcastAnnouncement(title: string, message: string, data?: unknown): void {
    this.socketManager.broadcast("system:announcement", { title, message, data });
  }
}
