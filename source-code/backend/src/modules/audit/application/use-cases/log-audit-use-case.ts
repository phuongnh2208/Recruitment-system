/**
 * LogAuditUseCase — Shared use case for appending audit log entries.
 *
 * ═══════════════════════════════════════════════════════════════════
 * USAGE
 * ═══════════════════════════════════════════════════════════════════
 *
 * This is a **shared** use case. It is called from other use cases
 * (not via an HTTP endpoint of its own) whenever an auditable action
 * occurs (login, logout, job approval, employer verification, etc.).
 *
 * ═══════════════════════════════════════════════════════════════════
 * CLEAN ARCHITECTURE
 * ═══════════════════════════════════════════════════════════════════
 *
 * Depends only on IAuditLogRepository (domain interface). No new
 * Repository. No Prisma.
 *
 * @category Application Use Case
 */

import { IAuditLogRepository } from "../../domain/repositories/audit-log-repository";
import { AuditLog } from "../../domain/entities/audit-log";

/**
 * Input command for appending an audit log entry.
 */
export interface LogAuditCommand {
  actorId: string;
  action: string;
  entity: string;
  entityId: string;
  metadata?: Record<string, unknown>;
}

export class LogAuditUseCase {
  constructor(private readonly auditLogRepository: IAuditLogRepository) {}

  async execute(command: LogAuditCommand): Promise<void> {
    const auditLog = new AuditLog({
      id: null,
      actorId: command.actorId,
      action: command.action,
      entity: command.entity,
      entityId: command.entityId,
      metadata: command.metadata ?? null,
      timestamp: new Date(),
    });
    await this.auditLogRepository.create(auditLog);
  }
}
