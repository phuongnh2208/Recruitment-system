import { PrismaClient } from "../../../generated/prisma";
import type { Request, Response, NextFunction } from "express";

import { PrismaAdminRepository } from "../infrastructure/repositories/prisma-admin-repository";

import { VerifyEmployerUseCase } from "../application/use-cases/verify-employer-use-case";
import { ApproveJobPostingUseCase } from "../application/use-cases/approve-job-posting-use-case";
import { RejectJobPostingUseCase } from "../application/use-cases/reject-job-posting-use-case";
import { ManageUserAccountUseCase } from "../application/use-cases/manage-user-account-use-case";
import { GetDashboardStatsUseCase } from "../application/use-cases/get-dashboard-stats-use-case";
import { GetUsersUseCase } from "../application/use-cases/get-users-use-case";

import { AdminController } from "../presentation/controllers/admin-controller";
import { createAdminRouter } from "../presentation/routes/admin-routes";

export interface AdminModuleDependencies {
  prisma: PrismaClient;
  authGuard: (req: Request, res: Response, next: NextFunction) => Promise<void>;
  roleGuard: (req: Request, res: Response, next: NextFunction) => void;
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
  };
}

export function createAdminModule(deps: AdminModuleDependencies): AdminModuleOutput {
  const adminRepository = new PrismaAdminRepository(deps.prisma);

  const verifyEmployerUseCase = new VerifyEmployerUseCase(adminRepository);
  const approveJobPostingUseCase = new ApproveJobPostingUseCase(adminRepository);
  const rejectJobPostingUseCase = new RejectJobPostingUseCase(adminRepository);
  const manageUserAccountUseCase = new ManageUserAccountUseCase(adminRepository);
  const getDashboardStatsUseCase = new GetDashboardStatsUseCase(adminRepository);
  const getUsersUseCase = new GetUsersUseCase(adminRepository);

  const controller = new AdminController(
    verifyEmployerUseCase,
    approveJobPostingUseCase,
    rejectJobPostingUseCase,
    manageUserAccountUseCase,
    getDashboardStatsUseCase,
    getUsersUseCase,
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
    },
  };
}
