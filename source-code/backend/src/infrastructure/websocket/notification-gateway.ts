/**
 * NotificationGateway – WebSocket Event Handler
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 * PURPOSE
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Provides a clean interface for the future Notification Module to send
 * real-time events through Socket.io. This gateway wraps the SocketManager
 * and exposes domain-friendly methods.
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 * HOW NOTIFICATION MODULE WILL USE THIS
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 *   // In NotificationModule's infrastructure layer:
 *   import { notificationGateway } from "../../infrastructure/websocket";
 *
 *   // After persisting a notification:
 *   await notificationGateway.sendNotification(userId, {
 *     id: notif.id,
 *     type: notif.type,
 *     title: notif.title,
 *     message: notif.message,
 *     data: notif.data,
 *     createdAt: notif.createdAt,
 *   });
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { SocketManager } from "./socket-manager";

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

export class NotificationGateway {
  constructor(private readonly socketManager: SocketManager) {}

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
