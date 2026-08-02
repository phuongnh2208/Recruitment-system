import { Router } from "express";
import type { Request, Response, NextFunction } from "express";
import { EmployerController } from "../controllers/employer-controller";

export function createEmployerRouter(
  controller: EmployerController,
  authGuard?: (req: Request, res: Response, next: NextFunction) => Promise<void>,
  roleGuard?: (req: Request, res: Response, next: NextFunction) => void,
): Router {
  const router = Router();

  if (authGuard) {
    router.use(authGuard);
  }

  if (roleGuard) {
    router.use(roleGuard);
  }

  router.get("/company-profile", controller.getCompanyProfile.bind(controller));
  router.patch("/company-profile", controller.updateCompanyProfile.bind(controller));
  router.get("/applicants", controller.getMyApplicants.bind(controller));
  router.get("/applicants/:applicationId", controller.viewApplicantDetails.bind(controller));

  return router;
}
