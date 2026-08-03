/**
 * IAuditLogger — Minimal cross-module audit logging contract.
 *
 * ═══════════════════════════════════════════════════════════════════
 * WHY A MINIMAL INTERFACE?
 * ═══════════════════════════════════════════════════════════════════
 *
 * The Audit module lives in its own bounded context. Injecting the
 * domain-specific LogAuditUseCase directly into every use case that
 * needs auditing would create a large cross-module dependency graph.
 *
 * Instead, we expose a *minimal* interface (IAuditLogger) in the
 * common layer. Any use case that needs to record an audit trail
 * depends only on this tiny contract — not on the Audit module.
 *
 * ═══════════════════════════════════════════════════════════════════
 * NON-BLOCKING GUARANTEE
 * ═══════════════════════════════════════════════════════════════════
 *
 * Implementations MUST NOT throw. Audit logging is a side concern —
 * a failure to write an audit log must never fail the primary use case.
 *
 * @category Common Interface
 */

export interface IAuditLogger {
  /**
   * Append an audit log entry.
   *
   * @param actorId - The user ID performing the action.
   * @param action - The action name (e.g. "LOGIN", "JOB_APPROVED").
   * @param entity - The entity type (e.g. "JOB_POSTING", "USER").
   * @param entityId - The entity identifier.
   * @param metadata - Optional structured metadata.
   */
  log(
    actorId: string,
    action: string,
    entity: string,
    entityId: string,
    metadata?: Record<string, unknown>,
  ): Promise<void>;
}
