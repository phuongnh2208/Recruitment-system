/**
 * Notification Infrastructure — barrel export.
 *
 * ═══════════════════════════════════════════════════════════════════
 * Usage
 * ═══════════════════════════════════════════════════════════════════
 *
 *   import {
 *     EmailNotificationStrategy,
 *     WebSocketNotificationStrategy,
 *     CompositeNotificationStrategy,
 *   } from "../infrastructure/notification";
 *
 * ═══════════════════════════════════════════════════════════════════
 */

export { EmailNotificationStrategy } from "./strategies/EmailNotificationStrategy";
export { WebSocketNotificationStrategy } from "./strategies/WebSocketNotificationStrategy";
export { CompositeNotificationStrategy } from "./strategies/CompositeNotificationStrategy";
