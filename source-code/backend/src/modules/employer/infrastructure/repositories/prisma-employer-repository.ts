import { PrismaClient, Prisma } from "../../../../generated/prisma";
import { IEmployerRepository } from "../../domain/repositories/employer-repository";
import { EmployerProfile, EmployerProfileProps } from "../../domain/employer-profile";
import { InfrastructureException } from "../../../../common/exceptions/infrastructure-exception";
import { logger } from "../../../../common/logger";

export class PrismaEmployerRepository implements IEmployerRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<EmployerProfile | null> {
    try {
      const profile = await this.prisma.employerProfile.findUnique({
        where: { id },
      });

      if (!profile) {
        logger.debug({ employerProfileId: id }, "Employer profile not found by id");
        return null;
      }

      logger.debug({ employerProfileId: id }, "Employer profile found by id");
      return this.toDomain(profile);
    } catch (error) {
      logger.error({ error, employerProfileId: id }, "Failed to find employer profile by id");
      throw new InfrastructureException("Failed to find employer profile by id", {
        employerProfileId: id,
      });
    }
  }

  async findByUserId(userId: string): Promise<EmployerProfile | null> {
    try {
      const profile = await this.prisma.employerProfile.findUnique({
        where: { userId },
      });

      if (!profile) {
        logger.debug({ userId }, "Employer profile not found by userId");
        return null;
      }

      logger.debug({ userId }, "Employer profile found by userId");
      return this.toDomain(profile);
    } catch (error) {
      logger.error({ error, userId }, "Failed to find employer profile by userId");
      throw new InfrastructureException("Failed to find employer profile by userId", {
        userId,
      });
    }
  }

  async create(profile: EmployerProfile): Promise<EmployerProfile> {
    const createInput = this.toCreateInput(profile);

    try {
      const created = await this.prisma.employerProfile.create({
        data: createInput,
      });

      logger.info(
        { employerProfileId: created.id, userId: created.userId },
        "Employer profile created successfully",
      );

      return this.toDomain(created);
    } catch (error) {
      logger.error({ error, userId: profile.userId }, "Failed to create employer profile");
      throw new InfrastructureException("Failed to create employer profile", {
        userId: profile.userId,
      });
    }
  }

  async update(profile: EmployerProfile): Promise<EmployerProfile> {
    const profileId = profile.id;

    if (!profileId) {
      throw new InfrastructureException("Cannot update employer profile without an id");
    }

    const updateInput = this.toUpdateInput(profile);

    try {
      const updated = await this.prisma.employerProfile.update({
        where: { id: profileId },
        data: updateInput,
      });

      logger.info({ employerProfileId: updated.id }, "Employer profile updated successfully");

      return this.toDomain(updated);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
        logger.warn(
          { employerProfileId: profileId },
          "Attempted to update non-existent employer profile",
        );
        throw new InfrastructureException("Employer profile not found for update", {
          employerProfileId: profileId,
        });
      }

      logger.error({ error, employerProfileId: profileId }, "Failed to update employer profile");
      throw new InfrastructureException("Failed to update employer profile", {
        employerProfileId: profileId,
      });
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.prisma.employerProfile.delete({
        where: { id },
      });

      logger.info({ employerProfileId: id }, "Employer profile deleted successfully");
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
        logger.debug(
          { employerProfileId: id },
          "Delete called on non-existent employer profile (idempotent)",
        );
        return;
      }

      logger.error({ error, employerProfileId: id }, "Failed to delete employer profile");
      throw new InfrastructureException("Failed to delete employer profile", {
        employerProfileId: id,
      });
    }
  }

  async existsByUserId(userId: string): Promise<boolean> {
    try {
      const profile = await this.prisma.employerProfile.findUnique({
        where: { userId },
        select: { id: true },
      });

      logger.debug({ userId, exists: !!profile }, "Checked employer profile existence by userId");

      return profile !== null;
    } catch (error) {
      logger.error({ error, userId }, "Failed to check employer profile existence");
      throw new InfrastructureException("Failed to check employer profile existence", {
        userId,
      });
    }
  }

  private toDomain(model: {
    id: string;
    userId: string;
    companyName: string;
    companyDescription: string | null;
    website: string | null;
    address: string | null;
    logoUrl: string | null;
    verified: boolean;
    verifiedAt: Date | null;
    verifiedBy: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): EmployerProfile {
    const props: EmployerProfileProps = {
      id: model.id,
      userId: model.userId,
      companyName: model.companyName,
      description: model.companyDescription,
      website: model.website,
      logoUrl: model.logoUrl,
      verified: model.verified,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
    };

    return new EmployerProfile(props);
  }

  private toCreateInput(entity: EmployerProfile): Prisma.EmployerProfileCreateInput {
    return {
      companyName: entity.companyName,
      companyDescription: entity.description,
      website: entity.website,
      address: null,
      logoUrl: entity.logoUrl,
      verified: entity.verified,
      verifiedAt: null,
      verifiedBy: null,
      user: {
        connect: { id: entity.userId },
      },
    };
  }

  private toUpdateInput(entity: EmployerProfile): Prisma.EmployerProfileUpdateInput {
    return {
      companyName: entity.companyName,
      companyDescription: entity.description,
      website: entity.website,
      logoUrl: entity.logoUrl,
      verified: entity.verified,
      updatedAt: entity.updatedAt,
    };
  }
}
