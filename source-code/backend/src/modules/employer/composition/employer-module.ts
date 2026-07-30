import { PrismaClient } from "../../../generated/prisma";
import type { Request, Response, NextFunction } from "express";
import { PrismaEmployerRepository } from "../infrastructure/repositories/prisma-employer-repository";
import { EmployerProfileFactory } from "../domain/employer-profile-factory";
import { UpdateCompanyProfileUseCase } from "../application/use-cases/update-company-profile-use-case";
import { GetMyApplicantsUseCase } from "../application/use-cases/get-my-applicants-use-case";
import { ViewApplicantDetailsUseCase } from "../application/use-cases/view-applicant-details-use-case";
import type { IApplicationRepository } from "../application/use-cases/get-my-applicants-use-case";
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
  useCases: {
    updateCompanyProfile: UpdateCompanyProfileUseCase;
    getMyApplicants: GetMyApplicantsUseCase;
    viewApplicantDetails: ViewApplicantDetailsUseCase;
  };
}

export function createEmployerModule(deps: EmployerModuleDependencies): EmployerModuleOutput {
  const employerRepository = new PrismaEmployerRepository(deps.prisma);
  const employerProfileFactory = new EmployerProfileFactory();

  const updateCompanyProfileUseCase = new UpdateCompanyProfileUseCase(
    employerRepository,
    employerProfileFactory,
  );

  const getMyApplicantsUseCase = new GetMyApplicantsUseCase(deps.applicationRepository);

  const viewApplicantDetailsUseCase = new ViewApplicantDetailsUseCase(deps.applicationRepository);

  const controller = new EmployerController(
    updateCompanyProfileUseCase,
    getMyApplicantsUseCase,
    viewApplicantDetailsUseCase,
  );

  const router = createEmployerRouter(controller, deps.authGuard, deps.roleGuard);

  return {
    controller,
    router,
    useCases: {
      updateCompanyProfile: updateCompanyProfileUseCase,
      getMyApplicants: getMyApplicantsUseCase,
      viewApplicantDetails: viewApplicantDetailsUseCase,
    },
  };
}
