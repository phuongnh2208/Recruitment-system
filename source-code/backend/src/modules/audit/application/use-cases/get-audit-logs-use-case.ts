/**
 * GetAuditLogsUseCase — Paginated query for audit logs.
 *
 * ═══════════════════════════════════════════════════════════════════
 * CLEAN ARCHITECTURE
 * ═══════════════════════════════════════════════════════════════════
 *
 * Depends only on IAuditLogRepository (domain interface).
 *
 * @category Application Use Case
 */

import {
  IAuditLogRepository,
  AuditLogFilters,
  AuditLogPage,
} from "../../domain/repositories/audit-log-repository";

/**
 * Input command for querying audit logs.
 */
export interface GetAuditLogsCommand {
  filters: AuditLogFilters;
  page: number;
  limit: number;
}

export class GetAuditLogsUseCase {
  constructor(private readonly auditLogRepository: IAuditLogRepository) {}

  async execute(command: GetAuditLogsCommand): Promise<AuditLogPage> {
    return this.auditLogRepository.findAll(command.filters, command.page, command.limit);
  }
}
