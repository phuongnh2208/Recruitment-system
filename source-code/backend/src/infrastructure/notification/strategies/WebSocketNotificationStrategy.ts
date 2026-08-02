/**
 * WebSocketNotificationStrategy — Infrastructure Layer
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 * PURPOSE
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Implements {@link INotificationStrategy} using {@link NotificationGateway}.
 *
 * This strategy pushes real-time notifications to connected clients through
 * Socket.io. If the target user is offline, the event is silently discarded
 * (no persistence — the Notification Module handles that separately).
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 * STRATEGY PATTERN
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 *   INotificationStrategy  ←──────────┐
 *        │                            │ implemented by
 *        ▼                            │
 *   WebSocketNotificationStrategy ────┘
 *        │
 *        ▼
 *   NotificationGateway (real-time push)
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 * ERROR HANDLING
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Errors are logged via {@link logger} and re-thrown as
 * {@link InfrastructureException}. No error is swallowed.
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 * USAGE
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 *   const strategy = new WebSocketNotificationStrategy(notificationGateway);
 *   await strategy.send({ userId: "abc", title: "New message", message: "..." });
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { NotificationGatewayPort } from "../../websocket/notification-gateway";
import {
  INotificationStrategy,
  NotificationMessage,
} from "../../../common/interfaces/notification-strategy";
import { InfrastructureException } from "../../../common/exceptions";
import { logger } from "../../../common/logger";

// ── Class ─────────────────────────────────────────────────────────────────────

/**
 * WebSocket-based implementation of {@link INotificationStrategy}.
 *
 * Pushes real-time notification events to the target user's connected clients.
 *
 * @example
 *   const strategy = new WebSocketNotificationStrategy(notificationGateway);
 *   await strategy.send({ userId: "abc", title: "Hello", message: "World" });
 */
export class WebSocketNotificationStrategy implements INotificationStrategy {
  constructor(private readonly notificationGateway: NotificationGatewayPort) {}

  /**
   * Send a real-time notification to the target user.
   *
   * @param notification - The notification payload.
   * @throws {InfrastructureException} If the WebSocket push fails.
   */
  async send(notification: NotificationMessage): Promise<void> {
    try {
      this.notificationGateway.sendNotification(notification.userId, {
        title: notification.title,
        message: notification.message,
        type: notification.type,
        metadata: notification.metadata,
      });

      logger.info(
        { userId: notification.userId, title: notification.title },
        "WebSocket notification sent successfully",
      );
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown error";
      logger.error(
        { userId: notification.userId, title: notification.title, error: message },
        "Failed to send WebSocket notification",
      );
      throw new InfrastructureException(`Failed to send WebSocket notification: ${message}`, {
        userId: notification.userId,
        title: notification.title,
      });
    }
  }
}
