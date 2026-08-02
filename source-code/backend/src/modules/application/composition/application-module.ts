/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * APPLICATION MODULE — COMPOSITION ROOT
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * This file is the **Composition Root** for the Application Module.
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 * COMPOSITION ROOT
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * The Composition Root is the single, dedicated place in the application where
 * the dependency graph is assembled. It is the **only** place that is allowed
 * to:
 *
 *   - Instantiate concrete classes (`new PrismaApplicationRepository(...)`,
 *     `new ApplicationFactory()`, `new ApplyJobUseCase(...)`, etc.)
 *   - Resolve the order of dependency creation
 *   - Wire abstractions to their concrete implementations
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 * DEPENDENCY INJECTION
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Dependency Injection (DI) is a technique where an object receives its
 * dependencies from an external source rather than creating them itself.
 * The Composition Root is where this "external source" lives.
 *
 *   ✅ Correct:
 *      // Composition Root (this file)
 *      const repo = new PrismaApplicationRepository(prisma);
 *      const useCase = new ApplyJobUseCase(repo, ...);
 *
 *   ❌ Wrong:
 *      // Inside a Use Case or Controller
 *      const repo = new PrismaApplicationRepository(prisma); // DO NOT DO THIS
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 * INVERSION OF CONTROL
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Inversion of Control (IoC) means that high-level modules (Use Cases) do not
 * control the creation of their dependencies. Instead, control is "inverted"
 * by giving the Composition Root the responsibility of supplying dependencies
 * to the modules that need them.
 *
 *   ┌──────────────────────┐
 *   │ Composition Root     │  ← Controls instantiation and wiring
 *   │ (this file)          │
 *   └──────┬───────┬───────┘
 *          │       │
 *          ▼       ▼
 *   ┌──────────┐ ┌──────────┐
 *   │ Use Case │ │ Use Case │  ← Receive ready-to-use dependencies
 *   └──────────┘ └──────────┘
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 * WHY ONLY THE COMPOSITION ROOT MAY USE `new`
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * 1. **Testability** – Use Cases and Controllers can be tested in isolation
 *    by passing mock/stub dependencies in unit tests.
 *
 * 2. **Single Responsibility** – No class should be responsible for both
 *    doing its job AND constructing its dependencies.
 *
 * 3. **Maintainability** – Changing a dependency (e.g. replacing a repository
 *    implementation) requires changing exactly one file: the Composition Root.
 *
 * 4. **Consistency** – All dependencies are wired in a predictable order,
 *    making the dependency graph easy to reason about.
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 * DEPENDENCY GRAPH (BUILD ORDER)
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 *   PrismaClient (injected)
 *       ↓
 *   PrismaApplicationRepository
 *       ↓
 *   ApplicationFactory
 *       ↓
 *   ApplyJobUseCase
 *   UpdateApplicationStatusUseCase
 *   WithdrawApplicationUseCase
 *       ↓
 *   ApplicationController
 *       ↓
 *   ApplicationRouter (createApplicationRouter)
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 * NO BUSINESS LOGIC
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * This file contains ZERO business logic:
 *   ✗ No validation
 *   ✗ No database queries
 *   ✗ No authentication / authorisation decisions
 *   ✗ No application operations
 *   ✗ No job operations
 *
 * Its sole purpose is wiring.
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * @module ApplicationModule
 * @category Composition Root
 */

// ── Generated Prisma ──────────────────────────────────────────────────────────
import { PrismaClient } from "../../../generated/prisma";

// ── Common ────────────────────────────────────────────────────────────────────
import { createAuthGuard, requireRoles } from "../../../common/guards";
import type { Router } from "express";

// ── Domain ────────────────────────────────────────────────────────────────────
import { ApplicationFactory } from "../domain/factories/application-factory";

// ── Infrastructure ────────────────────────────────────────────────────────────
import { PrismaApplicationRepository } from "../infrastructure/repositories/prisma-application-repository";
import { PrismaEmployerRepository } from "../../employer/infrastructure/repositories/prisma-employer-repository";
import { PrismaStudentProfileRepository } from "../../student/infrastructure/repositories/prisma-student-repository";

// ── Application — Use Cases ───────────────────────────────────────────────────
import { ApplyJobUseCase } from "../application/use-cases/apply-job-use-case";
import { UpdateApplicationStatusUseCase } from "../application/use-cases/update-application-status-use-case";
import { WithdrawApplicationUseCase } from "../application/use-cases/withdraw-application-use-case";

// ── Job Module — Domain Interface ─────────────────────────────────────────────
import type { IJobPostingRepository } from "../../job/domain/repositories/job-posting-repository";

// ── Presentation ──────────────────────────────────────────────────────────────
import { ApplicationController } from "../presentation/controllers/application-controller";
import { createApplicationRouter } from "../presentation/routes/application-routes";

// ──────────────────────────────────────────────────────────────────────────────
// TYPES
// ──────────────────────────────────────────────────────────────────────────────

/**
 * The public interface returned by {@link createApplicationModule}.
 *
 * Provides access to the fully-wired ApplicationController, ApplicationRouter,
 * and individual Use Cases (useful for testing or composing with other modules).
 */
export interface ApplicationModuleDependencies {
  prisma: PrismaClient;
  jobPostingRepository: IJobPostingRepository;
  authGuard?: ReturnType<typeof createAuthGuard>;
  roleGuard?: typeof requireRoles;
}

export interface ApplicationModule {
  /** The fully-wired ApplicationController instance. */
  controller: ApplicationController;

  /** Shared repositories owned by this module. */
  repositories: {
    applicationRepository: PrismaApplicationRepository;
  };

  /** The Express Router with all application routes registered. */
  router: Router;

  /** All use cases exposed for testing or cross-module composition. */
  useCases: {
    applyJob: ApplyJobUseCase;
    updateApplicationStatus: UpdateApplicationStatusUseCase;
    withdrawApplication: WithdrawApplicationUseCase;
  };
}

// ──────────────────────────────────────────────────────────────────────────────
// FACTORY
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Build the complete Application Module dependency graph.
 *
 * This is the **only** place where concrete implementations of application-related
 * abstractions are instantiated. All dependencies are wired in the correct
 * order following the module's dependency graph.
 *
 * @param deps - The dependencies required to build the module.
 * @returns A {@link ApplicationModule} containing the controller, router, and
 *          all use cases.
 *
 * @throws {Error} If authGuard or roleGuard are not provided.
 *
 * @example
 * ```typescript
 * // In main.ts
 * import { PrismaClient } from "./generated/prisma";
 * import { createApplicationModule } from "./modules/application/composition";
 * import { createAuthGuard, requireRoles } from "./common/guards";
 * import { JwtTokenProvider } from "./infrastructure/security/jwt-token-provider";
 *
 * const prisma = new PrismaClient();
 * const tokenProvider = new JwtTokenProvider();
 * const authGuard = createAuthGuard(tokenProvider);
 * const roleGuard = requireRoles;
 *
 * const applicationModule = createApplicationModule({
 *   prisma,
 *   jobPostingRepository,
 *   authGuard,
 *   roleGuard,
 * });
 * app.use("/api/v1", applicationModule.router);
 * ```
 */
export function createApplicationModule(deps: ApplicationModuleDependencies): ApplicationModule {
  // ── 1. Infrastructure Layer ────────────────────────────────────────
  //     1a. Repository ─────────────────────────────────────────────────
  const applicationRepository = new PrismaApplicationRepository(deps.prisma);
  const employerRepository = new PrismaEmployerRepository(deps.prisma);
  const studentProfileRepository = new PrismaStudentProfileRepository(deps.prisma);

  // ── 2. Application Layer (Use Cases) ───────────────────────────────
  const applyJobUseCase = new ApplyJobUseCase(
    applicationRepository,
    deps.jobPostingRepository,
    studentProfileRepository,
    new ApplicationFactory(),
  );

  const updateApplicationStatusUseCase = new UpdateApplicationStatusUseCase(
    applicationRepository,
    deps.jobPostingRepository,
    employerRepository,
  );

  const withdrawApplicationUseCase = new WithdrawApplicationUseCase(applicationRepository);

  // ── 3. Presentation Layer ──────────────────────────────────────────
  const controller = new ApplicationController(
    applyJobUseCase,
    updateApplicationStatusUseCase,
    withdrawApplicationUseCase,
  );

  // ── 4. Router ──────────────────────────────────────────────────────
  const authGuard = deps.authGuard;
  const roleGuard = deps.roleGuard;

  if (!authGuard || !roleGuard) {
    throw new Error("createApplicationModule: authGuard and roleGuard are required.");
  }

  const router = createApplicationRouter(controller, authGuard, roleGuard);

  // ── 5. Return ──────────────────────────────────────────────────────
  return {
    controller,
    repositories: {
      applicationRepository,
    },
    router,
    useCases: {
      applyJob: applyJobUseCase,
      updateApplicationStatus: updateApplicationStatusUseCase,
      withdrawApplication: withdrawApplicationUseCase,
    },
  };
}
