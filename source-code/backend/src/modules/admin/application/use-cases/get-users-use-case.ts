import {
  IAdminRepository,
  UserListItem,
  PaginatedResult,
  UserListFilters,
} from "../../domain/repositories/admin-repository";
import { InfrastructureException } from "../../../../common/exceptions";
import { logger } from "../../../../common/logger";

export interface GetUsersCommand {
  page: number;
  limit: number;
  search?: string;
  role?: string;
  status?: string;
}

export class GetUsersUseCase {
  constructor(private readonly adminRepository: IAdminRepository) {}

  async execute(command: GetUsersCommand): Promise<PaginatedResult<UserListItem>> {
    try {
      logger.debug(
        {
          page: command.page,
          limit: command.limit,
          search: command.search,
          role: command.role,
          status: command.status,
        },
        "Get Users Requested",
      );

      const filters: UserListFilters = {};
      if (command.search) filters.search = command.search;
      if (command.role) filters.role = command.role;
      if (command.status) filters.status = command.status;

      const result = await this.adminRepository.getUsers(command.page, command.limit, filters);

      logger.info(
        { total: result.total, page: result.page, limit: result.limit },
        "Users Retrieved Successfully",
      );

      return result;
    } catch (error) {
      if (error instanceof InfrastructureException) {
        throw error;
      }

      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      logger.error({ error: errorMessage }, "Unexpected Error during user retrieval");

      throw new InfrastructureException("Failed to retrieve users");
    }
  }
}
