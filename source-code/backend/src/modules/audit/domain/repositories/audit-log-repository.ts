/**
 * IAuditLogRepository — Domain repository interface for AuditLog.
 *
 * ═══════════════════════════════════════════════════════════════════
 * DOMAIN LAYER
 * ═══════════════════════════════════════════════════════════════════
 *
 * This interface belongs to the Domain layer. It defines the contract
 * for persisting and querying AuditLog entries without depending on
 * any concrete infrastructure (Prisma, SQL, etc.). The Infrastructure
 * layer provides the actual implementation.
 *
 * ═══════════════════════════════════════════════════════════════════
 * APPEND-ONLY (BR-10)
 * ═══════════════════════════════════════════════════════════════════
 *
 * Audit logs are append-only. There is intentionally NO update or
 * delete method — entries can only be created and read.
 *
 * @category Domain Repository
 */

import { AuditLog } from "../entities/audit-log";

/**
 * Filters supported when querying audit logs.
 */
export interface AuditLogFilters {
  /** Filter by actor (user) ID. */
  actorId?: string;
  /** Filter by action name (e.g. "LOGIN", "JOB_APPROVED"). */
  action?: string;
  /** Include entries at or after this date. */
  dateFrom?: Date;
  /** Include entries at or before this date. */
  dateTo?: Date;
}

/**
 * Paginated result returned by {@link IAuditLogRepository.findAll}.
 */
export interface AuditLogPage {
  items: AuditLog[];
  total: number;
}

/**
 * Contract for AuditLog persistence.
 */
export interface IAuditLogRepository {
  /**
   * Append a new audit log entry.
   *
   * @param log - The immutable AuditLog entity to persist.
   */
  create(log: AuditLog): Promise<void>;

  /**
   * Query audit logs with optional filters and pagination.
   *
   * @param filters - Optional filters (actorId, action, date range).
   * @param page - 1-based page number.
   * @param limit - Maximum number of items per page.
   * @returns A paginated list of audit logs plus the total count.
   */
  findAll(filters: AuditLogFilters, page: number, limit: number): Promise<AuditLogPage>;
}
