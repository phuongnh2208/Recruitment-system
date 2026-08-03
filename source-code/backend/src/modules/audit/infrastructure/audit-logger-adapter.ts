/**
 * AuditLoggerAdapter — Infrastructure implementation of IAuditLogger.
 *
 * ═══════════════════════════════════════════════════════════════════
 * NON-BLOCKING GUARANTEE
 * ═══════════════════════════════════════════════════════════════════
 *
 * This adapter NEVER throws. If writing the audit log fails, it only
 * logs a warning so the primary use-case flow is not interrupted.
 *
 * @category Infrastructure / Adapter
 */

import { IAuditLogger } from "../../../common/interfaces/audit-logger";
import { IAuditLogRepository } from "../domain/repositories/audit-log-repository";
import { AuditLog } from "../domain/entities/audit-log";
import { logger } from "../../../common/logger";

export class AuditLoggerAdapter implements IAuditLogger {
  constructor(private readonly auditLogRepository: IAuditLogRepository) {}

  async log(
    actorId: string,
    action: string,
    entity: string,
    entityId: string,
    metadata?: Record<string, unknown>,
  ): Promise<void> {
    try {
      const auditLog = new AuditLog({
        id: null,
        actorId,
        action,
        entity,
        entityId,
        metadata: metadata ?? null,
        timestamp: new Date(),
      });
      await this.auditLogRepository.create(auditLog);
    } catch (error) {
      logger.warn(
        { error, action, entity, entityId },
        "AuditLoggerAdapter: failed to write audit log (non-blocking)",
      );
    }
  }
}
