/**
 * AuditController — HTTP adapter for audit log queries.
 *
 * ═══════════════════════════════════════════════════════════════════
 * PRESENTATION LAYER
 * ═══════════════════════════════════════════════════════════════════
 *
 * This controller only delegates to the GetAuditLogsUseCase and formats
 * the HTTP response. It contains NO business logic.
 *
 * @category Presentation / Controller
 */

import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { GetAuditLogsUseCase } from "../../application/use-cases/get-audit-logs-use-case";

export class AuditController {
  private readonly getAuditLogsQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    actorId: z.string().optional(),
    action: z.string().optional(),
    dateFrom: z.coerce.date().optional(),
    dateTo: z.coerce.date().optional(),
  });

  constructor(private readonly getAuditLogsUseCase: GetAuditLogsUseCase) {}

  async getAuditLogs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = this.getAuditLogsQuerySchema.parse(req.query);

      const result = await this.getAuditLogsUseCase.execute({
        filters: {
          actorId: query.actorId,
          action: query.action,
          dateFrom: query.dateFrom,
          dateTo: query.dateTo,
        },
        page: query.page,
        limit: query.limit,
      });

      res.status(200).json({
        success: true,
        data: {
          items: result.items.map((log) => ({
            id: log.id,
            actorId: log.actorId,
            action: log.action,
            entity: log.entity,
            entityId: log.entityId,
            metadata: log.metadata,
            timestamp: log.timestamp,
          })),
          total: result.total,
          page: query.page,
          limit: query.limit,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
