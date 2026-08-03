/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * JOB MODULE — COMPOSITION ROOT
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * This file is the **Composition Root** for the Job Module.
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 * COMPOSITION ROOT
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * The Composition Root is the single, dedicated place in the application where
 * the dependency graph is assembled. It is the **only** place that is allowed
 * to:
 *
 *   - Instantiate concrete classes (`new PrismaJobPostingRepository(...)`,
 *     `new JobPostingFactory()`, `new CreateJobPostingUseCase(...)`, etc.)
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
 *      const repo = new PrismaJobPostingRepository(prisma);
 *      const useCase = new CreateJobPostingUseCase(repo, factory);
 *
 *   ❌ Wrong:
 *      // Inside a Use Case or Controller
 *      const repo = new PrismaJobPostingRepository(prisma); // DO NOT DO THIS
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
 *   PrismaJobPostingRepository
 *       ↓
 *   JobPostingFactory
 *       ↓
 *   CreateJobPostingUseCase
 *   SubmitJobPostingUseCase
 *   UpdateJobPostingUseCase
 *   CloseJobPostingUseCase
 *   SearchJobsUseCase
 *       ↓
 *   JobController
 *       ↓
 *   JobRouter (createJobRouter)
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 * NO BUSINESS LOGIC
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * This file contains ZERO business logic:
 *   ✗ No validation
 *   ✗ No database queries
 *   ✗ No authentication / authorisation decisions
 *   ✗ No job posting operations
 *   ✗ No search logic
 *
 * Its sole purpose is wiring.
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * @module JobModule
 * @category Composition Root
 */

// ── Generated Prisma ──────────────────────────────────────────────────────────
import { PrismaClient } from "../../../generated/prisma";

// ── Common ────────────────────────────────────────────────────────────────────
import { createAuthGuard, requireRoles } from "../../../common/guards";
import type { IAuditLogger } from "../../../common/interfaces/audit-logger";
import type { Router } from "express";

// ── Domain ────────────────────────────────────────────────────────────────────
import { JobPostingFactory } from "../domain/factories/job-posting-factory";

// ── Infrastructure ────────────────────────────────────────────────────────────
import { PrismaJobPostingRepository } from "../infrastructure/repositories/prisma-job-posting-repository";
import { PrismaEmployerRepository } from "../../employer/infrastructure/repositories/prisma-employer-repository";

// ── Application — Use Cases ───────────────────────────────────────────────────
import { CreateJobPostingUseCase } from "../application/use-cases/create-job-posting-use-case";
import { SubmitJobPostingUseCase } from "../application/use-cases/submit-job-posting-use-case";
import { UpdateJobPostingUseCase } from "../application/use-cases/update-job-posting-use-case";
import { CloseJobPostingUseCase } from "../application/use-cases/close-job-posting-use-case";
import { ReopenJobPostingUseCase } from "../application/use-cases/reopen-job-posting-use-case";
import { SearchJobsUseCase } from "../application/use-cases/search-jobs-use-case";
import { GetJobDetailUseCase } from "../application/use-cases/get-job-detail-use-case";

// ── Presentation ──────────────────────────────────────────────────────────────
import { JobController } from "../presentation/controllers/job-controller";
import { createJobRouter } from "../presentation/routes/job-routes";

// ──────────────────────────────────────────────────────────────────────────────
// TYPES
// ──────────────────────────────────────────────────────────────────────────────

/**
 * The public interface returned by {@link createJobModule}.
 *
 * Provides access to the fully-wired JobController, JobRouter, and
 * individual Use Cases (useful for testing or composing with other modules).
 */
export interface JobModule {
  /** The fully-wired JobController instance. */
  controller: JobController;

  /** Shared repositories owned by this module. */
  repositories: {
    jobPostingRepository: PrismaJobPostingRepository;
  };

  /** The Express Router with all job routes registered. */
  router: Router;

  /** All use cases exposed for testing or cross-module composition. */
  useCases: {
    createJobPostingUseCase: CreateJobPostingUseCase;
    submitJobPostingUseCase: SubmitJobPostingUseCase;
    updateJobPostingUseCase: UpdateJobPostingUseCase;
    closeJobPostingUseCase: CloseJobPostingUseCase;
    reopenJobPostingUseCase: ReopenJobPostingUseCase;
    searchJobsUseCase: SearchJobsUseCase;
  };
}

// ──────────────────────────────────────────────────────────────────────────────
// FACTORY
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Build the complete Job Module dependency graph.
 *
 * This is the **only** place where concrete implementations of job-related
 * abstractions are instantiated. All dependencies are wired in the correct
 * order following the module's dependency graph.
 *
 * @param prismaClient - The shared PrismaClient instance (created once
 *                       at the application level).
 * @param authGuard - The authentication guard middleware (created from
 *                    JWT token provider). Required.
 * @param roleGuard - The role-based authorization guard middleware.
 *                    Required.
 * @returns A {@link JobModule} containing the controller, router, and
 *          all use cases.
 *
 * @throws {Error} If authGuard or roleGuard are not provided.
 *
 * @example
 * ```typescript
 * // In main.ts
 * import { PrismaClient } from "./generated/prisma";
 * import { createJobModule } from "./modules/job/composition";
 * import { createAuthGuard, requireRoles } from "./common/guards";
 * import { JwtTokenProvider } from "./infrastructure/security/jwt-token-provider";
 *
 * const prisma = new PrismaClient();
 * const tokenProvider = new JwtTokenProvider();
 * const authGuard = createAuthGuard(tokenProvider);
 * const roleGuard = requireRoles;
 *
 * const jobModule = createJobModule(prisma, authGuard, roleGuard);
 * app.use("/api/v1/jobs", jobModule.router);
 * ```
 */
export function createJobModule(
  prismaClient: PrismaClient,
  authGuard: ReturnType<typeof createAuthGuard>,
  roleGuard: typeof requireRoles,
  auditLogger?: IAuditLogger,
): JobModule {
  // ── 1. Infrastructure Layer ────────────────────────────────────────
  //     1a. Repository ─────────────────────────────────────────────────
  const jobPostingRepository = new PrismaJobPostingRepository(prismaClient);
  const employerRepository = new PrismaEmployerRepository(prismaClient);

  //     1b. Factory ────────────────────────────────────────────────────
  const jobPostingFactory = new JobPostingFactory();

  // ── 2. Application Layer (Use Cases) ───────────────────────────────
  const createJobPostingUseCase = new CreateJobPostingUseCase(
    jobPostingRepository,
    employerRepository,
    jobPostingFactory,
    auditLogger!,
  );

  const submitJobPostingUseCase = new SubmitJobPostingUseCase(
    jobPostingRepository,
    employerRepository,
  );

  const updateJobPostingUseCase = new UpdateJobPostingUseCase(
    jobPostingRepository,
    employerRepository,
    auditLogger!,
  );

  const closeJobPostingUseCase = new CloseJobPostingUseCase(
    jobPostingRepository,
    employerRepository,
  );

  const reopenJobPostingUseCase = new ReopenJobPostingUseCase(
    jobPostingRepository,
    employerRepository,
  );

  const searchJobsUseCase = new SearchJobsUseCase(jobPostingRepository, employerRepository);

  const getJobDetailUseCase = new GetJobDetailUseCase(jobPostingRepository);

  // ── 3. Presentation Layer ──────────────────────────────────────────
  const controller = new JobController(
    createJobPostingUseCase,
    submitJobPostingUseCase,
    updateJobPostingUseCase,
    closeJobPostingUseCase,
    reopenJobPostingUseCase,
    searchJobsUseCase,
    getJobDetailUseCase,
  );

  // ── 4. Router ──────────────────────────────────────────────────────
  // Guards are injected from the application level (main.ts)
  // The router validates that guards are provided and throws if not
  const router = createJobRouter(controller, authGuard, roleGuard);

  // ── 5. Return ──────────────────────────────────────────────────────
  return {
    controller,
    repositories: {
      jobPostingRepository,
    },
    router,
    useCases: {
      createJobPostingUseCase,
      submitJobPostingUseCase,
      updateJobPostingUseCase,
      closeJobPostingUseCase,
      reopenJobPostingUseCase,
      searchJobsUseCase,
    },
  };
}
