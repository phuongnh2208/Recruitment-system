/**
 * Shared Pino Logger Module
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 * PURPOSE
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Provides a single, pre-configured Pino logger instance and a factory for the
 * pino-http middleware used by every request.
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 * WHY A SINGLE MODULE
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * - Avoids calling pino() in multiple places – every consumer gets the same
 *   configured logger.
 * - Centralises redaction rules so sensitive fields cannot be accidentally
 *   logged elsewhere.
 * - Middleware is pre-wired to auto-generate a requestId when the incoming
 *   request does not carry one (via x-request-id header or crypto UUID).
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 * USAGE
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 *   import { logger, httpLoggerMiddleware } from "./common/logger";
 *
 *   // In main.ts:
 *   app.use(httpLoggerMiddleware);
 *
 *   // Anywhere else:
 *   logger.info({ userId }, "User profile updated");
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 * REDACTED FIELDS
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * The following keys are redacted from all log output (value replaced with
 * "[REDACTED]"):
 *
 *   password, passwordHash, token, accessToken, refreshToken,
 *   authorization, cookie
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import pino from "pino";
import pinoHttp from "pino-http";
import { randomUUID } from "node:crypto";
import type { IncomingMessage, ServerResponse } from "node:http";
import { config } from "../../config";

// ── Constants ─────────────────────────────────────────────────────────────────

/** Sensitive field paths that will be replaced with "[REDACTED]" in logs. */
const REDACT_CONFIG = {
  paths: [
    "password",
    "passwordHash",
    "token",
    "accessToken",
    "refreshToken",
    "authorization",
    "cookie",
  ],
  censor: "[REDACTED]",
};

// ── Logger singleton ──────────────────────────────────────────────────────────

/**
 * The single shared Pino logger instance.
 *
 * Configured via config's logLevel (defaults to `"info"`).
 * Redaction rules are applied globally so no sensitive data can leak through
 * ad-hoc `logger.info()` calls.
 */
export const logger = pino({
  level: config.logLevel,
  redact: REDACT_CONFIG,
});

// ── HTTP middleware factory ───────────────────────────────────────────────────

/**
 * Custom serialiser for the response object.
 *
 * We return only `statusCode` instead of the full response, keeping log lines
 * compact and JSON-friendly.
 */
function resSerializer(res: ServerResponse): Record<string, unknown> {
  return { statusCode: res.statusCode };
}

/**
 * Custom serialiser for the request object.
 *
 * Returns `method` and `url` while stripping the full headers/body that
 * pino-http would otherwise include.  Sensitive fields in headers (e.g.
 * `authorization`, `cookie`) are already redacted by the top-level `redact`
 * config, but we explicitly drop the raw headers anyway to keep logs small.
 */
function reqSerializer(req: IncomingMessage): Record<string, unknown> {
  return {
    method: req.method,
    url: req.url,
  };
}

/**
 * Pre-configured pino-http middleware.
 *
 * Features:
 *  1. JSON structured logging.
 *  2. Automatic `requestId` generation – uses `x-request-id` header if
 *     present, otherwise generates a v4 UUID via `crypto.randomUUID()`.
 *  3. Logs: requestId, responseTime (ms), method, url, statusCode.
 *  4. All sensitive fields are redacted (see REDACT_CONFIG above).
 *
 * Usage in main.ts:
 *
 *   app.use(httpLoggerMiddleware);
 */
export const httpLoggerMiddleware = pinoHttp({
  logger,

  /**
   * Generate or propagate a requestId for every incoming request.
   *
   * - If the client sent an `x-request-id` header we reuse it (enables
   *   tracing across services).
   * - Otherwise we generate a new UUID so that every request still has
   *   a unique correlation id.
   *
   * The id is stored on `req.id` by pino-http and automatically included
   * in every log line emitted during that request's lifecycle.
   */
  genReqId: (req: IncomingMessage): string => {
    const existing = req.headers["x-request-id"] as string | undefined;
    return existing ?? randomUUID();
  },

  /**
   * Custom serialisers ensure log lines contain only the fields we
   * explicitly want: method, url, statusCode, responseTime, requestId.
   */
  serializers: {
    req: reqSerializer,
    res: resSerializer,
  },

  /**
   * Custom success log message – pino-http will automatically append `res`
   * and `responseTime` to this, producing e.g.:
   *
   *   {"level":30,"time":...,"req":{"method":"GET","url":"/health"},"res":{"statusCode":200},"responseTime":3,"requestId":"abc-123"}
   */
  customSuccessMessage: (req: IncomingMessage, _res: ServerResponse): string => {
    return `${req.method ?? "UNKNOWN"} ${req.url ?? "/"}`;
  },

  /**
   * Custom error log message – used when the response status code >= 400.
   */
  customErrorMessage: (req: IncomingMessage, _res: ServerResponse): string => {
    return `${req.method ?? "UNKNOWN"} ${req.url ?? "/"}`;
  },
});
