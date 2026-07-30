/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * APP COMPOSITION ROOT
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * This is the **Application Composition Root** — the single place where the
 * entire application's dependency graph is assembled.
 *
 * Responsibilities:
 *  1. Create shared singletons (PrismaClient, Logger, Config, Guards)
 *  2. Instantiate all Module Composition Roots
 *  3. Wire module routers into the Express app
 *  4. Register global middleware (helmet, cors, compression, json, logger)
 *  5. Register global error handler and 404 handler
 *  6. Register health check endpoint
 *  7. Log startup information (environment, port, registered modules)
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 * CLEAN ARCHITECTURE BOUNDARIES
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * - This file is the ONLY place where `new PrismaClient()` is called.
 * - This file is the ONLY place where module composition functions are called.
 * - Controllers, Use Cases, Repositories MUST NOT create their own dependencies.
 * - All cross-module dependencies are resolved here.
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import express from "express";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import http from "node:http";
import * as dotenv from "dotenv";

import { PrismaClient } from "./generated/prisma";
import { logger, httpLoggerMiddleware } from "./common/logger";
import { createAuthGuard } from "./common/guards/auth-guard";
import { requireRoles } from "./common/guards/roles-guard";
import { AllExceptionsFilter } from "./common/filters/all-exceptions-filter";
import { JwtTokenProvider } from "./infrastructure/security/jwt-token-provider";
import { SocketManager, NotificationGateway } from "./infrastructure/websocket";
import { EmailServiceAdapter } from "./infrastructure/email/email-service-adapter";
import { LocalFileStorage } from "./infrastructure/file-storage/local-file-storage";
import { IFileStorageStrategy } from "./common/interfaces/file-storage-strategy";
import { IEmailService } from "./common/interfaces/IEmailService";

// ── Module Composition Roots ──────────────────────────────────────────────────
import { createAuthModule } from "./modules/auth/composition/auth-module";
import { createStudentModule } from "./modules/student/composition/student-module";
import { createEmployerModule } from "./modules/employer/composition/employer-module";
import { createJobModule } from "./modules/job/composition/job-module";
import { createApplicationModule } from "./modules/application/composition/application-module";
import { createAdminModule } from "./modules/admin/composition/admin-module";

// ── Config ────────────────────────────────────────────────────────────────────
import { config } from "./config";

dotenv.config();

// ──────────────────────────────────────────────────────────────────────────────
// SHARED SINGLETONS
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Single PrismaClient instance for the entire application.
 * Created once here and injected into all modules.
 */
const prisma = new PrismaClient({
  log: config.env === "development" ? ["query", "error", "warn"] : ["error"],
});

/**
 * Single JWT Token Provider instance.
 */
const tokenProvider = new JwtTokenProvider();

/**
 * Single AuthGuard instance (uses tokenProvider).
 */
const authGuard = createAuthGuard(tokenProvider);

/**
 * Single RoleGuard factory (requireRoles).
 */
const roleGuard = requireRoles;

/**
 * Single Email Service instance.
 */
const emailService: IEmailService = new EmailServiceAdapter();

/**
 * Single File Storage Strategy instance.
 */
const fileStorage: IFileStorageStrategy = new LocalFileStorage(config.uploadDir);

/**
 * Socket.io infrastructure (created once, shared with modules that need it).
 */
const socketManager: SocketManager | null = null;
const notificationGateway: NotificationGateway | null = null;

// ──────────────────────────────────────────────────────────────────────────────
// MODULE INSTANTIATION
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Create all modules with their dependencies wired.
 * Order matters: modules with no cross-dependencies first, then dependent modules.
 */
function createModules() {
  // ── Auth Module (no cross-module dependencies) ─────────────────────────────
  const authModule = createAuthModule(prisma, emailService, notificationGateway!);

  // ── Job Module (no cross-module dependencies) ──────────────────────────────
  const jobModule = createJobModule(prisma, authGuard, roleGuard);

  // ── Application Module (depends on Job Module's IJobPostingRepository) ─────
  const applicationModule = createApplicationModule({
    prisma,
    jobPostingRepository: jobModule.useCases.searchJobsUseCase["jobPostingRepository"], // Access via use case
    authGuard,
    roleGuard,
  });

  // ── Student Module (depends on Application Module's IApplicationRepository and Job Module's IJobRepository) ─────
  const studentModule = createStudentModule({
    prisma,
    fileStorage,
    applicationRepository: applicationModule.useCases.applyJob["applicationRepository"], // Access via use case
    jobRepository: jobModule.useCases.searchJobsUseCase["jobPostingRepository"], // Access via use case
    authGuard,
    roleGuard,
  });

  // ── Employer Module (depends on Application Module's IApplicationRepository) ─────
  const employerModule = createEmployerModule({
    prisma,
    applicationRepository: applicationModule.useCases.applyJob["applicationRepository"], // Access via use case
    authGuard,
    roleGuard,
  });

  // ── Admin Module (no cross-module dependencies) ────────────────────────────
  const adminModule = createAdminModule({
    prisma,
    authGuard,
    roleGuard,
  });

  return {
    authModule,
    studentModule,
    employerModule,
    jobModule,
    applicationModule,
    adminModule,
  };
}

// ──────────────────────────────────────────────────────────────────────────────
// EXPRESS APP FACTORY
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Create and configure the Express application.
 * This is a pure function (no side effects) for testability.
 */
export function createApp(): express.Application {
  const app = express();

  // ── Global Middleware (order matters) ──────────────────────────────────────
  app.use(helmet());
  app.use(cors({ origin: config.clientUrl || "*" }));
  app.use(compression());
  app.use(express.json());
  app.use(httpLoggerMiddleware);

  // ── Health Check ───────────────────────────────────────────────────────────
  app.get("/health", (_req, res) => {
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
    });
  });

  // ── Initialize Socket.io (must be done after http server creation) ─────────
  // Note: Socket initialization is deferred to server.ts where http server exists

  // ── Module Routers ─────────────────────────────────────────────────────────
  const modules = createModules();

  // Auth routes (public)
  app.use("/api/v1/auth", modules.authModule.router);

  // Protected routes
  app.use("/api/v1/student", modules.studentModule.router);
  app.use("/api/v1/employer", modules.employerModule.router);
  app.use("/api/v1/jobs", modules.jobModule.router);
  app.use("/api/v1/applications", modules.applicationModule.router);
  app.use("/api/v1/admin", modules.adminModule.router);

  // ── 404 Handler ────────────────────────────────────────────────────────────
  app.use((_req, res) => {
    res.status(404).json({
      success: false,
      error: {
        code: "B004",
        message: "Route not found",
      },
      meta: { timestamp: new Date().toISOString() },
    });
  });

  // ── Global Error Handler (must be last) ────────────────────────────────────
  app.use(AllExceptionsFilter);

  return app;
}

// ──────────────────────────────────────────────────────────────────────────────
// STARTUP LOGGING
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Log application startup information.
 * Called after all modules are created and app is configured.
 */
export function logStartupInfo(): void {
  logger.info("═══════════════════════════════════════════════════════════════");
  logger.info("🚀  Recruitment System Backend Starting");
  logger.info("═══════════════════════════════════════════════════════════════");
  logger.info({ env: config.env }, "Environment: {env}");
  logger.info({ port: config.port }, "Port: {port}");
  logger.info(
    { databaseUrl: config.databaseUrl.replace(/\/\/.*@/, "//***@") },
    "Database: {databaseUrl}",
  );
  logger.info("─ Registered Modules ────────────────────────────────────────");
  logger.info("  • Auth Module");
  logger.info("  • Student Module");
  logger.info("  • Employer Module");
  logger.info("  • Job Module");
  logger.info("  • Application Module");
  logger.info("  • Admin Module");
  logger.info("═══════════════════════════════════════════════════════════════");
}

// ──────────────────────────────────────────────────────────────────────────────
// EXPORTS FOR SERVER.TS
// ──────────────────────────────────────────────────────────────────────────────

export {
  prisma,
  tokenProvider,
  authGuard,
  roleGuard,
  emailService,
  fileStorage,
  socketManager,
  notificationGateway,
  config,
};
