import { PrismaClient } from "../../../generated/prisma";
import type { Request, Response, NextFunction } from "express";
import type { IAuditLogger } from "../../../common/interfaces/audit-logger";
import type { INotificationStrategy } from "../../../common/interfaces/notification-strategy";

import { PrismaAdminRepository } from "../infrastructure/repositories/prisma-admin-repository";

import { VerifyEmployerUseCase } from "../application/use-cases/verify-employer-use-case";
import { ApproveJobPostingUseCase } from "../application/use-cases/approve-job-posting-use-case";
import { RejectJobPostingUseCase } from "../application/use-cases/reject-job-posting-use-case";
import { ManageUserAccountUseCase } from "../application/use-cases/manage-user-account-use-case";
import { GetDashboardStatsUseCase } from "../application/use-cases/get-dashboard-stats-use-case";
import { GetUsersUseCase } from "../application/use-cases/get-users-use-case";
import { GetPendingApprovalsUseCase } from "../application/use-cases/get-pending-approvals-use-case";

import { AdminController } from "../presentation/controllers/admin-controller";
import { createAdminRouter } from "../presentation/routes/admin-routes";

export interface AdminModuleDependencies {
  prisma: PrismaClient;
  authGuard: (req: Request, res: Response, next: NextFunction) => Promise<void>;
  roleGuard: (req: Request, res: Response, next: NextFunction) => void;
  auditLogger: IAuditLogger;
  notificationStrategy: INotificationStrategy;
}

export interface AdminModuleOutput {
  controller: AdminController;
  router: ReturnType<typeof createAdminRouter>;
  useCases: {
    verifyEmployer: VerifyEmployerUseCase;
    approveJobPosting: ApproveJobPostingUseCase;
    rejectJobPosting: RejectJobPostingUseCase;
    manageUserAccount: ManageUserAccountUseCase;
    getDashboardStats: GetDashboardStatsUseCase;
    getUsers: GetUsersUseCase;
    getPendingApprovals: GetPendingApprovalsUseCase;
  };
}

export function createAdminModule(deps: AdminModuleDependencies): AdminModuleOutput {
  const adminRepository = new PrismaAdminRepository(deps.prisma);

  const verifyEmployerUseCase = new VerifyEmployerUseCase(
    adminRepository,
    deps.auditLogger,
    deps.notificationStrategy,
  );
  const approveJobPostingUseCase = new ApproveJobPostingUseCase(
    adminRepository,
    deps.auditLogger,
    deps.notificationStrategy,
  );
  const rejectJobPostingUseCase = new RejectJobPostingUseCase(
    adminRepository,
    deps.auditLogger,
    deps.notificationStrategy,
  );
  const manageUserAccountUseCase = new ManageUserAccountUseCase(adminRepository, deps.auditLogger);
  const getDashboardStatsUseCase = new GetDashboardStatsUseCase(adminRepository);
  const getUsersUseCase = new GetUsersUseCase(adminRepository);
  const getPendingApprovalsUseCase = new GetPendingApprovalsUseCase(adminRepository);

  const controller = new AdminController(
    verifyEmployerUseCase,
    approveJobPostingUseCase,
    rejectJobPostingUseCase,
    manageUserAccountUseCase,
    getDashboardStatsUseCase,
    getUsersUseCase,
    getPendingApprovalsUseCase,
  );

  const router = createAdminRouter(controller, deps.authGuard, deps.roleGuard);

  return {
    controller,
    router,
    useCases: {
      verifyEmployer: verifyEmployerUseCase,
      approveJobPosting: approveJobPostingUseCase,
      rejectJobPosting: rejectJobPostingUseCase,
      manageUserAccount: manageUserAccountUseCase,
      getDashboardStats: getDashboardStatsUseCase,
      getUsers: getUsersUseCase,
      getPendingApprovals: getPendingApprovalsUseCase,
    },
  };
}
