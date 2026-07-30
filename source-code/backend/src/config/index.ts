/**
 * Application Configuration
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 * PURPOSE
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Centralized configuration management. All environment variables are read
 * and validated here. The rest of the application imports from this module
 * instead of reading process.env directly.
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 * ENVIRONMENT VARIABLES
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Required:
 *   - DATABASE_URL          PostgreSQL connection string
 *   - JWT_SECRET            Secret for signing JWT tokens
 *   - JWT_REFRESH_SECRET    Secret for signing refresh tokens
 *
 * Optional (with defaults):
 *   - NODE_ENV              "development" | "production" | "test" (default: "development")
 *   - PORT                  HTTP port (default: 3000)
 *   - CLIENT_URL            Frontend URL for CORS (default: "*")
 *   - LOG_LEVEL             Pino log level (default: "info")
 *   - UPLOAD_ROOT           File upload directory (default: "uploads")
 *
 * SMTP (for email):
 *   - SMTP_HOST
 *   - SMTP_PORT
 *   - SMTP_USER
 *   - SMTP_PASSWORD
 *   - SMTP_FROM
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import * as dotenv from "dotenv";

// ── Load .env file at config import time ───────────────────────────────
dotenv.config();

// ── Validation helper ───────────────────────────────────────────────────
function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`❌ MISSING REQUIRED ENVIRONMENT VARIABLE: ${name}`);
  }
  return value;
}

function optionalEnv(name: string, defaultValue: string): string {
  return process.env[name]?.trim() || defaultValue;
}

function optionalIntEnv(name: string, defaultValue: number): number {
  const raw = process.env[name]?.trim();
  if (!raw) return defaultValue;
  const parsed = parseInt(raw, 10);
  if (isNaN(parsed)) {
    throw new Error(`❌ INVALID ENVIRONMENT VARIABLE: ${name} must be a number`);
  }
  return parsed;
}

// ── Validated Env Enum ──────────────────────────────────────────────────
type Environment = "development" | "production" | "test";

function validateEnvironment(value: string): Environment {
  const validEnvs: Environment[] = ["development", "production", "test"];
  if (!validEnvs.includes(value as Environment)) {
    throw new Error(`❌ INVALID NODE_ENV: "${value}". Must be one of: ${validEnvs.join(", ")}`);
  }
  return value as Environment;
}

// ── Config Object ───────────────────────────────────────────────────────
export const config = {
  env: validateEnvironment(optionalEnv("NODE_ENV", "development")),
  port: optionalIntEnv("PORT", 3000),
  clientUrl: optionalEnv("CLIENT_URL", "*"),
  logLevel: optionalEnv("LOG_LEVEL", "info"),
  uploadRoot: optionalEnv("UPLOAD_ROOT", "uploads"),

  database: {
    url: requireEnv("DATABASE_URL"),
  },

  jwt: {
    secret: requireEnv("JWT_SECRET"),
    refreshSecret: requireEnv("JWT_REFRESH_SECRET"),
    accessTokenExpiry: optionalEnv("JWT_ACCESS_TOKEN_EXPIRY", "15m"),
    refreshTokenExpiry: optionalEnv("JWT_REFRESH_TOKEN_EXPIRY", "7d"),
  },

  smtp: {
    host: optionalEnv("SMTP_HOST", ""),
    port: optionalIntEnv("SMTP_PORT", 587),
    user: optionalEnv("SMTP_USER", ""),
    password: optionalEnv("SMTP_PASSWORD", ""),
    from: optionalEnv("SMTP_FROM", "noreply@trusthire.com"),
  },
} as const;

// ── Type Export ─────────────────────────────────────────────────────────
export type Config = typeof config;
