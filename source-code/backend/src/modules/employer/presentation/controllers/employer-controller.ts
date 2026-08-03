import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { UpdateCompanyProfileUseCase } from "../../application/use-cases/update-company-profile-use-case";
import { GetCompanyProfileUseCase } from "../../application/use-cases/get-company-profile-use-case";
import { GetMyApplicantsUseCase } from "../../application/use-cases/get-my-applicants-use-case";
import { ViewApplicantDetailsUseCase } from "../../application/use-cases/view-applicant-details-use-case";
import { GenerateRecruitmentReportUseCase } from "../../application/use-cases/generate-recruitment-report-use-case";
import { AuthenticationException } from "../../../../common/exceptions";
import { EmployerProfile } from "../../domain/employer-profile";

/**
 * Map an EmployerProfile domain entity to a flat DTO for HTTP serialization.
 *
 * Domain entities use private fields + getters, so JSON.stringify would
 * emit `_companyName` instead of `companyName`. This mapper ensures the wire
 * format matches what the frontend expects.
 */
function toEmployerProfileDto(profile: EmployerProfile) {
  return {
    id: profile.id,
    userId: profile.userId,
    companyName: profile.companyName,
    description: profile.description,
    website: profile.website,
    logoUrl: profile.logoUrl,
    verified: profile.verified,
    createdAt: profile.createdAt.toISOString(),
    updatedAt: profile.updatedAt.toISOString(),
  };
}

export class EmployerController {
  constructor(
    private readonly updateCompanyProfileUseCase: UpdateCompanyProfileUseCase,
    private readonly getCompanyProfileUseCase: GetCompanyProfileUseCase,
    private readonly getMyApplicantsUseCase: GetMyApplicantsUseCase,
    private readonly viewApplicantDetailsUseCase: ViewApplicantDetailsUseCase,
    private readonly generateRecruitmentReportUseCase: GenerateRecruitmentReportUseCase,
  ) {}

  private readonly updateCompanyProfileSchema = z.object({
    companyName: z.string().min(1),
    description: z.string().optional().nullable(),
    website: z.string().optional().nullable(),
    logoUrl: z.string().optional().nullable(),
  });

  private readonly applicantsQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    size: z.coerce.number().int().min(1).max(100).default(10),
  });

  async updateCompanyProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        next(new AuthenticationException("Authentication required."));
        return;
      }
      const body = this.updateCompanyProfileSchema.parse(req.body);
      const result = await this.updateCompanyProfileUseCase.execute({
        userId: req.user.id,
        companyName: body.companyName,
        description: body.description,
        website: body.website,
        logoUrl: body.logoUrl,
      });
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /employer/company-profile
   *
   * Retrieves the authenticated employer's company profile information.
   *
   * **Authentication:** Requires a valid JWT. `req.user.id` is used as
   * the employer's userId.
   *
   * **Response** – `200 OK` with the profile data or null if not found.
   *
   * @param req  - Express Request (with `req.user` set by AuthGuard)
   * @param res  - Express Response
   * @param next - Express NextFunction (error forwarder)
   */
  async getCompanyProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        next(new AuthenticationException("Authentication required."));
        return;
      }
      const result = await this.getCompanyProfileUseCase.execute({
        userId: req.user.id,
      });
      res.status(200).json({
        success: true,
        data: {
          profile: result.profile ? toEmployerProfileDto(result.profile) : null,
          exists: result.exists,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getMyApplicants(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        next(new AuthenticationException("Authentication required."));
        return;
      }
      const query = this.applicantsQuerySchema.parse(req.query);
      const result = await this.getMyApplicantsUseCase.execute({
        employerId: req.user.id,
        page: query.page,
        limit: query.size,
      });
      res.status(200).json({
        success: true,
        data: {
          items: result.items,
          page: result.page,
          size: result.limit,
          totalPages: result.totalPages,
          totalItems: result.total,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async viewApplicantDetails(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        next(new AuthenticationException("Authentication required."));
        return;
      }
      const result = await this.viewApplicantDetailsUseCase.execute({
        employerId: req.user.id,
        applicationId: req.params.applicationId,
      });
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /employer/jobs/:jobId/report
   *
   * Exports a CSV recruitment report for a CLOSED or EXPIRED job posting
   * (FR-EM-10).
   *
   * **Response** – `200 OK` with `text/csv` content type.
   */
  async generateRecruitmentReport(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        next(new AuthenticationException("Authentication required."));
        return;
      }
      const result = await this.generateRecruitmentReportUseCase.execute({
        employerId: req.user.id,
        jobId: req.params.jobId,
      });
      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader("Content-Disposition", 'attachment; filename="report.csv"');
      res.send(result.csv);
    } catch (error) {
      next(error);
    }
  }
}
