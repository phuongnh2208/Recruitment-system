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
 *  6. Register health check endpoint (database, uptime, timestamp, environment)
 *  7. Log startup information (environment, port, registered modules, node version)
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
import path from "path";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";

import { PrismaClient } from "./generated/prisma";
import { logger, httpLoggerMiddleware } from "./common/logger";
import { createAuthGuard } from "./common/guards/auth-guard";
import { requireRoles } from "./common/guards/roles-guard";
import { Role } from "./common/types/role";
import { AllExceptionsFilter } from "./common/filters/all-exceptions-filter";
import { JwtTokenProvider } from "./infrastructure/security/jwt-token-provider";
import { NotificationGatewayPort } from "./infrastructure/websocket/notification-gateway";
import { EmailServiceAdapter } from "./infrastructure/email/EmailServiceAdapter";
import { LocalFileStorageStrategy } from "./infrastructure/storage/LocalFileStorageStrategy";
import {
  CompositeNotificationStrategy,
  EmailNotificationStrategy,
  WebSocketNotificationStrategy,
} from "./infrastructure/notification";
import { INotificationStrategy } from "./common/interfaces/notification-strategy";
import { startJobExpiryJob } from "./infrastructure/scheduler/job-expiry-job";
import { IFileStorageStrategy } from "./common/interfaces/file-storage-strategy";
import { IEmailService } from "./common/interfaces/IEmailService";

// ── Module Composition Roots ──────────────────────────────────────────────────
import { createAuthModule } from "./modules/auth/composition/auth-module";
import { createStudentModule } from "./modules/student/composition/student-module";
import { createEmployerModule } from "./modules/employer/composition/employer-module";
import { createJobModule } from "./modules/job/composition/job-module";
import { createApplicationModule } from "./modules/application/composition/application-module";
import { createAdminModule } from "./modules/admin/composition/admin-module";
import { createAuditModule } from "./modules/audit/composition/audit-module";

// ── Repositories ──────────────────────────────────────────────────────────────
// ── Config ────────────────────────────────────────────────────────────────────
import { config } from "./config";

// ── Application Metrics ───────────────────────────────────────────────────────
const startTime = Date.now();
let isDatabaseConnected = false;

// ──────────────────────────────────────────────────────────────────────────────
// SHARED SINGLETONS
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Single PrismaClient instance for the entire application.
 * Created once here and injected into all modules.
 * Uses config-based logging levels.
 */
const prisma = new PrismaClient({
  log: config.env === "development" ? ["error", "warn"] : ["error"],
});

// Verify database connectivity on startup
prisma
  .$connect()
  .then(() => {
    isDatabaseConnected = true;
    logger.info("Database connection established successfully.");
  })
  .catch((err) => {
    isDatabaseConnected = false;
    logger.error({ err }, "Failed to connect to database on startup.");
  });

// Start background scheduler: auto-expire job postings (FR-SYS-11)
startJobExpiryJob(prisma);

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
 * This is a factory function that creates role-based middleware.
 */
const roleGuard = requireRoles;

/**
 * Pre-created role-specific middleware functions for modules that expect middleware.
 */
const studentRoleGuard = requireRoles(Role.STUDENT);
const employerRoleGuard = requireRoles(Role.EMPLOYER);
const adminRoleGuard = requireRoles(Role.ADMINISTRATOR);

/**
 * Single Email Service instance.
 */
const emailService: IEmailService = new EmailServiceAdapter();

/**
 * Single File Storage Strategy instance.
 */
const fileStorage: IFileStorageStrategy = new LocalFileStorageStrategy(config.uploadRoot);

/**
 * Notification gateway is injected lazily by server.ts once Socket.io exists.
 */
let activeNotificationGateway: NotificationGatewayPort | undefined;

export function setNotificationGateway(
  notificationGateway: NotificationGatewayPort | undefined,
): void {
  activeNotificationGateway = notificationGateway;
}

const notificationGatewayProxy: NotificationGatewayPort = {
  sendNotification(userId: string, notification: unknown): void {
    activeNotificationGateway?.sendNotification(userId, notification);
  },
  sendUnreadCount(userId: string, unreadCount: number): void {
    activeNotificationGateway?.sendUnreadCount(userId, unreadCount);
  },
  broadcastAnnouncement(title: string, message: string, data?: unknown): void {
    activeNotificationGateway?.broadcastAnnouncement(title, message, data);
  },
};

// ──────────────────────────────────────────────────────────────────────────────
// MODULE INSTANTIATION
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Create all modules with their dependencies wired.
 * Order matters: modules with no cross-dependencies first, then dependent modules.
 */
function createModules() {
  // ── Audit Module (no cross-module dependencies) ────────────────────────────
  const auditModule = createAuditModule({
    prisma,
    authGuard,
    roleGuard: adminRoleGuard,
  });

  // ── Auth Module (no cross-module dependencies) ─────────────────────────────
  const authModule = createAuthModule(
    prisma,
    emailService,
    notificationGatewayProxy,
    authGuard,
    auditModule.auditLogger,
  );

  // ── Job Module (no cross-module dependencies) ──────────────────────────────
  // Job module expects roleGuard factory (requireRoles)
  const jobModule = createJobModule(prisma, authGuard, roleGuard, auditModule.auditLogger);

  // ── Application Module (depends on Job Module's IJobPostingRepository) ─────
  // Application module expects roleGuard factory (requireRoles)
  const notificationStrategy: INotificationStrategy = new CompositeNotificationStrategy([
    new EmailNotificationStrategy(emailService),
    new WebSocketNotificationStrategy(notificationGatewayProxy),
  ]);

  const applicationModule = createApplicationModule({
    prisma,
    jobPostingRepository: jobModule.repositories.jobPostingRepository,
    authGuard,
    roleGuard,
    auditLogger: auditModule.auditLogger,
    notificationStrategy,
  });

  // ── Employer Module (depends on Application Module's IApplicationRepository) ─────
  // Employer module expects roleGuard middleware (pre-created with EMPLOYER role)
  const employerModule = createEmployerModule({
    prisma,
    applicationRepository: applicationModule.repositories.applicationRepository,
    authGuard,
    roleGuard: employerRoleGuard,
  });

  // ── Student Module (depends on Application Module's IApplicationRepository and Job Module's IJobPostingRepository) ─────
  // Student module expects roleGuard middleware (pre-created with STUDENT role)
  const studentModule = createStudentModule({
    prisma,
    fileStorage,
    applicationRepository: applicationModule.repositories.applicationRepository,
    jobRepository: jobModule.repositories.jobPostingRepository,
    jobPostingRepository: jobModule.repositories.jobPostingRepository,
    employerRepository: employerModule.repositories.employerRepository,
    authGuard,
    roleGuard: studentRoleGuard,
  });

  // ── Admin Module (no cross-module dependencies) ────────────────────────────
  // Admin module expects roleGuard middleware (pre-created with ADMINISTRATOR role)
  const adminModule = createAdminModule({
    prisma,
    authGuard,
    roleGuard: adminRoleGuard,
    auditLogger: auditModule.auditLogger,
    notificationStrategy,
  });

  return {
    authModule,
    studentModule,
    employerModule,
    jobModule,
    applicationModule,
    adminModule,
    auditModule,
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
  const corsOrigin = config.clientUrl === "*" ? false : config.clientUrl;

  // ── Global Middleware (order matters) ──────────────────────────────────────
  app.use(helmet());
  app.use(cors({ origin: corsOrigin, credentials: corsOrigin !== false }));
  app.use(compression());
  app.use(express.json());
  app.use(httpLoggerMiddleware);

  // ── Health Check ───────────────────────────────────────────────────────────
  app.get("/health", async (_req, res) => {
    const dbStatus = isDatabaseConnected ? "connected" : "disconnected";
    res.json({
      status: "ok",
      database: dbStatus,
      uptime: Math.floor((Date.now() - startTime) / 1000),
      timestamp: new Date().toISOString(),
      environment: config.env,
    });
  });

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
  app.use("/api/v1/admin", modules.auditModule.router);

  // Uploaded files (CVs, avatars) — require authentication to view/download
  app.use(
    "/api/v1/uploads",
    authGuard,
    express.static(path.resolve(config.uploadRoot)),
  );

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
  logger.info({ nodeVersion: process.version }, "Node.js Version: {nodeVersion}");
  logger.info(
    { databaseUrl: config.database.url.replace(/\/\/.*@/, "//***@") },
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

export { prisma, tokenProvider, authGuard, roleGuard, emailService, fileStorage, config };
