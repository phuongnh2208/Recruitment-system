/**
 * EmailNotificationStrategy — Infrastructure Layer
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 * PURPOSE
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Implements {@link INotificationStrategy} using {@link IEmailService}.
 *
 * This strategy sends notifications as transactional emails. The recipient email
 * address MUST be provided by the Application Layer via
 * {@link NotificationMessage.metadata.email}. The strategy NEVER queries a
 * database or repository.
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 * STRATEGY PATTERN
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 *   INotificationStrategy  ←──────┐
 *        │                        │ implemented by
 *        ▼                        │
 *   EmailNotificationStrategy ────┘
 *        │
 *        ▼
 *   IEmailService (abstraction)
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 * METADATA CONTRACT
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 *   The Application Layer MUST provide:
 *     metadata.email: string  — the recipient email address
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 * ERROR HANDLING
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * All errors are logged via {@link logger} and re-thrown as
 * {@link InfrastructureException}. No error is swallowed.
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 * USAGE
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 *   const strategy = new EmailNotificationStrategy(emailService);
 *   await strategy.send({
 *     userId: "abc",
 *     title: "Hello",
 *     message: "World",
 *     metadata: { email: "user@example.com" },
 *   });
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { IEmailService } from "../../../common/interfaces/IEmailService";
import {
  INotificationStrategy,
  NotificationMessage,
} from "../../../common/interfaces/notification-strategy";
import { InfrastructureException } from "../../../common/exceptions";
import { logger } from "../../../common/logger";

// ── Constants ─────────────────────────────────────────────────────────────────

const METADATA_EMAIL_KEY = "email";

// ── Class ─────────────────────────────────────────────────────────────────────

/**
 * Email-based implementation of {@link INotificationStrategy}.
 *
 * @example
 *   const strategy = new EmailNotificationStrategy(emailService);
 *   await strategy.send({
 *     userId: "abc",
 *     title: "Hello",
 *     message: "World",
 *     metadata: { email: "user@example.com" },
 *   });
 */
export class EmailNotificationStrategy implements INotificationStrategy {
  constructor(private readonly emailService: IEmailService) {}

  /**
   * Send a notification as an email to the target user.
   *
   * The recipient email MUST be present in `notification.metadata.email`.
   *
   * @param notification - The notification payload.
   * @throws {InfrastructureException} If the email is missing or sending fails.
   */
  async send(notification: NotificationMessage): Promise<void> {
    const email = this.extractEmail(notification);

    try {
      await this.emailService.sendNotificationEmail(
        email,
        notification.title,
        notification.message,
      );

      logger.info(
        { userId: notification.userId, email, title: notification.title },
        "Email notification sent successfully",
      );
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown error";
      logger.error(
        { userId: notification.userId, email, title: notification.title, error: message },
        "Failed to send email notification",
      );
      throw new InfrastructureException(`Failed to send email notification: ${message}`, {
        userId: notification.userId,
        email,
        title: notification.title,
      });
    }
  }

  // ── Private helpers ─────────────────────────────────────────────────────────

  /**
   * Extract the recipient email from notification metadata.
   *
   * @param notification - The notification payload.
   * @returns The email address string.
   * @throws {InfrastructureException} If `metadata.email` is missing or not a string.
   */
  private extractEmail(notification: NotificationMessage): string {
    const email = notification.metadata?.[METADATA_EMAIL_KEY];

    if (typeof email !== "string" || email.length === 0) {
      logger.error(
        { userId: notification.userId, title: notification.title },
        "EmailNotificationStrategy: missing or invalid 'email' in metadata",
      );
      throw new InfrastructureException(
        "EmailNotificationStrategy requires 'email' in notification.metadata",
        { userId: notification.userId, title: notification.title },
      );
    }

    return email;
  }
}
