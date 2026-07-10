/**
 * Email Infrastructure — barrel export.
 *
 * ═══════════════════════════════════════════════════════════════════
 * Usage
 * ═══════════════════════════════════════════════════════════════════
 *
 *   import { EmailServiceAdapter } from "../infrastructure/email";
 *
 * ═══════════════════════════════════════════════════════════════════
 */

export { EmailServiceAdapter } from "./EmailServiceAdapter";
export { verificationEmail, passwordResetEmail, notificationEmail } from "./templates";
