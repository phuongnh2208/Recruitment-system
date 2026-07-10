/**
 * EmailServiceAdapter — Infrastructure Layer
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 * PURPOSE
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Implements {@link IEmailService} using Nodemailer (SMTP).
 *
 * In **development** mode (`NODE_ENV=development`) no real email is sent;
 * instead the adapter logs the email that *would* have been sent.
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 * ERROR HANDLING
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * All Nodemailer/transport errors are wrapped in {@link InfrastructureException}
 * so callers never need to catch raw Node.js `Error` instances.
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 * DEPENDENCIES
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * - Nodemailer       — SMTP transport
 * - email.config.ts  — typed SMTP configuration
 * - ./templates      — separate HTML template functions
 * - logger           — Pino structured logger
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";

import { IEmailService } from "../../common/interfaces/IEmailService";
import { InfrastructureException } from "../../common/exceptions";
import { logger } from "../../common/logger";
import { loadEmailConfig, type EmailConfig } from "../../config/email.config";

import { verificationEmail, passwordResetEmail, notificationEmail } from "./templates";

// ── Class ─────────────────────────────────────────────────────────────────────

/**
 * Nodemailer-based implementation of {@link IEmailService}.
 *
 * @example
 *   const emailService = new EmailServiceAdapter();
 *   await emailService.sendVerificationEmail("user@example.com", "https://.../verify?token=abc");
 */
export class EmailServiceAdapter implements IEmailService {
  /** Resolved SMTP configuration. */
  private readonly config: EmailConfig;

  /** Nodemailer transporter (only initialised when not in development mode). */
  private transporter: Transporter | null = null;

  constructor() {
    this.config = loadEmailConfig();
    logger.info(
      {
        host: this.config.host,
        port: this.config.port,
        user: this.config.user,
        from: this.config.from,
        isDevelopment: this.config.isDevelopment,
      },
      "EmailServiceAdapter initialized",
    );
  }

  // ── Public API ──────────────────────────────────────────────────────────────

  /**
   * Send a generic email with arbitrary subject and HTML body.
   *
   * @param to      - Recipient email address.
   * @param subject - Email subject line.
   * @param html    - HTML body content.
   * @throws {InfrastructureException} If the send operation fails.
   */
  async sendEmail(to: string, subject: string, html: string): Promise<void> {
    if (this.config.isDevelopment) {
      logger.info({ to, subject }, "[DEV] Email not sent – logging only");
      return;
    }

    await this.sendRaw({ to, subject, html });
  }

  /**
   * Send an email verification message.
   *
   * @param to    - Recipient email address.
   * @param token - The verification token or full URL.
   * @throws {InfrastructureException} If the send operation fails.
   */
  async sendVerificationEmail(to: string, token: string): Promise<void> {
    const subject = "Verify your email address – TrustHire";
    const html = verificationEmail(to, token);

    if (this.config.isDevelopment) {
      logger.info({ to, subject, token }, "[DEV] Verification email not sent – logging only");
      return;
    }

    await this.sendRaw({ to, subject, html });
    logger.info({ to }, "Verification email sent successfully");
  }

  /**
   * Send a password-reset email.
   *
   * @param to    - Recipient email address.
   * @param token - The password-reset token or full URL.
   * @throws {InfrastructureException} If the send operation fails.
   */
  async sendPasswordResetEmail(to: string, token: string): Promise<void> {
    const subject = "Reset your password – TrustHire";
    const html = passwordResetEmail(to, token);

    if (this.config.isDevelopment) {
      logger.info({ to, subject, token }, "[DEV] Password-reset email not sent – logging only");
      return;
    }

    await this.sendRaw({ to, subject, html });
    logger.info({ to }, "Password-reset email sent successfully");
  }

  /**
   * Send a generic notification email.
   *
   * @param to      - Recipient email address.
   * @param subject - Email subject line.
   * @param message - Plain text or HTML message body.
   * @throws {InfrastructureException} If the send operation fails.
   */
  async sendNotificationEmail(to: string, subject: string, message: string): Promise<void> {
    const html = notificationEmail(to, subject, message);

    if (this.config.isDevelopment) {
      logger.info({ to, subject }, "[DEV] Notification email not sent – logging only");
      return;
    }

    await this.sendRaw({ to, subject, html });
    logger.info({ to, subject }, "Notification email sent successfully");
  }

  // ── Private helpers ─────────────────────────────────────────────────────────

  /**
   * Low-level send method.
   *
   * Lazily creates the Nodemailer transporter on first call.
   *
   * @param options - Send options (to, subject, html).
   * @throws {InfrastructureException} On transport or send failure.
   */
  private async sendRaw(options: { to: string; subject: string; html: string }): Promise<void> {
    try {
      const transporter = this.getTransporter();

      await transporter.sendMail({
        from: this.config.from,
        to: options.to,
        subject: options.subject,
        html: options.html,
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown error";
      logger.error(
        { to: options.to, subject: options.subject, error: message },
        "Failed to send email",
      );
      throw new InfrastructureException(`Failed to send email: ${message}`, {
        to: options.to,
        subject: options.subject,
      });
    }
  }

  /**
   * Get (or create) the Nodemailer transporter.
   *
   * The transporter is created lazily on the first send and then cached.
   */
  private getTransporter(): Transporter {
    if (!this.transporter) {
      this.transporter = nodemailer.createTransport({
        host: this.config.host,
        port: this.config.port,
        secure: this.config.port === 465,
        auth: {
          user: this.config.user,
          pass: this.config.password,
        },
      });
      logger.info(
        { host: this.config.host, port: this.config.port },
        "Nodemailer transporter created",
      );
    }
    return this.transporter;
  }
}
