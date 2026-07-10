/**
 * Email Configuration
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 * PURPOSE
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Reads SMTP configuration from environment variables and provides a typed
 * configuration object for the EmailServiceAdapter.
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 * ENVIRONMENT VARIABLES
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * | Variable       | Required | Default       | Description                     |
 * |----------------|----------|---------------|---------------------------------|
 * | SMTP_HOST      | Yes      | —             | SMTP server hostname            |
 * | SMTP_PORT      | Yes      | 587           | SMTP server port                |
 * | SMTP_USER      | Yes      | —             | SMTP username                   |
 * | SMTP_PASSWORD  | Yes      | —             | SMTP password                   |
 * | SMTP_FROM      | Yes      | —             | "From" address for sent emails  |
 * | NODE_ENV       | No       | development   | Environment name                |
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 */

export interface EmailConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  from: string;
  isDevelopment: boolean;
}

/**
 * Load and validate SMTP configuration from environment variables.
 *
 * @returns A validated {@link EmailConfig} object.
 * @throws {Error} If any required SMTP variable is missing.
 */
export function loadEmailConfig(): EmailConfig {
  const host = process.env.SMTP_HOST?.trim();
  const portStr = process.env.SMTP_PORT?.trim();
  const user = process.env.SMTP_USER?.trim();
  const password = process.env.SMTP_PASSWORD?.trim();
  const from = process.env.SMTP_FROM?.trim();
  const nodeEnv = process.env.NODE_ENV?.trim() || "development";

  const missing: string[] = [];
  if (!host) missing.push("SMTP_HOST");
  if (!portStr) missing.push("SMTP_PORT");
  if (!user) missing.push("SMTP_USER");
  if (!password) missing.push("SMTP_PASSWORD");
  if (!from) missing.push("SMTP_FROM");

  if (missing.length > 0) {
    throw new Error(`Missing required SMTP environment variables: ${missing.join(", ")}`);
  }

  const port = parseInt(portStr!, 10);
  if (Number.isNaN(port) || port < 1 || port > 65535) {
    throw new Error(`Invalid SMTP_PORT "${portStr}". Must be a number between 1 and 65535.`);
  }

  return {
    host: host!,
    port,
    user: user!,
    password: password!,
    from: from!,
    isDevelopment: nodeEnv === "development",
  };
}
