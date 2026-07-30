/**
 * Email Configuration
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 * PURPOSE
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * SMTP configuration is now centralized in src/config/index.ts.
 * This file provides a typed interface and a factory that reads from the
 * centralized config object instead of process.env directly.
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { config } from "./index";

export interface EmailConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  from: string;
  isDevelopment: boolean;
}

/**
 * Load SMTP configuration from the centralized config.
 *
 * @returns A validated {@link EmailConfig} object.
 */
export function loadEmailConfig(): EmailConfig {
  return {
    host: config.smtp.host,
    port: config.smtp.port,
    user: config.smtp.user,
    password: config.smtp.password,
    from: config.smtp.from,
    isDevelopment: config.env === "development",
  };
}
