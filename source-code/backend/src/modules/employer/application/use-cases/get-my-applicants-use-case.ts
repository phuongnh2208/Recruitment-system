import { Application } from "../../../application/domain/entities/application";
import { IEmployerRepository } from "../../domain/repositories/employer-repository";
import { IJobPostingRepository } from "../../../job/domain/repositories/job-posting-repository";
import { IStudentProfileRepository } from "../../../student/domain/repositories/student-profile-repository";
import {
  ValidationException,
  BusinessException,
  InfrastructureException,
  NotFoundException,
} from "../../../../common/exceptions";
import { logger } from "../../../../common/logger";

export interface IApplicationRepository {
  findByEmployerIdPaginated(
    employerId: string,
    page: number,
    limit: number,
  ): Promise<{ items: Application[]; total: number }>;
}

export interface GetMyApplicantsCommand {
  employerId: string;
  page: number;
  limit: number;
}

const STATE_LABELS: Record<string, string> = {
  APPLIED: "Applied",
  UNDER_REVIEW: "Under Review",
  ACCEPTED: "Accepted",
  REJECTED: "Rejected",
  WITHDRAWN: "Withdrawn",
};

export interface ApplicantListItem {
  id: string;
  applicantName: string;
  jobTitle: string;
  appliedDate: string;
  status: string;
}

export interface GetMyApplicantsResult {
  items: ApplicantListItem[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export class GetMyApplicantsUseCase {
  constructor(
    private readonly applicationRepository: IApplicationRepository,
    private readonly employerRepository: IEmployerRepository,
    private readonly jobPostingRepository: IJobPostingRepository,
    private readonly studentProfileRepository: IStudentProfileRepository,
  ) {}

  async execute(command: GetMyApplicantsCommand): Promise<GetMyApplicantsResult> {
    try {
      if (!command.employerId || command.employerId.trim().length === 0) {
        logger.warn("Validation Failure – employerId is required");
        throw new ValidationException("employerId is required");
      }

      if (command.page < 1) {
        logger.warn("Validation Failure – page must be >= 1");
        throw new ValidationException("page must be >= 1");
      }

      if (command.limit < 1) {
        logger.warn("Validation Failure – limit must be >= 1");
        throw new ValidationException("limit must be >= 1");
      }

      logger.debug(
        {
          employerId: command.employerId,
          page: command.page,
          limit: command.limit,
        },
        "Applicants Requested",
      );

      const employerProfile = await this.employerRepository.findByUserId(command.employerId);

      if (!employerProfile?.id) {
        logger.warn({ userId: command.employerId }, "Employer profile not found");
        throw new NotFoundException(`Employer profile for user ${command.employerId} not found`);
      }

      const { items, total } = await this.applicationRepository.findByEmployerIdPaginated(
        employerProfile.id,
        command.page,
        command.limit,
      );

      const totalPages = Math.ceil(total / command.limit);

      const enrichedItems: ApplicantListItem[] = await Promise.all(
        items.map(async (application) => {
          const [job, student] = await Promise.all([
            this.jobPostingRepository.findById(application.jobPostingId),
            this.studentProfileRepository.findById(application.studentId),
          ]);

          return {
            id: application.id!,
            applicantName: student?.fullName ?? "Unknown",
            jobTitle: job?.title ?? "Unknown",
            appliedDate: application.appliedAt.toISOString(),
            status: STATE_LABELS[application.state.value],
          };
        }),
      );

      logger.info(
        {
          employerId: employerProfile.id,
          count: items.length,
          page: command.page,
        },
        "Applicants Loaded",
      );

      return {
        items: enrichedItems,
        page: command.page,
        limit: command.limit,
        total,
        totalPages,
      };
    } catch (error) {
      if (
        error instanceof ValidationException ||
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
        "Unexpected Error during applicants retrieval",
      );

      const details: Record<string, unknown> = {
        message: errorMessage,
        ...(errorStack && { stack: errorStack }),
      };

      throw new InfrastructureException("Failed to retrieve applicants", details);
    }
  }
}
