import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { ApplyJobUseCase } from "../../application/use-cases/apply-job-use-case";
import { UpdateApplicationStatusUseCase } from "../../application/use-cases/update-application-status-use-case";
import { WithdrawApplicationUseCase } from "../../application/use-cases/withdraw-application-use-case";
import { AuthenticationException } from "../../../../common/exceptions";

export class ApplicationController {
  constructor(
    private readonly applyJobUseCase: ApplyJobUseCase,
    private readonly updateApplicationStatusUseCase: UpdateApplicationStatusUseCase,
    private readonly withdrawApplicationUseCase: WithdrawApplicationUseCase,
  ) {}

  private readonly applyJobSchema = z.object({
    jobId: z.string().min(1),
    cvId: z.string().min(1),
  });

  private readonly updateApplicationStatusSchema = z.object({
    status: z.enum(["UNDER_REVIEW", "ACCEPTED", "REJECTED"]),
    reason: z.string().optional(),
  });

  async applyJob(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        next(new AuthenticationException("Authentication required."));
        return;
      }
      const body = this.applyJobSchema.parse(req.body);
      const result = await this.applyJobUseCase.execute({
        studentId: req.user.id,
        jobId: body.jobId,
        cvId: body.cvId,
      });
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  async updateApplicationStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        next(new AuthenticationException("Authentication required."));
        return;
      }
      const body = this.updateApplicationStatusSchema.parse(req.body);
      const result = await this.updateApplicationStatusUseCase.execute({
        employerId: req.user.id,
        applicationId: req.params.applicationId,
        status: body.status,
        reason: body.reason,
      });
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async withdrawApplication(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        next(new AuthenticationException("Authentication required."));
        return;
      }
      const result = await this.withdrawApplicationUseCase.execute({
        studentId: req.user.id,
        applicationId: req.params.applicationId,
      });
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}
