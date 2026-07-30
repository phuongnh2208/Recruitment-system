/**
 * Global type declarations for the application.
 *
 * This file augments the global `NodeJS.Global` and `globalThis` objects
 * with application-level singletons that are set at the composition root
 * (server.ts) and may be accessed by infrastructure modules.
 *
 * ═══════════════════════════════════════════════════════════════════
 * WHY THIS FILE EXISTS
 * ═══════════════════════════════════════════════════════════════════
 *
 * Instead of using `(global as any)` to attach singletons, we declare
 * them here so that TypeScript can type-check all access sites.
 *
 * ═══════════════════════════════════════════════════════════════════
 */

import type { SocketManager } from "../infrastructure/websocket/socket-manager";
import type { NotificationGateway } from "../infrastructure/websocket/notification-gateway";

declare global {
  // eslint-disable-next-line no-var
  var socketManager: SocketManager | undefined;
  // eslint-disable-next-line no-var
  var notificationGateway: NotificationGateway | undefined;
}

export {};
