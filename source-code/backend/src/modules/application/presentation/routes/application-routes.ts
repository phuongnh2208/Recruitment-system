import { Router } from "express";
import type { Request, Response, NextFunction } from "express";
import { ApplicationController } from "../controllers/application-controller";
import { Role } from "../../../../common/types/role";

export function createApplicationRouter(
  controller: ApplicationController,
  authGuard?: (req: Request, res: Response, next: NextFunction) => Promise<void>,
  roleGuard?: (
    ...allowedRoles: Role[]
  ) => (req: Request, res: Response, next: NextFunction) => void,
): Router {
  const router = Router();

  if (!authGuard) {
    throw new Error("createApplicationRouter: authGuard is required but was not provided.");
  }

  if (!roleGuard) {
    throw new Error("createApplicationRouter: roleGuard is required but was not provided.");
  }

  router.use(authGuard);

  router.post("/applications", roleGuard(Role.STUDENT), controller.applyJob.bind(controller));
  router.patch(
    "/applications/:applicationId/status",
    roleGuard(Role.EMPLOYER),
    controller.updateApplicationStatus.bind(controller),
  );
  router.patch(
    "/applications/:applicationId/withdraw",
    roleGuard(Role.STUDENT),
    controller.withdrawApplication.bind(controller),
  );

  return router;
}
