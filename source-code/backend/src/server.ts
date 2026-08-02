/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * SERVER ENTRY POINT
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * This is the ONLY file that should contain server startup logic.
 * It imports the Express app from app.ts (Composition Root) and starts the HTTP server.
 *
 * Responsibilities:
 *  1. Create HTTP server from Express app
 *  2. Initialize Socket.io (requires HTTP server)
 *  3. Start listening on configured port
 *  4. Handle graceful shutdown (SIGINT, SIGTERM, unhandled rejections, uncaught exceptions)
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 * CLEAN ARCHITECTURE BOUNDARIES
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * - This file does NOT create PrismaClient, guards, or any dependencies.
 * - All dependency wiring happens in app.ts (Composition Root).
 * - This file only handles the HTTP server lifecycle.
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import http from "node:http";
import { createApp, logStartupInfo, prisma, setNotificationGateway, tokenProvider } from "./app";
import { config } from "./config";
import { logger } from "./common/logger";

/**
 * Main server bootstrap function.
 * Creates the Express app, initializes Socket.io, and starts the HTTP server.
 */
async function bootstrap(): Promise<void> {
  // ── 1. Create Express Application ──────────────────────────────────────────
  const app = createApp();

  // ── 2. Create HTTP Server (required for Socket.io) ─────────────────────────
  const server = http.createServer(app);

  // ── 3. Initialize Socket.io ────────────────────────────────────────────────
  // Import dynamically to avoid circular dependencies
  const { SocketManager, NotificationGateway } = await import("./infrastructure/websocket");

  // Reuse the shared tokenProvider from the app composition root.
  const socketManagerInstance = new SocketManager(server, tokenProvider);
  socketManagerInstance.initialize();

  const notificationGatewayInstance = new NotificationGateway(socketManagerInstance);

  setNotificationGateway(notificationGatewayInstance);

  // ── 4. Start HTTP Server ───────────────────────────────────────────────────
  server.listen(config.port, () => {
    logStartupInfo();
    logger.info(`🚀 Server listening on http://localhost:${config.port}`);
  });

  // ── 5. Graceful Shutdown ───────────────────────────────────────────────────
  const shutdown = async (signal: string) => {
    logger.info(`\n${signal} received. Starting graceful shutdown...`);

    // Stop accepting new connections
    server.close(async () => {
      logger.info("HTTP server closed.");

      // Close Prisma connection
      await prisma.$disconnect();
      logger.info("Database connection closed.");

      // Close Socket.io
      socketManagerInstance.getServer().close();
      logger.info("Socket.io closed.");

      setNotificationGateway(undefined);

      logger.info("Graceful shutdown complete.");
      process.exit(0);
    });

    // Force shutdown after 30 seconds
    setTimeout(() => {
      logger.error("Forced shutdown after timeout.");
      process.exit(1);
    }, 30000);
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

// ── Global Process Handlers ───────────────────────────────────────────────────

/**
 * Handle unhandled promise rejections.
 * Logs the error and performs a graceful shutdown.
 */
process.on("unhandledRejection", (reason: unknown) => {
  logger.error(
    { err: reason instanceof Error ? reason : new Error(String(reason)) },
    "UNHANDLED REJECTION! Shutting down gracefully...",
  );
  // Give time for the error to be logged before exiting
  setTimeout(() => process.exit(1), 1000);
});

/**
 * Handle uncaught exceptions.
 * Logs the error and performs a graceful shutdown.
 */
process.on("uncaughtException", (error: Error) => {
  logger.error({ err: error }, "UNCAUGHT EXCEPTION! Shutting down gracefully...");
  // Give time for the error to be logged before exiting
  setTimeout(() => process.exit(1), 1000);
});

// ── Run Bootstrap ─────────────────────────────────────────────────────────────
bootstrap().catch((error) => {
  logger.error({ err: error }, "Failed to start server");
  process.exit(1);
});
