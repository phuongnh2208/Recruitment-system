/**
 * GenerateRecruitmentReportUseCase
 *
 * Orchestrates the recruitment report CSV export flow following Clean
 * Architecture principles. All dependencies are injected via the
 * constructor – no concrete implementations are instantiated inside
 * the use‑case.
 *
 * ═══════════════════════════════════════════════════════════════════
 * USE CASE ORCHESTRATION
 * ═══════════════════════════════════════════════════════════════════
 *
 *   1. Validate employerId, jobId
 *   2. Resolve employer profile
 *   3. Load job posting and verify ownership
 *   4. Verify job is CLOSED or EXPIRED (FR-EM-10)
 *   5. Load all applications for the job
 *   6. Join StudentProfile + User to get applicant names
 *   7. Build CSV string
 *   8. Return CSV
 *
 * @category Application Use Case
 */

import { IEmployerRepository } from "../../domain/repositories/employer-repository";
import { IJobPostingRepository } from "../../../job/domain/repositories/job-posting-repository";
import { IApplicationRepository } from "../../../application/domain/repositories/application-repository";
import { IStudentProfileRepository } from "../../../student/domain/repositories/student-profile-repository";
import { IUserRepository } from "../../../auth/domain/repositories/user-repository";
import {
  ValidationException,
  AuthenticationException,
  NotFoundException,
  ConflictException,
  BusinessException,
  InfrastructureException,
} from "../../../../common/exceptions";
import { logger } from "../../../../common/logger";

/**
 * Input DTO for the recruitment report use‑case.
 */
export interface GenerateRecruitmentReportCommand {
  /** The ID of the employer requesting the report. */
  employerId: string;
  /** The ID of the job posting to report. */
  jobId: string;
}

/**
 * Output DTO for the recruitment report use‑case.
 */
export interface GenerateRecruitmentReportResult {
  /** CSV file content. */
  csv: string;
}

export class GenerateRecruitmentReportUseCase {
  constructor(
    private readonly employerRepository: IEmployerRepository,
    private readonly jobPostingRepository: IJobPostingRepository,
    private readonly applicationRepository: IApplicationRepository,
    private readonly studentProfileRepository: IStudentProfileRepository,
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(
    command: GenerateRecruitmentReportCommand,
  ): Promise<GenerateRecruitmentReportResult> {
    logger.debug({ employerId: command.employerId, jobId: command.jobId }, "Report Requested");

    try {
      if (!command.employerId || command.employerId.trim().length === 0) {
        throw new ValidationException("employerId is required");
      }
      if (!command.jobId || command.jobId.trim().length === 0) {
        throw new ValidationException("jobId is required");
      }

      const employerProfile = await this.employerRepository.findByUserId(command.employerId);
      if (!employerProfile?.id) {
        throw new NotFoundException(`Employer profile for user ${command.employerId} not found`);
      }

      const job = await this.jobPostingRepository.findById(command.jobId);
      if (!job) {
        throw new NotFoundException(`Job posting ${command.jobId} not found`);
      }

      if (job.employerId !== employerProfile.id) {
        throw new AuthenticationException("You are not authorized to view this job posting report");
      }

      if (job.state.value !== "CLOSED" && job.state.value !== "EXPIRED") {
        throw new ConflictException(
          `Job posting ${command.jobId} must be in CLOSED or EXPIRED state to export report (current: ${job.state.value})`,
        );
      }

      const applications = await this.applicationRepository.findByJobId(command.jobId);

      const rows: string[] = [];
      rows.push("Applicant Name,Status,Applied Date");

      for (const app of applications) {
        const studentProfile = await this.studentProfileRepository.findById(app.studentId);
        let name = app.studentId;
        if (studentProfile) {
          name = studentProfile.fullName;
        }
        const status = app.state.value;
        const appliedDate = app.appliedAt.toISOString();
        const safeName = this.escapeCsv(name);
        rows.push(`${safeName},${status},${appliedDate}`);
      }

      const csv = rows.join("\n");

      return { csv };
    } catch (error) {
      if (
        error instanceof ValidationException ||
        error instanceof AuthenticationException ||
        error instanceof NotFoundException ||
        error instanceof ConflictException ||
        error instanceof BusinessException
      ) {
        throw error;
      }

      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      const errorStack = error instanceof Error ? error.stack : undefined;
      logger.error(
        { error: errorMessage, ...(errorStack && { stack: errorStack }) },
        "Unexpected Error during recruitment report generation",
      );
      throw new InfrastructureException("Recruitment report generation failed", {
        message: errorMessage,
        ...(errorStack && { stack: errorStack }),
      });
    }
  }

  private escapeCsv(value: string): string {
    if (value.includes(",") || value.includes('"') || value.includes("\n")) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }
}
