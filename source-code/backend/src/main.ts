import express from "express";
import helmet from "helmet";
import cors from "cors";
import http from "node:http";
import * as dotenv from "dotenv";

import { logger, httpLoggerMiddleware } from "./common/logger";
import { JwtTokenProvider } from "./infrastructure/security/jwt-token-provider";
import { createAuthGuard, requireRoles, Role } from "./common/guards";
import { AllExceptionsFilter } from "./common/filters";
import { SocketManager, NotificationGateway } from "./infrastructure/websocket";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || "*" }));
app.use(express.json());
app.use(httpLoggerMiddleware);

// ── Initialize Auth infrastructure ─────────────────────────────────
const tokenProvider = new JwtTokenProvider();
const authGuard = createAuthGuard(tokenProvider);

// ── Create HTTP server (required for Socket.io) ────────────────────
const server = http.createServer(app);

// ── Initialize Socket.io infrastructure ────────────────────────────
const socketManager = new SocketManager(server, tokenProvider);
socketManager.initialize();

// Export socketManager for use by Notification Module event handlers.
// In a Clean Architecture with DI container, this would be injected.
export { socketManager };

// Create NotificationGateway (for use by Notification Module)
const notificationGateway = new NotificationGateway(socketManager);
export { notificationGateway };

// ── Public routes ──────────────────────────────────────────────────
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ── Example: Protected route ───────────────────────────────────────
// GET /api/v1/profile: accessible by any authenticated user
app.get("/api/v1/profile", authGuard, (req, res) => {
  res.json({
    success: true,
    data: {
      user: req.user,
    },
    meta: { timestamp: new Date().toISOString() },
  });
});

// ── Example: Role-protected routes ─────────────────────────────────
// GET /api/v1/admin/dashboard: ADMINISTRATOR only
app.get("/api/v1/admin/dashboard", authGuard, requireRoles(Role.ADMINISTRATOR), (req, res) => {
  res.json({
    success: true,
    data: {
      message: "Welcome to Admin Dashboard",
      user: req.user,
    },
    meta: { timestamp: new Date().toISOString() },
  });
});

// GET /api/v1/student/profile: STUDENT only
app.get("/api/v1/student/profile", authGuard, requireRoles(Role.STUDENT), (req, res) => {
  res.json({
    success: true,
    data: {
      message: "Student profile endpoint",
      user: req.user,
    },
    meta: { timestamp: new Date().toISOString() },
  });
});

// GET /api/v1/employer/company: EMPLOYER only
app.get("/api/v1/employer/company", authGuard, requireRoles(Role.EMPLOYER), (req, res) => {
  res.json({
    success: true,
    data: {
      message: "Employer company endpoint",
      user: req.user,
    },
    meta: { timestamp: new Date().toISOString() },
  });
});

// ── Global Error Handler (must be registered after all routes) ─────
app.use(AllExceptionsFilter);

// ── Start server ───────────────────────────────────────────────────
server.listen(port, () => {
  logger.info(`Server is running on port ${port}`);
});
