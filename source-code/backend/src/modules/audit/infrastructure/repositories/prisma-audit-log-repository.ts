/**
 * PrismaAuditLogRepository — Infrastructure implementation of IAuditLogRepository.
 *
 * ═══════════════════════════════════════════════════════════════════
 * INFRASTRUCTURE LAYER
 * ═══════════════════════════════════════════════════════════════════
 *
 * This class implements the domain interface IAuditLogRepository using
 * Prisma ORM. It maps between the AuditLog domain entity and the
 * Prisma AuditLog model.
 *
 * @category Infrastructure / Repository
 */

import { PrismaClient, Prisma } from "../../../../generated/prisma";
import { AuditLog } from "../../domain/entities/audit-log";
import {
  IAuditLogRepository,
  AuditLogFilters,
  AuditLogPage,
} from "../../domain/repositories/audit-log-repository";

export class PrismaAuditLogRepository implements IAuditLogRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(log: AuditLog): Promise<void> {
    await this.prisma.auditLog.create({
      data: {
        actorId: log.actorId,
        action: log.action,
        entity: log.entity,
        entityId: log.entityId,
        metadata: (log.metadata ?? undefined) as Prisma.InputJsonValue | undefined,
        timestamp: log.timestamp,
      },
    });
  }

  async findAll(filters: AuditLogFilters, page: number, limit: number): Promise<AuditLogPage> {
    const where: Record<string, unknown> = {};

    if (filters.actorId) {
      where.actorId = filters.actorId;
    }
    if (filters.action) {
      where.action = filters.action;
    }
    if (filters.dateFrom || filters.dateTo) {
      where.timestamp = {};
      if (filters.dateFrom) {
        (where.timestamp as Record<string, unknown>).gte = filters.dateFrom;
      }
      if (filters.dateTo) {
        (where.timestamp as Record<string, unknown>).lte = filters.dateTo;
      }
    }

    const safePage = Math.max(1, page);
    const safeLimit = Math.max(1, Math.min(100, limit));

    const [rows, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        orderBy: { timestamp: "desc" },
        skip: (safePage - 1) * safeLimit,
        take: safeLimit,
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    const items = rows.map(
      (row) =>
        new AuditLog({
          id: row.id,
          actorId: row.actorId,
          action: row.action,
          entity: row.entity,
          entityId: row.entityId ?? "",
          metadata: (row.metadata ?? null) as Record<string, unknown> | null,
          timestamp: row.timestamp,
        }),
    );

    return { items, total };
  }
}
