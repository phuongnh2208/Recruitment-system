import { IJobPostingRepository } from "../../domain/repositories/job-posting-repository";
import {
  ValidationException,
  NotFoundException,
  InfrastructureException,
} from "../../../../common/exceptions";
import { logger } from "../../../../common/logger";

export interface GetJobDetailCommand {
  jobId: string;
}

export interface GetJobDetailResult {
  id: string;
  employerId: string;
  title: string;
  description: string;
  requirements: string;
  location: string;
  salaryMin: number | null;
  salaryMax: number | null;
  currency: string;
  state: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class GetJobDetailUseCase {
  constructor(private readonly jobPostingRepository: IJobPostingRepository) {}

  async execute(command: GetJobDetailCommand): Promise<GetJobDetailResult> {
    logger.debug({ jobId: command.jobId }, "Get Job Detail Requested");

    try {
      if (!command.jobId) {
        throw new ValidationException("jobId is required");
      }

      const job = await this.jobPostingRepository.findById(command.jobId);

      if (!job) {
        throw new NotFoundException("Job posting not found");
      }

      return {
        id: job.id!,
        employerId: job.employerId,
        title: job.title,
        description: job.description,
        requirements: job.requirements,
        location: job.location,
        salaryMin: job.salaryMin,
        salaryMax: job.salaryMax,
        currency: job.currency,
        state: job.state.value,
        expiresAt: job.expiresAt,
        createdAt: job.createdAt,
        updatedAt: job.updatedAt,
      };
    } catch (error) {
      if (
        error instanceof ValidationException ||
        error instanceof NotFoundException ||
        error instanceof InfrastructureException
      ) {
        throw error;
      }
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      logger.error({ error: errorMessage }, "Unexpected Error in GetJobDetailUseCase");
      throw new InfrastructureException("Failed to get job detail", { message: errorMessage });
    }
  }
}
