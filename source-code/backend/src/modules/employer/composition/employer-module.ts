import { PrismaClient } from "../../../generated/prisma";
import type { Request, Response, NextFunction } from "express";
import { PrismaEmployerRepository } from "../infrastructure/repositories/prisma-employer-repository";
import { PrismaJobPostingRepository } from "../../job/infrastructure/repositories/prisma-job-posting-repository";
import { PrismaStudentProfileRepository } from "../../student/infrastructure/repositories/prisma-student-repository";
import { PrismaCVRepository } from "../../student/infrastructure/repositories/prisma-cv-repository";
import { PrismaUserRepository } from "../../auth/infrastructure/repositories/prisma-user-repository";
import { EmployerProfileFactory } from "../domain/employer-profile-factory";
import { UpdateCompanyProfileUseCase } from "../application/use-cases/update-company-profile-use-case";
import { GetCompanyProfileUseCase } from "../application/use-cases/get-company-profile-use-case";
import { GetMyApplicantsUseCase } from "../application/use-cases/get-my-applicants-use-case";
import { ViewApplicantDetailsUseCase } from "../application/use-cases/view-applicant-details-use-case";
import { GenerateRecruitmentReportUseCase } from "../application/use-cases/generate-recruitment-report-use-case";
import type { IApplicationRepository } from "../../application/domain/repositories/application-repository";
import { EmployerController } from "../presentation/controllers/employer-controller";
import { createEmployerRouter } from "../presentation/routes/employer-routes";

export interface EmployerModuleDependencies {
  prisma: PrismaClient;
  applicationRepository: IApplicationRepository;
  authGuard?: (req: Request, res: Response, next: NextFunction) => Promise<void>;
  roleGuard?: (req: Request, res: Response, next: NextFunction) => void;
}

export interface EmployerModuleOutput {
  controller: EmployerController;
  router: ReturnType<typeof createEmployerRouter>;
  repositories: {
    employerRepository: PrismaEmployerRepository;
  };
  useCases: {
    updateCompanyProfile: UpdateCompanyProfileUseCase;
    getCompanyProfile: GetCompanyProfileUseCase;
    getMyApplicants: GetMyApplicantsUseCase;
    viewApplicantDetails: ViewApplicantDetailsUseCase;
    generateRecruitmentReport: GenerateRecruitmentReportUseCase;
  };
}

export function createEmployerModule(deps: EmployerModuleDependencies): EmployerModuleOutput {
  const employerRepository = new PrismaEmployerRepository(deps.prisma);
  const jobPostingRepository = new PrismaJobPostingRepository(deps.prisma);
  const employerProfileFactory = new EmployerProfileFactory();

  const updateCompanyProfileUseCase = new UpdateCompanyProfileUseCase(
    employerRepository,
    employerProfileFactory,
  );

  const getCompanyProfileUseCase = new GetCompanyProfileUseCase(employerRepository);

  const getMyApplicantsUseCase = new GetMyApplicantsUseCase(
    deps.applicationRepository,
    employerRepository,
    jobPostingRepository,
    new PrismaStudentProfileRepository(deps.prisma),
  );

  const viewApplicantDetailsUseCase = new ViewApplicantDetailsUseCase(
    deps.applicationRepository,
    jobPostingRepository,
    employerRepository,
    new PrismaStudentProfileRepository(deps.prisma),
    new PrismaCVRepository(deps.prisma),
    new PrismaUserRepository(deps.prisma),
  );

  const generateRecruitmentReportUseCase = new GenerateRecruitmentReportUseCase(
    employerRepository,
    jobPostingRepository,
    deps.applicationRepository,
    new PrismaStudentProfileRepository(deps.prisma),
    new PrismaUserRepository(deps.prisma),
  );

  const controller = new EmployerController(
    updateCompanyProfileUseCase,
    getCompanyProfileUseCase,
    getMyApplicantsUseCase,
    viewApplicantDetailsUseCase,
    generateRecruitmentReportUseCase,
  );

  const router = createEmployerRouter(controller, deps.authGuard, deps.roleGuard);

  return {
    controller,
    router,
    repositories: {
      employerRepository,
    },
    useCases: {
      updateCompanyProfile: updateCompanyProfileUseCase,
      getCompanyProfile: getCompanyProfileUseCase,
      getMyApplicants: getMyApplicantsUseCase,
      viewApplicantDetails: viewApplicantDetailsUseCase,
      generateRecruitmentReport: generateRecruitmentReportUseCase,
    },
  };
}
