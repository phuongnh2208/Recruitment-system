/**
 * CompositeNotificationStrategy — Infrastructure Layer
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 * PURPOSE
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Implements {@link INotificationStrategy} by aggregating multiple child
 * strategies and delegating to each one concurrently via `Promise.all()`.
 *
 * This is the **Composite** variant of the Strategy Pattern, allowing a
 * Use Case to send a notification through multiple channels (e.g. Email +
 * WebSocket) with a single `send()` call.
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 * COMPOSITE STRATEGY
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 *   INotificationStrategy  ←──────────────────────┐
 *        │                                         │ implemented by
 *        ▼                                         │
 *   CompositeNotificationStrategy ─────────────────┘
 *        │
 *        │ delegates to
 *        ▼
 *   [EmailNotificationStrategy, WebSocketNotificationStrategy, ...]
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 * ERROR HANDLING
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Uses `Promise.allSettled()` so every strategy gets a chance to run and the
 * caller receives a single aggregated failure when one or more strategies fail.
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 * USAGE
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 *   const composite = new CompositeNotificationStrategy([
 *     new EmailNotificationStrategy(emailService),
 *     new WebSocketNotificationStrategy(notificationGateway),
 *   ]);
 *
 *   // Sends via BOTH email AND WebSocket:
 *   await composite.send({ userId, title, message, metadata: { email } });
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import {
  INotificationStrategy,
  NotificationMessage,
} from "../../../common/interfaces/notification-strategy";
import { InfrastructureException } from "../../../common/exceptions";
import { logger } from "../../../common/logger";

// ── Class ─────────────────────────────────────────────────────────────────────

/**
 * Composite implementation of {@link INotificationStrategy}.
 *
 * Aggregates multiple child strategies and delegates `send()` to each one
 * concurrently via `Promise.all()`. The first rejection propagates immediately.
 *
 * @example
 *   const composite = new CompositeNotificationStrategy([
 *     emailStrategy,
 *     wsStrategy,
 *   ]);
 *   await composite.send({ userId: "abc", title: "Hello", message: "World" });
 */
export class CompositeNotificationStrategy implements INotificationStrategy {
  /**
   * @param strategies - The list of child strategies to delegate to.
   *                     Each strategy is called concurrently.
   */
  constructor(private readonly strategies: INotificationStrategy[]) {}

  /**
   * Deliver a notification through ALL child strategies concurrently.
   *
   * @param notification - The notification payload to deliver.
   * @throws {InfrastructureException} If any child strategy fails. The first
   *         rejection propagates immediately via `Promise.all()`.
   */
  async send(notification: NotificationMessage): Promise<void> {
    const results = await Promise.allSettled(
      this.strategies.map((strategy) => strategy.send(notification)),
    );

    const failures = results
      .map((result, index) => ({ result, index }))
      .filter(
        (
          entry,
        ): entry is {
          result: PromiseRejectedResult;
          index: number;
        } => entry.result.status === "rejected",
      );

    if (failures.length > 0) {
      const message = failures
        .map(
          ({ result, index }) =>
            `strategy[${index}]: ${result.reason instanceof Error ? result.reason.message : "Unknown error"}`,
        )
        .join("; ");

      logger.error(
        {
          totalStrategies: this.strategies.length,
          failedStrategies: failures.length,
          userId: notification.userId,
          title: notification.title,
          error: message,
        },
        "CompositeNotificationStrategy: one or more strategies failed",
      );

      throw new InfrastructureException(`Composite notification failed: ${message}`, {
        userId: notification.userId,
        title: notification.title,
        totalStrategies: this.strategies.length,
        failedStrategies: failures.length,
      });
    }
  }
}
