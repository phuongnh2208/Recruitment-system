/**
 * WebSocket Infrastructure – Barrel Export
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 * PURPOSE
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Central export point for all WebSocket/Socket.io infrastructure.
 * Other modules (e.g. Notification Module) should import from here rather
 * than importing individual files.
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 * USAGE
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 *   import { SocketManager, NotificationGateway, NotificationEvents }
 *     from "../../infrastructure/websocket";
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 */

export { SocketManager } from "./socket-manager";
export { NotificationGateway, NotificationEvents } from "./notification-gateway";
