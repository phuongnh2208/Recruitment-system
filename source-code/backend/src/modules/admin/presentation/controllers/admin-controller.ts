import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { VerifyEmployerUseCase } from "../../application/use-cases/verify-employer-use-case";
import { ApproveJobPostingUseCase } from "../../application/use-cases/approve-job-posting-use-case";
import { RejectJobPostingUseCase } from "../../application/use-cases/reject-job-posting-use-case";
import { ManageUserAccountUseCase } from "../../application/use-cases/manage-user-account-use-case";
import { GetDashboardStatsUseCase } from "../../application/use-cases/get-dashboard-stats-use-case";
import { GetUsersUseCase } from "../../application/use-cases/get-users-use-case";
import { GetPendingApprovalsUseCase } from "../../application/use-cases/get-pending-approvals-use-case";
import { AuthenticationException } from "../../../../common/exceptions";

export class AdminController {
  constructor(
    private readonly verifyEmployerUseCase: VerifyEmployerUseCase,
    private readonly approveJobPostingUseCase: ApproveJobPostingUseCase,
    private readonly rejectJobPostingUseCase: RejectJobPostingUseCase,
    private readonly manageUserAccountUseCase: ManageUserAccountUseCase,
    private readonly getDashboardStatsUseCase: GetDashboardStatsUseCase,
    private readonly getUsersUseCase: GetUsersUseCase,
    private readonly getPendingApprovalsUseCase: GetPendingApprovalsUseCase,
  ) {}

  // Zod Schemas

  private readonly verifyEmployerSchema = z.object({
    employerId: z.string().min(1),
  });

  private readonly approveJobSchema = z.object({
    jobId: z.string().min(1),
  });

  private readonly rejectJobSchema = z.object({
    jobId: z.string().min(1),
    rejectionReason: z.string().min(1),
  });

  private readonly manageUserSchema = z.object({
    isActive: z.boolean(),
  });

  private readonly getUsersQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    search: z.string().optional(),
    role: z.string().optional(),
    status: z.string().optional(),
  });

  // Endpoint Methods

  async getDashboardStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await this.getDashboardStatsUseCase.execute();
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async getUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = this.getUsersQuerySchema.parse(req.query);
      const result = await this.getUsersUseCase.execute({
        page: query.page,
        limit: query.limit,
        search: query.search,
        role: query.role,
        status: query.status,
      });

      // Map UserListItem (backend) to User (frontend expected shape)
      function toUserListDto(user: {
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
      }) {
        // Map backend role to frontend role (ADMINISTRATOR -> ADMIN)
        const roleMap: Record<string, "ADMIN" | "EMPLOYER" | "STUDENT"> = {
          ADMINISTRATOR: "ADMIN",
          EMPLOYER: "EMPLOYER",
          STUDENT: "STUDENT",
        };

        return {
          id: user.id,
          fullName:
            user.studentProfile?.fullName ?? user.employerProfile?.companyName ?? user.email,
          email: user.email,
          role: roleMap[user.role] ?? "STUDENT",
          status: user.isActive ? "ACTIVE" : "DISABLED",
          avatar: { url: null, alt: "" },
          createdAt: user.createdAt.toISOString(),
        };
      }

      res.status(200).json({
        success: true,
        data: {
          users: result.data.map(toUserListDto),
          totalItems: result.total,
          totalPages: result.totalPages,
          currentPage: result.page,
          pageSize: result.limit,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getPendingApprovals(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await this.getPendingApprovalsUseCase.execute();

      // Map backend PendingEmployer (nested user object) to frontend-expected flat shape
      const pendingEmployers = result.pendingEmployers.map((employer) => ({
        id: employer.id,
        companyName: employer.companyName,
        representativeName: employer.user?.email ?? "",
        email: employer.user?.email ?? "",
        website: employer.website,
        registeredAt: employer.createdAt.toISOString(),
      }));

      // Map backend PendingJob (nested employer object) to frontend-expected flat shape
      const pendingJobs = result.pendingJobs.map((job) => ({
        id: job.id,
        title: job.title,
        employerName: job.employer?.companyName ?? "",
        employerId: job.employerId,
        createdAt: job.createdAt.toISOString(),
        state: "Pending" as const,
      }));

      res.status(200).json({
        success: true,
        data: {
          pendingEmployers,
          pendingJobs,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async verifyEmployer(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        next(new AuthenticationException("Authentication required."));
        return;
      }
      const params = this.verifyEmployerSchema.parse(req.params);
      const result = await this.verifyEmployerUseCase.execute({
        employerId: params.employerId,
        adminId: req.user.id,
      });
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async approveJobPosting(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        next(new AuthenticationException("Authentication required."));
        return;
      }
      const params = this.approveJobSchema.parse(req.params);
      const result = await this.approveJobPostingUseCase.execute({
        jobId: params.jobId,
        adminId: req.user.id,
      });
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async rejectJobPosting(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        next(new AuthenticationException("Authentication required."));
        return;
      }
      const params = this.rejectJobSchema.parse({
        jobId: req.params.jobId,
        rejectionReason: req.body.rejectionReason,
      });
      const result = await this.rejectJobPostingUseCase.execute({
        jobId: params.jobId,
        adminId: req.user.id,
        rejectionReason: params.rejectionReason,
      });
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async manageUserAccount(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const body = this.manageUserSchema.parse(req.body);
      const result = await this.manageUserAccountUseCase.execute({
        userId: req.params.userId,
        isActive: body.isActive,
      });
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}
