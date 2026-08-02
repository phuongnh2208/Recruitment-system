/**
 * SocketManagerPort — Abstraction for the Socket.io manager.
 *
 * ═══════════════════════════════════════════════════════════════════
 * PURPOSE
 * ═══════════════════════════════════════════════════════════════════
 *
 * Defines the contract for real-time WebSocket delivery. By depending on
 * this abstraction instead of the concrete {@link SocketManager} class,
 * the Notification Gateway and Notification Strategies remain decoupled
 * from the Socket.io infrastructure.
 *
 * ═══════════════════════════════════════════════════════════════════
 * DEPENDENCY INVERSION
 * ═══════════════════════════════════════════════════════════════════
 *
 *   NotificationGateway  →  SocketManagerPort  ←  SocketManager (concrete)
 *
 * @category Shared Kernel / Common Interfaces
 */

/**
 * Port interface for the Socket.io server manager.
 */
export interface SocketManagerPort {
  /**
   * Send a real-time event to a specific user by their user ID.
   *
   * @param userId - The target user's UUID.
   * @param event  - The event name (e.g. "notification:new").
   * @param data   - The payload to send. Must be JSON-serialisable.
   */
  sendToUser(userId: string, event: string, data: unknown): void;

  /**
   * Broadcast a real-time event to all connected clients.
   *
   * @param event - The event name.
   * @param data  - The payload to send.
   */
  broadcast(event: string, data: unknown): void;
}
