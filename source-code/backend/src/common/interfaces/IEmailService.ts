/**
 * Email Service Interface
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 * PURPOSE
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Defines the contract for sending transactional emails (verification, password
 * reset, notifications).
 *
 * This interface sits in the Shared Kernel (`common/interfaces`) so that
 * Application Layer Use Cases can depend on it WITHOUT knowing whether the
 * underlying implementation uses Nodemailer, SendGrid, or any other email
 * provider.
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 * DEPENDENCY INVERSION
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 *   RegisterUseCase
 *        │  depends on
 *        ▼
 *   IEmailService  ←───────────────┐
 *        │                         │ implemented by
 *        ▼                         │
 *   EmailServiceAdapter ────────────┘
 *        │
 *        ▼
 *   Nodemailer (SMTP)
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 * USAGE
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 *   import { IEmailService } from "../../common/interfaces/IEmailService";
 *
 *   class RegisterUseCase {
 *     constructor(private readonly emailService: IEmailService) {}
 *     async execute(input: RegisterInput): Promise<void> {
 *       // ... create user ...
 *       await this.emailService.sendVerificationEmail(input.email, token);
 *     }
 *   }
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 */

/**
 * Email Service interface — completely email-provider agnostic.
 *
 * Implementations:
 *   - {@link EmailServiceAdapter} (MVP — Nodemailer / SMTP)
 *   - SendGridService          (future — SendGrid API)
 */
export interface IEmailService {
  /**
   * Send a generic email with arbitrary subject and HTML body.
   *
   * @param to      - Recipient email address.
   * @param subject - Email subject line.
   * @param html    - HTML body content.
   * @throws {InfrastructureException} If the send operation fails.
   */
  sendEmail(to: string, subject: string, html: string): Promise<void>;

  /**
   * Send an email verification message containing a verification token/link.
   *
   * @param to    - Recipient email address.
   * @param token - The verification token (or full URL) to embed in the email.
   * @throws {InfrastructureException} If the send operation fails.
   */
  sendVerificationEmail(to: string, token: string): Promise<void>;

  /**
   * Send a password reset email containing a reset token/link.
   *
   * @param to    - Recipient email address.
   * @param token - The password-reset token (or full URL) to embed in the email.
   * @throws {InfrastructureException} If the send operation fails.
   */
  sendPasswordResetEmail(to: string, token: string): Promise<void>;

  /**
   * Send a generic notification email.
   *
   * @param to      - Recipient email address.
   * @param subject - Email subject line.
   * @param message - Plain text or HTML message body.
   * @throws {InfrastructureException} If the send operation fails.
   */
  sendNotificationEmail(to: string, subject: string, message: string): Promise<void>;
}
