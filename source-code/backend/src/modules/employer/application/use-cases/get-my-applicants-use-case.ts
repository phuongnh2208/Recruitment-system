import { Application } from "../../../application/domain/entities/application";
import {
  ValidationException,
  BusinessException,
  InfrastructureException,
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

export interface GetMyApplicantsResult {
  items: Application[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export class GetMyApplicantsUseCase {
  constructor(private readonly applicationRepository: IApplicationRepository) {}

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

      const { items, total } = await this.applicationRepository.findByEmployerIdPaginated(
        command.employerId,
        command.page,
        command.limit,
      );

      const totalPages = Math.ceil(total / command.limit);

      logger.info(
        {
          employerId: command.employerId,
          count: items.length,
          page: command.page,
        },
        "Applicants Loaded",
      );

      return {
        items,
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
