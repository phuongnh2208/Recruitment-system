/**
 * Email Templates
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 * PURPOSE
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Provides HTML template functions for transactional emails.
 *
 * Templates are kept **separate** from the EmailServiceAdapter so that:
 *   1. They can be unit-tested independently.
 *   2. They can be swapped out or internationalised without touching the
 *      service logic.
 *   3. The service remains focused on transport (SMTP / SendGrid / ...).
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 * USAGE
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 *   import { verificationEmail, passwordResetEmail } from "./templates";
 *
 *   const html = verificationEmail("user@example.com", "abc123");
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 */

/**
 * Build the verification email HTML body.
 *
 * @param to    - Recipient email address (displayed in the email).
 * @param token - The verification token or full URL.
 * @returns A complete HTML string.
 */
export function verificationEmail(to: string, token: string): string {
  const safeTo = escapeHtml(to);
  const safeToken = escapeHtml(token);
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Verify your email</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f4;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f4;padding:20px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:8px;overflow:hidden;">
          <tr>
            <td style="padding:40px 30px;text-align:center;background-color:#2563eb;">
              <h1 style="color:#ffffff;margin:0;font-size:24px;">TrustHire</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:30px;">
              <h2 style="color:#1e293b;font-size:20px;margin:0 0 16px 0;">Verify your email address</h2>
              <p style="color:#475569;font-size:16px;line-height:1.6;margin:0 0 24px 0;">
                Hi <strong>${safeTo}</strong>,<br /><br />
                Thank you for creating an account with TrustHire. Please verify your email address by clicking the button below.
              </p>
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 24px auto;">
                <tr>
                  <td align="center" style="background-color:#2563eb;border-radius:6px;">
                    <a href="${safeToken}" target="_blank" style="display:inline-block;padding:12px 32px;color:#ffffff;text-decoration:none;font-size:16px;font-weight:bold;">Verify Email</a>
                  </td>
                </tr>
              </table>
              <p style="color:#475569;font-size:14px;line-height:1.6;margin:0 0 8px 0;">
                Or copy and paste this link into your browser:
              </p>
              <p style="color:#2563eb;font-size:14px;word-break:break-all;margin:0;">
                ${safeToken}
              </p>
              <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;" />
              <p style="color:#94a3b8;font-size:12px;margin:0;">
                If you did not create an account, please ignore this email.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim();
}

/**
 * Build the password-reset email HTML body.
 *
 * @param to    - Recipient email address (displayed in the email).
 * @param token - The password-reset token or full URL.
 * @returns A complete HTML string.
 */
export function passwordResetEmail(to: string, token: string): string {
  const safeTo = escapeHtml(to);
  const safeToken = escapeHtml(token);
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Reset your password</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f4;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f4;padding:20px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:8px;overflow:hidden;">
          <tr>
            <td style="padding:40px 30px;text-align:center;background-color:#2563eb;">
              <h1 style="color:#ffffff;margin:0;font-size:24px;">TrustHire</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:30px;">
              <h2 style="color:#1e293b;font-size:20px;margin:0 0 16px 0;">Reset your password</h2>
              <p style="color:#475569;font-size:16px;line-height:1.6;margin:0 0 24px 0;">
                Hi <strong>${safeTo}</strong>,<br /><br />
                We received a request to reset your password. Click the button below to set a new password.
              </p>
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 24px auto;">
                <tr>
                  <td align="center" style="background-color:#2563eb;border-radius:6px;">
                    <a href="${safeToken}" target="_blank" style="display:inline-block;padding:12px 32px;color:#ffffff;text-decoration:none;font-size:16px;font-weight:bold;">Reset Password</a>
                  </td>
                </tr>
              </table>
              <p style="color:#475569;font-size:14px;line-height:1.6;margin:0 0 8px 0;">
                Or copy and paste this link into your browser:
              </p>
              <p style="color:#2563eb;font-size:14px;word-break:break-all;margin:0;">
                ${safeToken}
              </p>
              <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;" />
              <p style="color:#94a3b8;font-size:12px;margin:0;">
                If you did not request a password reset, please ignore this email.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim();
}

/**
 * Build a generic notification email HTML body.
 *
 * @param to      - Recipient email address (displayed in the email).
 * @param subject - The email subject (used as the heading).
 * @param message - The notification message body (plain text or simple HTML).
 * @returns A complete HTML string.
 */
export function notificationEmail(to: string, subject: string, message: string): string {
  const safeTo = escapeHtml(to);
  const safeSubject = escapeHtml(subject);
  const safeMessage = escapeHtml(message).replace(/\r?\n/g, "<br />");
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${safeSubject}</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f4;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f4;padding:20px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:8px;overflow:hidden;">
          <tr>
            <td style="padding:40px 30px;text-align:center;background-color:#2563eb;">
              <h1 style="color:#ffffff;margin:0;font-size:24px;">TrustHire</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:30px;">
              <h2 style="color:#1e293b;font-size:20px;margin:0 0 16px 0;">${safeSubject}</h2>
              <p style="color:#475569;font-size:16px;line-height:1.6;margin:0 0 24px 0;">
                Hi <strong>${safeTo}</strong>,<br /><br />
                ${safeMessage}
              </p>
              <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;" />
              <p style="color:#94a3b8;font-size:12px;margin:0;">
                This is an automated message from TrustHire. Please do not reply directly.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim();
}

// ── Helper ─────────────────────────────────────────────────────────────────────

/**
 * Minimal HTML-escape to prevent XSS when embedding user-supplied values
 * in email templates.
 *
 * Uses character codes to build HTML entities so that formatters do not
 * corrupt the literal strings.
 */
function escapeHtml(text: string): string {
  const amp = String.fromCharCode(38) + "amp;";
  const lt = String.fromCharCode(38) + "lt;";
  const gt = String.fromCharCode(38) + "gt;";
  const quot = String.fromCharCode(38) + "quot;";
  const apos = String.fromCharCode(38) + "#039;";
  return text
    .replace(/&/g, amp)
    .replace(/</g, lt)
    .replace(/>/g, gt)
    .replace(/"/g, quot)
    .replace(/'/g, apos);
}
