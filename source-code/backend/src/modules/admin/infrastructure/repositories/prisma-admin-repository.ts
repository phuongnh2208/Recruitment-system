import { PrismaClient, Prisma } from "../../../../generated/prisma";
import {
  IAdminRepository,
  DashboardStats,
  PendingEmployer,
  PendingJob,
  UserListItem,
  PaginatedResult,
  UserListFilters,
} from "../../domain/repositories/admin-repository";
import { InfrastructureException } from "../../../../common/exceptions/infrastructure-exception";
import { logger } from "../../../../common/logger";

export class PrismaAdminRepository implements IAdminRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findUserById(id: string): Promise<UserListItem | null> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
        include: {
          studentProfile: {
            select: {
              id: true,
              fullName: true,
              university: true,
              major: true,
            },
          },
          employerProfile: {
            select: {
              id: true,
              companyName: true,
              verified: true,
            },
          },
        },
      });

      if (!user) {
        logger.debug({ userId: id }, "User not found by id");
        return null;
      }

      logger.debug({ userId: id }, "User found by id");
      return this.toUserListItem(user);
    } catch (error) {
      logger.error({ error, userId: id }, "Failed to find user by id");
      throw new InfrastructureException("Failed to find user by id", { userId: id });
    }
  }

  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const [
        totalUsers,
        totalStudents,
        totalEmployers,
        totalJobs,
        totalApplications,
        pendingEmployers,
        pendingJobs,
      ] = await Promise.all([
        this.prisma.user.count(),
        this.prisma.user.count({ where: { role: "STUDENT" } }),
        this.prisma.user.count({ where: { role: "EMPLOYER" } }),
        this.prisma.jobPosting.count(),
        this.prisma.application.count(),
        this.prisma.employerProfile.count({ where: { verified: false } }),
        this.prisma.jobPosting.count({ where: { state: "PENDING" } }),
      ]);

      logger.debug("Dashboard stats retrieved successfully");
      return {
        totalUsers,
        totalStudents,
        totalEmployers,
        totalJobs,
        totalApplications,
        pendingEmployers,
        pendingJobs,
      };
    } catch (error) {
      logger.error({ error }, "Failed to get dashboard stats");
      throw new InfrastructureException("Failed to get dashboard stats");
    }
  }

  async getPendingEmployers(): Promise<PendingEmployer[]> {
    try {
      const employers = await this.prisma.employerProfile.findMany({
        where: { verified: false },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              isActive: true,
              emailVerified: true,
              createdAt: true,
            },
          },
        },
        orderBy: { createdAt: "asc" },
      });

      logger.debug({ count: employers.length }, "Pending employers retrieved successfully");
      return employers.map((employer) => this.toPendingEmployer(employer));
    } catch (error) {
      logger.error({ error }, "Failed to get pending employers");
      throw new InfrastructureException("Failed to get pending employers");
    }
  }

  async getPendingJobs(): Promise<PendingJob[]> {
    try {
      const jobs = await this.prisma.jobPosting.findMany({
        where: { state: "PENDING" },
        include: {
          employer: {
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: "asc" },
      });

      logger.debug({ count: jobs.length }, "Pending jobs retrieved successfully");
      return jobs.map((job) => this.toPendingJob(job));
    } catch (error) {
      logger.error({ error }, "Failed to get pending jobs");
      throw new InfrastructureException("Failed to get pending jobs");
    }
  }

  async getUsers(
    page: number,
    limit: number,
    filters?: UserListFilters,
  ): Promise<PaginatedResult<UserListItem>> {
    try {
      const skip = (page - 1) * limit;

      // Build where clause based on filters
      const where: Prisma.UserWhereInput = {};

      if (filters?.search) {
        where.OR = [
          { email: { contains: filters.search } },
          { studentProfile: { fullName: { contains: filters.search } } },
          { employerProfile: { companyName: { contains: filters.search } } },
        ];
      }

      if (filters?.role) {
        where.role = filters.role as any;
      }

      if (filters?.status === "active") {
        where.isActive = true;
      } else if (filters?.status === "inactive") {
        where.isActive = false;
      }

      const [users, total] = await Promise.all([
        this.prisma.user.findMany({
          skip,
          take: limit,
          where,
          orderBy: { createdAt: "desc" },
          include: {
            studentProfile: {
              select: {
                id: true,
                fullName: true,
                university: true,
                major: true,
              },
            },
            employerProfile: {
              select: {
                id: true,
                companyName: true,
                verified: true,
              },
            },
          },
        }),
        this.prisma.user.count({ where }),
      ]);

      logger.debug({ page, limit, total, count: users.length }, "Users retrieved successfully");

      return {
        data: users.map((user) => this.toUserListItem(user)),
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      logger.error({ error, page, limit }, "Failed to get users");
      throw new InfrastructureException("Failed to get users");
    }
  }

  async findEmployerById(id: string): Promise<PendingEmployer | null> {
    try {
      const employer = await this.prisma.employerProfile.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              isActive: true,
              emailVerified: true,
              createdAt: true,
            },
          },
        },
      });

      if (!employer) {
        logger.debug({ employerId: id }, "Employer not found by id");
        return null;
      }

      logger.debug({ employerId: id }, "Employer found by id");
      return this.toPendingEmployer(employer);
    } catch (error) {
      logger.error({ error, employerId: id }, "Failed to find employer by id");
      throw new InfrastructureException("Failed to find employer by id", {
        employerId: id,
      });
    }
  }

  async findJobById(id: string): Promise<PendingJob | null> {
    try {
      const job = await this.prisma.jobPosting.findUnique({
        where: { id },
        include: {
          employer: {
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                },
              },
            },
          },
        },
      });

      if (!job) {
        logger.debug({ jobId: id }, "Job not found by id");
        return null;
      }

      logger.debug({ jobId: id }, "Job found by id");
      return this.toPendingJob(job);
    } catch (error) {
      logger.error({ error, jobId: id }, "Failed to find job by id");
      throw new InfrastructureException("Failed to find job by id", {
        jobId: id,
      });
    }
  }

  async updateEmployerVerification(
    id: string,
    verified: boolean,
    verifiedBy: string,
  ): Promise<void> {
    try {
      await this.prisma.employerProfile.update({
        where: { id },
        data: {
          verified,
          verifiedAt: verified ? new Date() : null,
          verifiedBy: verified ? verifiedBy : null,
        },
      });

      logger.info(
        { employerId: id, verified, verifiedBy },
        "Employer verification updated successfully",
      );
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
        logger.warn({ employerId: id }, "Attempted to update non-existent employer");
        throw new InfrastructureException("Employer not found for verification update", {
          employerId: id,
        });
      }

      logger.error({ error, employerId: id }, "Failed to update employer verification");
      throw new InfrastructureException("Failed to update employer verification", {
        employerId: id,
      });
    }
  }

  async updateJobApproval(
    id: string,
    state: string,
    approvedBy: string,
    rejectionReason?: string,
  ): Promise<void> {
    try {
      const updateData: Prisma.JobPostingUpdateInput = {
        state: state as any,
        approvedBy,
        approvedAt: state === "APPROVED" ? new Date() : null,
        rejectionReason: state === "REJECTED" ? rejectionReason : null,
      };

      await this.prisma.jobPosting.update({
        where: { id },
        data: updateData,
      });

      logger.info({ jobId: id, state, approvedBy }, "Job approval updated successfully");
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
        logger.warn({ jobId: id }, "Attempted to update non-existent job");
        throw new InfrastructureException("Job not found for approval update", {
          jobId: id,
        });
      }

      logger.error({ error, jobId: id }, "Failed to update job approval");
      throw new InfrastructureException("Failed to update job approval", {
        jobId: id,
      });
    }
  }

  async updateUserStatus(id: string, isActive: boolean): Promise<void> {
    try {
      await this.prisma.user.update({
        where: { id },
        data: { isActive },
      });

      logger.info({ userId: id, isActive }, "User status updated successfully");
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
        logger.warn({ userId: id }, "Attempted to update non-existent user");
        throw new InfrastructureException("User not found for status update", {
          userId: id,
        });
      }

      logger.error({ error, userId: id }, "Failed to update user status");
      throw new InfrastructureException("Failed to update user status", {
        userId: id,
      });
    }
  }

  private toPendingEmployer(employer: {
    id: string;
    userId: string;
    companyName: string;
    companyDescription: string | null;
    website: string | null;
    address: string | null;
    logoUrl: string | null;
    verified: boolean;
    createdAt: Date;
    user: {
      id: string;
      email: string;
      isActive: boolean;
      emailVerified: boolean;
      createdAt: Date;
    };
  }): PendingEmployer {
    return {
      id: employer.id,
      userId: employer.userId,
      companyName: employer.companyName,
      companyDescription: employer.companyDescription,
      website: employer.website,
      address: employer.address,
      logoUrl: employer.logoUrl,
      verified: employer.verified,
      createdAt: employer.createdAt,
      user: {
        id: employer.user.id,
        email: employer.user.email,
        isActive: employer.user.isActive,
        emailVerified: employer.user.emailVerified,
        createdAt: employer.user.createdAt,
      },
    };
  }

  private toPendingJob(job: {
    id: string;
    employerId: string;
    title: string;
    description: string;
    requirements: string | null;
    location: string | null;
    jobType: string | null;
    salaryRange: string | null;
    state: string;
    expiresAt: Date | null;
    rejectionReason: string | null;
    createdAt: Date;
    updatedAt: Date;
    employer: {
      id: string;
      companyName: string;
      verified: boolean;
      user: {
        id: string;
        email: string;
      };
    };
  }): PendingJob {
    return {
      id: job.id,
      employerId: job.employerId,
      title: job.title,
      description: job.description,
      requirements: job.requirements,
      location: job.location,
      jobType: job.jobType,
      salaryRange: job.salaryRange,
      state: job.state,
      expiresAt: job.expiresAt,
      rejectionReason: job.rejectionReason,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
      employer: {
        id: job.employer.id,
        companyName: job.employer.companyName,
        verified: job.employer.verified,
        user: {
          id: job.employer.user.id,
          email: job.employer.user.email,
        },
      },
    };
  }

  private toUserListItem(user: {
    id: string;
    email: string;
    role: string;
    isActive: boolean;
    emailVerified: boolean;
    failedLoginAttempts: number;
    lockedUntil: Date | null;
    createdAt: Date;
    updatedAt: Date;
    studentProfile: {
      id: string;
      fullName: string;
      university: string | null;
      major: string | null;
    } | null;
    employerProfile: {
      id: string;
      companyName: string;
      verified: boolean;
    } | null;
  }): UserListItem {
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      emailVerified: user.emailVerified,
      failedLoginAttempts: user.failedLoginAttempts,
      lockedUntil: user.lockedUntil,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      studentProfile: user.studentProfile,
      employerProfile: user.employerProfile,
    };
  }
}
