/**
 * UpdateCompanyProfileUseCase
 *
 * Orchestrates the employer company profile update flow following Clean
 * Architecture principles. All dependencies are injected via the
 * constructor – no concrete implementations are instantiated inside the
 * use‑case.
 */

import { IEmployerRepository } from "../../domain/repositories/employer-repository";
import { EmployerProfileFactory } from "../../domain/employer-profile-factory";
import { EmployerProfile } from "../../domain/employer-profile";
import {
  ValidationException,
  BusinessException,
  InfrastructureException,
} from "../../../../common/exceptions";
import { logger } from "../../../../common/logger";

export interface UpdateCompanyProfileCommand {
  userId: string;
  companyName: string;
  description?: string | null;
  website?: string | null;
  logoUrl?: string | null;
}

export interface UpdateCompanyProfileResult {
  success: true;
  employerProfileId: string;
}

export class UpdateCompanyProfileUseCase {
  constructor(
    private readonly repository: IEmployerRepository,
    private readonly factory: EmployerProfileFactory,
  ) {}

  async execute(command: UpdateCompanyProfileCommand): Promise<UpdateCompanyProfileResult> {
    try {
      if (!command.userId || command.userId.trim().length === 0) {
        logger.warn("Validation Failure: userId is required");
        throw new ValidationException("userId is required");
      }

      if (!command.companyName || command.companyName.trim().length === 0) {
        logger.warn("Validation Failure: companyName is required");
        throw new ValidationException("companyName is required");
      }

      const existingProfile = await this.repository.findByUserId(command.userId);

      if (!existingProfile) {
        const profile = this.factory.create({
          userId: command.userId,
          companyName: command.companyName,
        });

        if (command.description !== undefined && command.description !== null) {
          profile.updateDescription(command.description);
        }
        if (command.website !== undefined && command.website !== null) {
          profile.updateWebsite(command.website);
        }
        if (command.logoUrl !== undefined && command.logoUrl !== null) {
          profile.updateLogo(command.logoUrl);
        }

        const created = await this.repository.create(profile);

        logger.info(
          {
            userId: command.userId,
            employerProfileId: created.id,
          },
          "Employer Profile Created",
        );

        return {
          success: true,
          employerProfileId: created.id!,
        };
      }

      const profile = existingProfile as EmployerProfile;
      profile.updateCompanyName(command.companyName);

      if (command.description !== undefined) {
        profile.updateDescription(command.description);
      }
      if (command.website !== undefined) {
        profile.updateWebsite(command.website);
      }
      if (command.logoUrl !== undefined) {
        profile.updateLogo(command.logoUrl);
      }

      const updated = await this.repository.update(profile);

      logger.info(
        {
          userId: command.userId,
          employerProfileId: updated.id,
        },
        "Employer Profile Updated",
      );

      return {
        success: true,
        employerProfileId: updated.id!,
      };
    } catch (error) {
      if (error instanceof ValidationException || error instanceof BusinessException) {
        throw error;
      }

      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      const errorStack = error instanceof Error ? error.stack : undefined;

      logger.error(
        {
          error: errorMessage,
          ...(errorStack && { stack: errorStack }),
        },
        "Unexpected Error during company profile update",
      );

      const details: Record<string, unknown> = {
        message: errorMessage,
        ...(errorStack && { stack: errorStack }),
      };

      throw new InfrastructureException("Company profile update failed", details);
    }
  }
}
