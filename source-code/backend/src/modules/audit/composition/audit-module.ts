/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * AUDIT MODULE — COMPOSITION ROOT
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * This file is the **Composition Root** for the Audit Module.
 *
 * @module AuditModule
 * @category Composition Root
 */

import { PrismaClient } from "../../../generated/prisma";
import type { Router, Request, Response, NextFunction } from "express";

import { PrismaAuditLogRepository } from "../infrastructure/repositories/prisma-audit-log-repository";
import { AuditLoggerAdapter } from "../infrastructure/audit-logger-adapter";
import { IAuditLogger } from "../../../common/interfaces/audit-logger";
import { LogAuditUseCase } from "../application/use-cases/log-audit-use-case";
import { GetAuditLogsUseCase } from "../application/use-cases/get-audit-logs-use-case";
import { AuditController } from "../presentation/controllers/audit-controller";
import { createAuditRouter } from "../presentation/routes/audit-routes";

export interface AuditModuleDependencies {
  prisma: PrismaClient;
  authGuard: (req: Request, res: Response, next: NextFunction) => Promise<void>;
  roleGuard: (req: Request, res: Response, next: NextFunction) => void;
}

export interface AuditModule {
  auditLogger: IAuditLogger;
  controller: AuditController;
  router: Router;
  useCases: {
    logAudit: LogAuditUseCase;
    getAuditLogs: GetAuditLogsUseCase;
  };
}

export function createAuditModule(deps: AuditModuleDependencies): AuditModule {
  const auditLogRepository = new PrismaAuditLogRepository(deps.prisma);

  const logAuditUseCase = new LogAuditUseCase(auditLogRepository);
  const getAuditLogsUseCase = new GetAuditLogsUseCase(auditLogRepository);
  const auditLogger = new AuditLoggerAdapter(auditLogRepository);

  const controller = new AuditController(getAuditLogsUseCase);

  const router = createAuditRouter(controller, deps.authGuard, deps.roleGuard);

  return {
    auditLogger,
    controller,
    router,
    useCases: {
      logAudit: logAuditUseCase,
      getAuditLogs: getAuditLogsUseCase,
    },
  };
}
