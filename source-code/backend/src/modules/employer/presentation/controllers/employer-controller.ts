import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { UpdateCompanyProfileUseCase } from "../../application/use-cases/update-company-profile-use-case";
import { GetCompanyProfileUseCase } from "../../application/use-cases/get-company-profile-use-case";
import { GetMyApplicantsUseCase } from "../../application/use-cases/get-my-applicants-use-case";
import { ViewApplicantDetailsUseCase } from "../../application/use-cases/view-applicant-details-use-case";
import { AuthenticationException } from "../../../../common/exceptions";

export class EmployerController {
  constructor(
    private readonly updateCompanyProfileUseCase: UpdateCompanyProfileUseCase,
    private readonly getCompanyProfileUseCase: GetCompanyProfileUseCase,
    private readonly getMyApplicantsUseCase: GetMyApplicantsUseCase,
    private readonly viewApplicantDetailsUseCase: ViewApplicantDetailsUseCase,
  ) {}

  private readonly updateCompanyProfileSchema = z.object({
    companyName: z.string().min(1),
    description: z.string().optional().nullable(),
    website: z.string().optional().nullable(),
    logoUrl: z.string().optional().nullable(),
  });

  private readonly applicantsQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
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
      res.status(200).json(result);
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
      res.status(200).json(result);
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
        limit: query.limit,
      });
      res.status(200).json(result);
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
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}
