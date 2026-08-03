/**
 * AuditRoutes — Express router for admin audit log endpoints.
 *
 * ═══════════════════════════════════════════════════════════════════
 * PRESENTATION LAYER
 * ═══════════════════════════════════════════════════════════════════
 *
 * Only ADMINISTRATOR role can access these endpoints.
 *
 * @category Presentation / Routes
 */

import { Router } from "express";
import type { Request, Response, NextFunction } from "express";
import { AuditController } from "../controllers/audit-controller";

export function createAuditRouter(
  controller: AuditController,
  authGuard?: (req: Request, res: Response, next: NextFunction) => Promise<void>,
  roleGuard?: (req: Request, res: Response, next: NextFunction) => void,
): Router {
  const router = Router();

  if (!authGuard) {
    throw new Error(
      "[AuditRouter] authGuard is required. " +
        "All audit log endpoints must be protected by authentication.",
    );
  }

  if (!roleGuard) {
    throw new Error(
      "[AuditRouter] roleGuard is required. " +
        "All audit log endpoints must be protected by ADMIN role guard.",
    );
  }

  router.use(authGuard);
  router.use(roleGuard);

  router.get("/audit-logs", controller.getAuditLogs.bind(controller));

  return router;
}
