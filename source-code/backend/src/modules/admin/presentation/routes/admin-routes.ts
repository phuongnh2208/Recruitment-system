import { Router } from "express";
import type { Request, Response, NextFunction } from "express";
import { AdminController } from "../controllers/admin-controller";

export function createAdminRouter(
  controller: AdminController,
  authGuard?: (req: Request, res: Response, next: NextFunction) => Promise<void>,
  roleGuard?: (req: Request, res: Response, next: NextFunction) => void,
): Router {
  const router = Router();

  if (!authGuard) {
    throw new Error(
      "[AdminRouter] authGuard is required. " +
        "All admin endpoints must be protected by authentication.",
    );
  }

  if (!roleGuard) {
    throw new Error(
      "[AdminRouter] roleGuard is required. " +
        "All admin endpoints must be protected by ADMIN role guard.",
    );
  }

  router.use(authGuard);
  router.use(roleGuard);

  router.get("/dashboard", controller.getDashboardStats.bind(controller));
  router.get("/users", controller.getUsers.bind(controller));
  router.patch("/employers/:employerId/verify", controller.verifyEmployer.bind(controller));
  router.patch("/jobs/:jobId/approve", controller.approveJobPosting.bind(controller));
  router.patch("/jobs/:jobId/reject", controller.rejectJobPosting.bind(controller));
  router.patch("/users/:userId/status", controller.manageUserAccount.bind(controller));

  return router;
}
