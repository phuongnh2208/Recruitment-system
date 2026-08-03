import { Application } from "../../../application/domain/entities/application";
import { IJobPostingRepository } from "../../../job/domain/repositories/job-posting-repository";
import { IEmployerRepository } from "../../domain/repositories/employer-repository";
import {
  ValidationException,
  AuthenticationException,
  NotFoundException,
  BusinessException,
  InfrastructureException,
} from "../../../../common/exceptions";
import { logger } from "../../../../common/logger";

export interface IApplicationRepository {
  findById(id: string): Promise<Application | null>;
}

export interface ViewApplicantDetailsCommand {
  employerId: string;
  applicationId: string;
}

export interface ViewApplicantDetailsResult {
  application: Application;
}

export class ViewApplicantDetailsUseCase {
  constructor(
    private readonly applicationRepository: IApplicationRepository,
    private readonly jobPostingRepository: IJobPostingRepository,
    private readonly employerRepository: IEmployerRepository,
  ) {}

  async execute(command: ViewApplicantDetailsCommand): Promise<ViewApplicantDetailsResult> {
    try {
      if (!command.employerId || command.employerId.trim().length === 0) {
        logger.warn("Validation Failure – employerId is required");
        throw new ValidationException("employerId is required");
      }

      if (!command.applicationId || command.applicationId.trim().length === 0) {
        logger.warn("Validation Failure – applicationId is required");
        throw new ValidationException("applicationId is required");
      }

      logger.debug(
        {
          employerId: command.employerId,
          applicationId: command.applicationId,
        },
        "Applicant Detail Requested",
      );

      const application = await this.applicationRepository.findById(command.applicationId);

      if (!application) {
        logger.warn(
          {
            applicationId: command.applicationId,
          },
          "Applicant Not Found",
        );
        throw new NotFoundException("Application not found");
      }

      const job = await this.jobPostingRepository.findById(application.jobPostingId);

      if (!job) {
        logger.warn(
          {
            jobPostingId: application.jobPostingId,
            applicationId: command.applicationId,
          },
          "Job Not Found",
        );
        throw new NotFoundException(`Job posting ${application.jobPostingId} not found`);
      }

      // Resolve User.id → EmployerProfile.id before comparing ownership.
      const employerProfile = await this.employerRepository.findByUserId(command.employerId);
      if (!employerProfile?.id) {
        logger.warn(
          {
            employerId: command.employerId,
          },
          "Employer Profile Not Found",
        );
        throw new NotFoundException(`Employer profile for user ${command.employerId} not found`);
      }

      if (job.employerId !== employerProfile.id) {
        logger.warn(
          {
            employerId: command.employerId,
            applicationId: command.applicationId,
          },
          "Unauthorized Applicant Access",
        );
        throw new AuthenticationException(
          "You are not authorized to view this applicant's details",
        );
      }

      logger.info(
        {
          applicationId: command.applicationId,
          employerId: command.employerId,
        },
        "Applicant Detail Loaded",
      );

      return { application };
    } catch (error) {
      if (
        error instanceof ValidationException ||
        error instanceof AuthenticationException ||
        error instanceof NotFoundException ||
        error instanceof BusinessException ||
        error instanceof InfrastructureException
      ) {
        throw error;
      }

      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      const errorStack = error instanceof Error ? error.stack : undefined;

      logger.error(
        {
          error: errorMessage,
          ...(errorStack && { stack: errorStack }),
        },
        "Unexpected Error during applicant detail retrieval",
      );

      const details: Record<string, unknown> = {
        message: errorMessage,
        ...(errorStack && { stack: errorStack }),
      };

      throw new InfrastructureException("Failed to retrieve applicant details", details);
    }
  }
}
