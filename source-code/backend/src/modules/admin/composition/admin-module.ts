/**
 * Admin Module Composition Root
 *
 * ═══════════════════════════════════════════════════════════════════
 * COMPOSITION ROOT
 * ═══════════════════════════════════════════════════════════════════
 *
 * The Composition Root is the single entry point where all dependencies
 * for the Admin module are wired together. It is the **only** place
 * permitted to use the `new` keyword to instantiate concrete classes.
 *
 * All layers (Infrastructure, Domain, Application, Presentation) are
 * assembled here following Clean Architecture principles.
 *
 * ═══════════════════════════════════════════════════════════════════
 * DEPENDENCY INJECTION
 * ═══════════════════════════════════════════════════════════════════
 *
 * - Only constructor injection is used.
 * - No Service Locator pattern.
 * - No IoC framework.
 * - No global variables.
 * - No singletons.
 *
 * Every dependency is passed explicitly from the outside (App level)
 * via the `createAdminModule(...)` function.
 *
 * ═══════════════════════════════════════════════════════════════════
 * CLEAN ARCHITECTURE BOUNDARY ENFORCEMENT
 * ═══════════════════════════════════════════════════════════════════
 *
 * - Controllers, Routers, Use Cases, and Repositories do NOT create
 *   their own dependencies.
 * - `new` is used ONLY in this file to wire the object graph.
 * - Prisma is imported ONLY in the infrastructure layer — never here.
 * - Domain remains pure with zero external dependencies.
 *
 * ═══════════════════════════════════════════════════════════════════
 * DEPENDENCY GRAPH
 * ═══════════════════════════════════════════════════════════════════
 *
 *   PrismaClient (from App level)
 *         │
 *         ▼
 *   ┌─────────────────────────────┐
 *   │  PrismaAdminRepository      │
 *   └──────────┬──────────────────┘
 *              │
 *              ▼
 *   ┌─────────────────────────────┐
 *   │  VerifyEmployerUseCase      │
 *   │  ApproveJobPostingUseCase   │
 *   │  RejectJobPostingUseCase    │
 *   │  ManageUserAccountUseCase   │
 *   │  GetDashboardStatsUseCase   │
 *   └──────────┬──────────────────┘
 *              │
 *              ▼
 *   ┌─────────────────────────────┐
 *   │  AdminController            │
 *   └──────────┬──────────────────┘
 *              │
 *              ▼
 *   ┌─────────────────────────────┐
 *   │  AdminRouter                │
 *   └─────────────────────────────┘
 *
 * @category Composition Root
 */

import { PrismaClient } from "../../../generated/prisma";
import type { Request, Response, NextFunction } from "express";

// ── Infrastructure Layer ──────────────────────────────────────────
import { PrismaAdminRepository } from "../infrastructure/repositories/prisma-admin-repository";

// ── Application Layer ─────────────────────────────────────────────
import { VerifyEmployerUseCase } from "../application/use-cases/verify-employer-use-case";
import { ApproveJobPostingUseCase } from "../application/use-cases/approve-job-posting-use-case";
import { RejectJobPostingUseCase } from "../application/use-cases/reject-job-posting-use-case";
import { ManageUserAccountUseCase } from "../application/use-cases/manage-user-account-use-case";
import { GetDashboardStatsUseCase } from "../application/use-cases/get-dashboard-stats-use-case";

// ── Presentation Layer ────────────────────────────────────────────
import { AdminController } from "../presentation/controllers/admin-controller";
import { createAdminRouter } from "../presentation/routes/admin-routes";

/**
 * Input dependencies provided by the App (outer) level.
 */
export interface AdminModuleDependencies {
  /** PrismaClient instance — created by the App composition root. */
  prisma: PrismaClient;
  /**
   * Authentication guard middleware.
   * Required — all admin endpoints must be protected.
   */
  authGuard: (req: Request, res: Response, next: NextFunction) => Promise<void>;
  /**
   * Role guard middleware.
   * Required — all admin endpoints require ADMIN role.
   */
  roleGuard: (req: Request, res: Response, next: NextFunction) => void;
}

/**
 * Output of the Admin Module Composition Root.
 */
export interface AdminModuleOutput {
  /** Fully wired AdminController instance. */
  controller: AdminController;
  /** Fully wired Express Router for all admin endpoints. */
  router: ReturnType<typeof createAdminRouter>;
  /** All use cases exposed for potential reuse by other modules. */
  useCases: {
    verifyEmployer: VerifyEmployerUseCase;
    approveJobPosting: ApproveJobPostingUseCase;
    rejectJobPosting: RejectJobPostingUseCase;
    manageUserAccount: ManageUserAccountUseCase;
    getDashboardStats: GetDashboardStatsUseCase;
  };
}

/**
 * Create the Admin Module with all its dependencies wired together.
 *
 * ═══════════════════════════════════════════════════════════════════
 * COMPOSITION ROOT — ONLY PLACE ALLOWED TO USE `new`
 * ═══════════════════════════════════════════════════════════════════
 *
 * This function receives dependencies from the App level and wires the
 * entire Admin module object graph. No class inside the Admin module
 * instantiates its own dependencies — everything is created here and
 * injected via constructors.
 *
 * ═══════════════════════════════════════════════════════════════════
 * DEPENDENCY INJECTION FLOW
 * ═══════════════════════════════════════════════════════════════════
 *
 *   App Level                     Admin Module Composition Root
 *   ┌──────────────────┐          ┌──────────────────────────────────┐
 *   │ PrismaClient     │────────> │ Repository                       │
 *   │ AuthGuard        │────────> │ Router (middleware)              │
 *   │ RoleGuard        │────────> │ Router (middleware)              │
 *   └──────────────────┘          └──────────────────────────────────┘
 *
 * @param deps - External dependencies injected from the App level.
 * @returns A fully wired AdminModuleOutput containing controller,
 *          router, and all use cases.
 */
export function createAdminModule(deps: AdminModuleDependencies): AdminModuleOutput {
  // ── 1. Infrastructure — Repository ────────────────────────────────
  const adminRepository = new PrismaAdminRepository(deps.prisma);

  // ── 2. Application — Use Cases ────────────────────────────────────
  const verifyEmployerUseCase = new VerifyEmployerUseCase(adminRepository);
  const approveJobPostingUseCase = new ApproveJobPostingUseCase(adminRepository);
  const rejectJobPostingUseCase = new RejectJobPostingUseCase(adminRepository);
  const manageUserAccountUseCase = new ManageUserAccountUseCase(adminRepository);
  const getDashboardStatsUseCase = new GetDashboardStatsUseCase(adminRepository);

  // ── 3. Presentation — Controller ──────────────────────────────────
  const controller = new AdminController(
    verifyEmployerUseCase,
    approveJobPostingUseCase,
    rejectJobPostingUseCase,
    manageUserAccountUseCase,
    getDashboardStatsUseCase,
  );

  // ── 4. Presentation — Router ──────────────────────────────────────
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
    },
  };
}
