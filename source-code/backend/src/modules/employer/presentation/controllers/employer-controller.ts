import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { UpdateCompanyProfileUseCase } from "../../application/use-cases/update-company-profile-use-case";
import { GetMyApplicantsUseCase } from "../../application/use-cases/get-my-applicants-use-case";
import { ViewApplicantDetailsUseCase } from "../../application/use-cases/view-applicant-details-use-case";

export class EmployerController {
  constructor(
    private readonly updateCompanyProfileUseCase: UpdateCompanyProfileUseCase,
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

  async updateCompanyProfile(req: Request, res: Response, _next: NextFunction): Promise<void> {
    const body = this.updateCompanyProfileSchema.parse(req.body);
    const result = await this.updateCompanyProfileUseCase.execute({
      userId: req.user!.id,
      companyName: body.companyName,
      description: body.description,
      website: body.website,
      logoUrl: body.logoUrl,
    });
    res.status(200).json(result);
  }

  async getMyApplicants(req: Request, res: Response, _next: NextFunction): Promise<void> {
    const query = this.applicantsQuerySchema.parse(req.query);
    const result = await this.getMyApplicantsUseCase.execute({
      employerId: req.user!.id,
      page: query.page,
      limit: query.limit,
    });
    res.status(200).json(result);
  }

  async viewApplicantDetails(req: Request, res: Response, _next: NextFunction): Promise<void> {
    const result = await this.viewApplicantDetailsUseCase.execute({
      employerId: req.user!.id,
      applicationId: req.params.applicationId,
    });
    res.status(200).json(result);
  }
}
