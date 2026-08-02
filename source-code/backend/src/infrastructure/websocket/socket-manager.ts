/**
 * SocketManager – Core Socket.io Server Manager
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 * PURPOSE
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Provides a singleton Socket.io server attached to the HTTP server. It handles:
 * - JWT-based authentication on connection
 * - User room management (`user:{userId}`)
 * - Exported utility functions sendToUser() and broadcast()
 * - Connection/disconnection logging
 *
 * This is infrastructure-level code. Notification Module will use sendToUser()
 * and broadcast() to push real-time notifications after this infrastructure is
 * ready.
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 * USAGE (in main.ts)
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 *   import http from "node:http";
 *   import { SocketManager } from "./infrastructure/websocket";
 *
 *   const server = http.createServer(app);
 *   const socketManager = new SocketManager(server, tokenProvider);
 *   socketManager.initialize();
 *
 *   // Later, in any use case / event handler:
 *   import { socketManager } from "./infrastructure/websocket";
 *   socketManager.sendToUser(userId, "notification", { title, message });
 *   socketManager.broadcast("system:announcement", { text });
 *
 *   server.listen(port, () => { ... });
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { Server as HttpServer } from "node:http";
import { Server, Socket } from "socket.io";
import { logger } from "../../common/logger";
import { config } from "../../config";
import type { TokenProvider } from "../../modules/auth/domain/token-provider";
import type { AuthenticatedUser } from "../../common/types/authenticated-user";
import { Role } from "../../common/types/role";
import type { SocketManagerPort } from "../../common/interfaces/socket-manager-port";

// ── Constants ─────────────────────────────────────────────────────────────────

/** Socket.io path for the notification namespace. */
const NS_PATH = "/ws/notification";

// ── Types ─────────────────────────────────────────────────────────────────────

/**
 * Extended socket with authenticated user data.
 */
interface AuthenticatedSocket extends Socket {
  /**
   * User data extracted from the JWT token during authentication,
   * available on every authenticated socket connection.
   */
  user: AuthenticatedUser;
}

// ── SocketManager ─────────────────────────────────────────────────────────────

export class SocketManager implements SocketManagerPort {
  private readonly io: Server;
  private readonly tokenProvider: TokenProvider;
  private initialized = false;

  constructor(httpServer: HttpServer, tokenProvider: TokenProvider) {
    this.tokenProvider = tokenProvider;

    // ── CORS hardening ─────────────────────────────────────────────────
    // A wildcard origin is NEVER allowed for Socket.io. When CLIENT_URL
    // is "*", CORS is disabled entirely — the server refuses cross-origin
    // connections rather than reflecting arbitrary origins.
    const allowedOrigin = config.clientUrl === "*" ? false : config.clientUrl;

    this.io = new Server(httpServer, {
      path: NS_PATH,
      cors: {
        origin: allowedOrigin,
        methods: ["GET", "POST"],
        credentials: allowedOrigin !== false,
        allowedHeaders: ["Authorization"],
      },
      transports: ["websocket"],
    });
  }

  // ── Initialization ──────────────────────────────────────────────────────────

  /**
   * Initialise the Socket.io server.
   *
   * Registers the JWT authentication middleware and sets up the
   * connect / disconnect event handlers.
   *
   * Must be called once after creating the instance.
   *
   * @throws {Error} If called more than once.
   */
  initialize(): void {
    if (this.initialized) {
      throw new Error("SocketManager.initialize() has already been called.");
    }
    this.initialized = true;

    // ── Authentication middleware ──────────────────────────────────────────
    // Every connecting socket must present a valid JWT in the handshake auth
    // field. Tokens passed via query string or URL are explicitly rejected.
    this.io.use(async (socket: Socket, next) => {
      try {
        // ── Reject token in query string (security) ─────────────────
        // Tokens in query strings can leak into server logs, browser
        // history, and CDN access logs. Only handshake auth is allowed.
        const queryToken = socket.handshake.query?.token as string | undefined;
        if (queryToken) {
          logger.warn(
            { socketId: socket.id },
            "Socket connection refused: token must not be passed via query string",
          );
          return next(new Error("Token must be provided via handshake auth, not query string"));
        }

        const token = socket.handshake.auth?.token as string | undefined;

        if (!token) {
          logger.warn({ socketId: socket.id }, "Socket connection refused: no token provided");
          return next(new Error("Authentication required: no token provided"));
        }

        const payload = await this.tokenProvider.verifyAccessToken(token);

        // Attach user info to the socket object
        (socket as AuthenticatedSocket).user = {
          id: payload.sub,
          email: payload.email,
          role: payload.role as Role,
        };

        next();
      } catch (error) {
        logger.warn(
          { socketId: socket.id, error: error instanceof Error ? error.message : "Unknown error" },
          "Socket connection refused: invalid token",
        );
        next(new Error("Authentication failed: invalid or expired token"));
      }
    });

    // ── Connection handler ────────────────────────────────────────────────
    this.io.on("connection", (socket: Socket) => {
      const authSocket = socket as AuthenticatedSocket;
      const { id: userId, email, role } = authSocket.user;

      // Join user-specific room
      const userRoom = `user:${userId}`;
      authSocket.join(userRoom);

      logger.info(
        { userId, email, role, socketId: authSocket.id, room: userRoom },
        "Socket connected",
      );

      // ── Disconnect handler ────────────────────────────────────────────
      authSocket.on("disconnect", (reason: string) => {
        logger.info({ userId, email, socketId: authSocket.id, reason }, "Socket disconnected");
      });

      // ── Error handler ─────────────────────────────────────────────────
      authSocket.on("error", (error: Error) => {
        logger.error({ userId, socketId: authSocket.id, error: error.message }, "Socket error");
      });
    });

    logger.info("Socket.io server initialised");
  }

  // ── Public API ─────────────────────────────────────────────────────────────

  /**
   * Send a real-time event to a specific user by their user ID.
   *
   * The event is emitted to the room `user:{userId}`. The Notification Module
   * should call this function (after persisting the notification) to push it
   * to the connected client in real time.
   *
   * @param userId   - The target user's UUID.
   * @param event    - The event name (e.g. "notification:new", "notification:read").
   * @param data     - The payload to send. Must be JSON-serialisable.
   */
  sendToUser(userId: string, event: string, data: unknown): void {
    if (!this.initialized) {
      logger.warn("sendToUser() called before SocketManager was initialised – event not sent");
      return;
    }
    this.io.to(`user:${userId}`).emit(event, data);
  }

  /**
   * Broadcast a real-time event to all connected clients.
   *
   * Useful for system-wide announcements (e.g. platform maintenance).
   *
   * @param event  - The event name.
   * @param data   - The payload to send.
   */
  broadcast(event: string, data: unknown): void {
    if (!this.initialized) {
      logger.warn("broadcast() called before SocketManager was initialised – event not sent");
      return;
    }
    this.io.emit(event, data);
  }

  /**
   * Return the raw Socket.io Server instance.
   *
   * Exposed for advanced use cases (e.g. namespaces, admin UI).
   * The Notification Module should prefer sendToUser() / broadcast().
   */
  getServer(): Server {
    return this.io;
  }
}
