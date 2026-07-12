/**
 * Notification Strategy Interface
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 * PURPOSE
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Defines the Strategy Pattern contract for sending notifications through
 * different channels (Email, WebSocket, etc.).
 *
 * This interface enables the Open/Closed Principle:
 *   - New delivery channels can be added WITHOUT modifying existing Use Cases.
 *   - Use Cases depend only on this abstraction, not on concrete implementations.
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 * STRATEGY PATTERN
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 *   Application Layer (e.g. SendNotificationUseCase)
 *        │  depends on
 *        ▼
 *   INotificationStrategy  ←──────────────────────┐
 *        │                                         │ implemented by
 *        ▼                                         │
 *   ┌──────────────┬────────────────┬──────────────┘
 *   │              │                │
 *   ▼              ▼                ▼
 *   EmailNotificationStrategy
 *   WebSocketNotificationStrategy
 *   CompositeNotificationStrategy
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 * CONTRACT
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 *   - The Application Layer is responsible for providing all channel-specific
 *     data through {@link NotificationMessage.metadata}.
 *
 *   - Example: for email delivery, the Application Layer MUST pass the
 *     recipient email as `metadata.email`. The strategy NEVER queries a database.
 *
 *   - On failure, strategies MUST throw {@link InfrastructureException}.
 *     The Composite strategy uses `Promise.all()` so that the first failure
 *     propagates immediately; the Application Layer decides how to handle it.
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 * USAGE EXAMPLE
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 *   // Single channel:
 *   const emailStrategy = new EmailNotificationStrategy(emailService);
 *   await emailStrategy.send({
 *     userId: "abc-123",
 *     title: "Application Received",
 *     message: "Your application has been received.",
 *     metadata: { email: "user@example.com" },
 *   });
 *
 *   // Multiple channels (Composite):
 *   const composite = new CompositeNotificationStrategy([
 *     emailStrategy,
 *     wsStrategy,
 *   ]);
 *   await composite.send({ userId, title, message, metadata: { email } });
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 */

/**
 * A notification message that can be delivered through any strategy channel.
 *
 * All strategies receive the same {@link NotificationMessage} contract,
 * ensuring consistency regardless of the delivery channel.
 *
 * Channel-specific data (e.g. recipient email for email delivery) MUST be
 * provided by the Application Layer via {@link metadata}. Strategies MUST
 * NOT query databases or repositories.
 */
export interface NotificationMessage {
  /** The target user's UUID. */
  userId: string;

  /** Short, human-readable title for the notification. */
  title: string;

  /** The notification body content. May contain plain text or simple HTML. */
  message: string;

  /** Optional category/type discriminator (e.g. "job_alert", "application_update"). */
  type?: string;

  /**
   * Optional key-value metadata for channel-specific data.
   *
   * The Application Layer MUST provide:
   *   - `email` (string) — recipient email address, required by
   *     {@link EmailNotificationStrategy}
   *
   * Strategies MAY use additional fields for enrichment
   * (e.g. deep-link URLs, action buttons).
   */
  metadata?: Record<string, unknown>;
}

/**
 * Notification Strategy — completely channel-agnostic.
 *
 * Implementations:
 *   - {@link EmailNotificationStrategy}     (email via IEmailService)
 *   - {@link WebSocketNotificationStrategy} (real-time via NotificationGateway)
 *   - {@link CompositeNotificationStrategy} (aggregate multiple strategies)
 *
 * @throws {InfrastructureException} If the notification cannot be delivered
 *         through the strategy's channel.
 */
export interface INotificationStrategy {
  /**
   * Deliver a notification through the strategy's channel.
   *
   * @param notification - The notification payload to deliver.
   * @throws {InfrastructureException} If delivery fails. The Composite strategy
   *         propagates the first failure immediately via `Promise.all()`.
   */
  send(notification: NotificationMessage): Promise<void>;
}
