/**
 * Student Module Composition Root
 *
 * ═══════════════════════════════════════════════════════════════════
 * COMPOSITION ROOT
 * ═══════════════════════════════════════════════════════════════════
 *
 * The Composition Root is the single entry point where all dependencies
 * for the Student module are wired together. It is the **only** place
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
 * via the `createStudentModule(...)` function.
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
 *   │  PrismaStudentProfileRepo   │
 *   │  PrismaCVRepository         │
 *   └──────────┬──────────────────┘
 *              │
 *              ▼
 *   ┌─────────────────────────────┐
 *   │  StudentProfileFactory      │
 *   │  CVMetadataFactory          │
 *   └──────────┬──────────────────┘
 *              │
 *              ▼
 *   ┌─────────────────────────────┐
 *   │  UpdateProfileUseCase       │
 *   │  UploadCVUseCase            │
 *   │  ManageCVListUseCase        │
 *   │  GetApplicationHistoryUC    │
 *   │  GetJobDetailUseCase        │
 *   └──────────┬──────────────────┘
 *              │
 *              ▼
 *   ┌─────────────────────────────┐
 *   │  StudentController          │
 *   └──────────┬──────────────────┘
 *              │
 *              ▼
 *   ┌─────────────────────────────┐
 *   │  StudentRouter              │
 *   └─────────────────────────────┘
 *
 * @category Composition Root
 */

import { PrismaClient } from "../../../generated/prisma";
import { IFileStorageStrategy } from "../../../common/interfaces/file-storage-strategy";
import type { Request, Response, NextFunction } from "express";

// ── Infrastructure Layer ──────────────────────────────────────────
import { PrismaStudentProfileRepository } from "../infrastructure/repositories/prisma-student-repository";
import { PrismaCVRepository } from "../infrastructure/repositories/prisma-cv-repository";

// ── Domain Layer ──────────────────────────────────────────────────
import { StudentProfileFactory } from "../domain/factories/student-profile-factory";
import { CVMetadataFactory } from "../domain/factories/cv-metadata-factory";

// ── Application Layer ─────────────────────────────────────────────
import { UpdateProfileUseCase } from "../application/use-cases/update-profile-use-case";
import { UploadCVUseCase } from "../application/use-cases/upload-cv-use-case";
import { ManageCVListUseCase } from "../application/use-cases/manage-cv-list-use-case";
import {
  GetApplicationHistoryUseCase,
  IApplicationRepository,
} from "../application/use-cases/get-application-history-use-case";
import {
  GetJobDetailUseCase,
  IJobRepository,
} from "../application/use-cases/get-job-detail-use-case";

// ── Presentation Layer ────────────────────────────────────────────
import { StudentController } from "../presentation/controllers/student-controller";
import { createStudentRouter } from "../presentation/routes/student-routes";

/**
 * Input dependencies provided by the App (outer) level.
 */
export interface StudentModuleDependencies {
  /** PrismaClient instance — created by the App composition root. */
  prisma: PrismaClient;
  /** File storage strategy — created by the App composition root. */
  fileStorage: IFileStorageStrategy;
  /**
   * Optional: Repository for Application entity.
   * TODO: Create ApplicationHistoryRepository in the Application module.
   * Currently no concrete implementation exists — this must be provided
   * from the App level when it becomes available.
   */
  applicationRepository?: IApplicationRepository;
  /**
   * Optional: Repository for JobPosting entity.
   * TODO: Create JobRepository in the Job module.
   * Currently no concrete implementation exists — this must be provided
   * from the App level when it becomes available.
   */
  jobRepository?: IJobRepository;
  /**
   * Optional: Authentication guard middleware.
   * If not provided, the router will skip auth protection (dev mode).
   */
  authGuard?: (req: Request, res: Response, next: NextFunction) => Promise<void>;
  /**
   * Optional: Role guard middleware.
   * If not provided, the router will skip role checks (dev mode).
   */
  roleGuard?: (req: Request, res: Response, next: NextFunction) => void;
}

/**
 * Output of the Student Module Composition Root.
 */
export interface StudentModuleOutput {
  /** Fully wired StudentController instance. */
  controller: StudentController;
  /** Fully wired Express Router for all student endpoints. */
  router: ReturnType<typeof createStudentRouter>;
  /** All use cases exposed for potential reuse by other modules. */
  useCases: {
    updateProfile: UpdateProfileUseCase;
    uploadCV: UploadCVUseCase;
    manageCVList: ManageCVListUseCase;
    getApplicationHistory: GetApplicationHistoryUseCase;
    getJobDetail: GetJobDetailUseCase;
  };
}

/**
 * Create the Student Module with all its dependencies wired together.
 *
 * ═══════════════════════════════════════════════════════════════════
 * COMPOSITION ROOT — ONLY PLACE ALLOWED TO USE `new`
 * ═══════════════════════════════════════════════════════════════════
 *
 * This function receives dependencies from the App level and wires the
 * entire Student module object graph. No class inside the Student module
 * instantiates its own dependencies — everything is created here and
 * injected via constructors.
 *
 * ═══════════════════════════════════════════════════════════════════
 * DEPENDENCY INJECTION FLOW
 * ═══════════════════════════════════════════════════════════════════
 *
 *   App Level                     Student Module Composition Root
 *   ┌──────────────────┐          ┌──────────────────────────────────┐
 *   │ PrismaClient     │────────> │ Repositories                     │
 *   │ FileStorage      │────────> │ UseCases                         │
 *   │ AuthGuard        │────────> │ Router (middleware)              │
 *   │ RoleGuard        │────────> │ Router (middleware)              │
 *   └──────────────────┘          └──────────────────────────────────┘
 *
 * @param deps - External dependencies injected from the App level.
 * @returns A fully wired StudentModuleOutput containing controller,
 *          router, and all use cases.
 */
export function createStudentModule(deps: StudentModuleDependencies): StudentModuleOutput {
  // ── 1. Infrastructure — Repositories ──────────────────────────────
  const studentProfileRepository = new PrismaStudentProfileRepository(deps.prisma);
  const cvRepository = new PrismaCVRepository(deps.prisma);

  // ── 2. Domain — Factories ─────────────────────────────────────────
  const studentProfileFactory = new StudentProfileFactory();
  const cvMetadataFactory = new CVMetadataFactory();

  // ── 3. Application — Use Cases ────────────────────────────────────
  const updateProfileUseCase = new UpdateProfileUseCase(
    studentProfileRepository,
    studentProfileFactory,
  );

  const uploadCVUseCase = new UploadCVUseCase(
    studentProfileRepository,
    cvRepository,
    cvMetadataFactory,
    deps.fileStorage,
  );

  const manageCVListUseCase = new ManageCVListUseCase(cvRepository, deps.fileStorage);

  // ── GetApplicationHistoryUseCase ──────────────────────────────────
  // TODO: Create a concrete ApplicationHistoryRepository in the
  // Application module and wire it here. Currently the use case
  // depends on IApplicationRepository which must be provided from
  // the App level since no implementation exists in this module.
  if (!deps.applicationRepository) {
    throw new Error(
      "[StudentModule] applicationRepository is required. " +
        "Please provide an IApplicationRepository implementation from the App level. " +
        "TODO: Create ApplicationHistoryRepository in the Application module.",
    );
  }
  const getApplicationHistoryUseCase = new GetApplicationHistoryUseCase(deps.applicationRepository);

  // ── GetJobDetailUseCase ───────────────────────────────────────────
  // TODO: Create a concrete JobRepository in the Job module and wire
  // it here. Currently the use case depends on IJobRepository which
  // must be provided from the App level since no implementation
  // exists in this module.
  if (!deps.jobRepository) {
    throw new Error(
      "[StudentModule] jobRepository is required. " +
        "Please provide an IJobRepository implementation from the App level. " +
        "TODO: Create JobRepository in the Job module.",
    );
  }
  const getJobDetailUseCase = new GetJobDetailUseCase(deps.jobRepository);

  // ── 4. Presentation — Controller ──────────────────────────────────
  const controller = new StudentController(
    updateProfileUseCase,
    uploadCVUseCase,
    manageCVListUseCase,
    getApplicationHistoryUseCase,
    getJobDetailUseCase,
  );

  // ── 5. Presentation — Router ──────────────────────────────────────
  const router = createStudentRouter(controller, deps.authGuard, deps.roleGuard);

  return {
    controller,
    router,
    useCases: {
      updateProfile: updateProfileUseCase,
      uploadCV: uploadCVUseCase,
      manageCVList: manageCVListUseCase,
      getApplicationHistory: getApplicationHistoryUseCase,
      getJobDetail: getJobDetailUseCase,
    },
  };
}
