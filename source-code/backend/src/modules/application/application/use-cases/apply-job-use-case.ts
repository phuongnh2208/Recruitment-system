/**
 * ApplyJobUseCase
 *
 * Orchestrates the job application submission flow following Clean
 * Architecture principles. All dependencies are injected via the
 * constructor – no concrete implementations are instantiated inside the
 * use‑case.
 *
 * ═══════════════════════════════════════════════════════════════════
 * BUSINESS FLOW
 * ═══════════════════════════════════════════════════════════════════
 *
 * 1. Validate studentId, jobId, cvId must not be empty.
 * 2. Check if the student has already applied to this job (BR-08).
 * 3. Verify the job posting exists.
 * 4. Verify the job posting is in APPROVED state.
 * 5. Create the Application entity via ApplicationFactory (state = APPLIED).
 * 6. Persist the application via IApplicationRepository.
 * 7. Log success.
 * 8. Return { success: true, applicationId }.
 *
 * ═══════════════════════════════════════════════════════════════════
 * DEPENDENCY INJECTION
 * ═══════════════════════════════════════════════════════════════════
 *
 * - IApplicationRepository  (Domain Interface)
 * - IJobPostingRepository    (Domain Interface)
 * - ApplicationFactory       (Domain Factory)
 *
 * No new Repository. No Prisma.
 *
 * @category Application Use Case
 */

import { IApplicationRepository } from "../../domain/repositories/application-repository";
import { IJobPostingRepository } from "../../../job/domain/repositories/job-posting-repository";
import { IStudentProfileRepository } from "../../../student/domain/repositories/student-profile-repository";
import { ICVRepository } from "../../../student/domain/repositories/cv-repository";
import { IUserRepository } from "../../../auth/domain/repositories/user-repository";
import { ApplicationFactory } from "../../domain/factories/application-factory";
import {
  ValidationException,
  AuthenticationException,
  ConflictException,
  NotFoundException,
  BusinessException,
  InfrastructureException,
} from "../../../../common/exceptions";
import { logger } from "../../../../common/logger";

/**
 * Input command for applying to a job.
 */
export interface ApplyJobCommand {
  /** The ID of the student submitting the application. */
  studentId: string;
  /** The ID of the job posting being applied to. */
  jobId: string;
  /** The ID of the CV to attach to this application. */
  cvId: string;
  /** Optional cover letter submitted with the application. */
  coverLetter?: string | null;
}

/**
 * Result returned after a successful application submission.
 */
export interface ApplyJobResult {
  success: true;
  /** The ID of the newly created application. */
  applicationId: string;
}

export class ApplyJobUseCase {
  constructor(
    private readonly applicationRepository: IApplicationRepository,
    private readonly jobPostingRepository: IJobPostingRepository,
    private readonly studentProfileRepository: IStudentProfileRepository,
    private readonly cvRepository: ICVRepository,
    private readonly userRepository: IUserRepository,
    private readonly applicationFactory: ApplicationFactory,
  ) {}

  async execute(command: ApplyJobCommand): Promise<ApplyJobResult> {
    try {
      // ── Step 1: Validate input ──────────────────────────────────
      this.validateInput(command);

      // ── Step 2: Resolve StudentProfile.id from User.id ──────────
      const studentProfile = await this.studentProfileRepository.findByUserId(command.studentId);

      if (!studentProfile?.id) {
        logger.warn({ userId: command.studentId }, "Student profile not found");
        throw new NotFoundException(`Student profile for user ${command.studentId} not found`);
      }

      // ── Step 2b: Verify the user account is active (BR-02) ───────
      const user = await this.userRepository.findById(command.studentId);
      if (!user || !user.canLogin()) {
        logger.warn({ userId: command.studentId }, "User account is not active — cannot apply");
        throw new AuthenticationException("Tài khoản không hoạt động, không thể ứng tuyển");
      }

      // ── Step 3: Verify CV ownership ─────────────────────────────
      const cv = await this.cvRepository.findById(command.cvId);

      if (!cv) {
        logger.warn({ cvId: command.cvId }, "CV Not Found");
        throw new NotFoundException("CV not found");
      }

      if (cv.studentId !== studentProfile.id) {
        logger.warn(
          {
            studentId: studentProfile.id,
            cvId: command.cvId,
            cvOwnerId: cv.studentId,
          },
          "CV Ownership Mismatch",
        );
        throw new AuthenticationException("You do not own this CV");
      }

      // ── Step 4: Check duplicate application (BR-08) ─────────────
      const existing = await this.applicationRepository.findByJobAndStudent(
        command.jobId,
        studentProfile.id,
      );
      if (existing) {
        logger.warn(
          {
            studentId: studentProfile.id,
            jobId: command.jobId,
          },
          "Already Applied",
        );
        throw new ConflictException(
          `Student ${studentProfile.id} has already applied to job ${command.jobId}`,
        );
      }

      // ── Step 5: Find the job posting ────────────────────────────
      const job = await this.jobPostingRepository.findById(command.jobId);

      if (!job) {
        logger.warn({ jobId: command.jobId }, "Job Not Found");
        throw new NotFoundException(`Job posting ${command.jobId} not found`);
      }

      // ── Step 6: Verify job is in APPROVED state ─────────────────
      if (job.state.value !== "APPROVED") {
        logger.warn(
          {
            jobId: command.jobId,
            jobState: job.state.value,
          },
          "Job Not Available",
        );
        throw new ConflictException(
          `Job posting ${command.jobId} is not in APPROVED state (current: ${job.state.value})`,
        );
      }

      // ── Step 7: Create Application via Factory ──────────────────
      const application = this.applicationFactory.create({
        studentId: studentProfile.id,
        jobPostingId: command.jobId,
        cvId: command.cvId,
        coverLetter: command.coverLetter,
      });

      // ── Step 8: Persist the application ─────────────────────────
      await this.applicationRepository.create(application);

      // ── Step 9: Log success ─────────────────────────────────────
      logger.info(
        {
          studentId: studentProfile.id,
          jobId: command.jobId,
          applicationId: application.id,
        },
        "Application Submitted",
      );

      // ── Step 10: Return result ──────────────────────────────────
      return {
        success: true,
        applicationId: application.id!,
      };
    } catch (error) {
      if (
        error instanceof ValidationException ||
        error instanceof AuthenticationException ||
        error instanceof ConflictException ||
        error instanceof NotFoundException ||
        error instanceof BusinessException
      ) {
        throw error;
      }

      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      const errorStack = error instanceof Error ? error.stack : undefined;

      logger.error(
        {
          error: errorMessage,
          ...(errorStack && { stack: errorStack }),
        },
        "Unexpected Error during job application",
      );

      const details: Record<string, unknown> = {
        message: errorMessage,
        ...(errorStack && { stack: errorStack }),
      };

      throw new InfrastructureException("Job application failed", details);
    }
  }

  /**
   * Validate that the required fields are not empty.
   *
   * @param command - The input command to validate.
   * @throws {ValidationException} If any required field is empty.
   */
  private validateInput(command: ApplyJobCommand): void {
    if (!command.studentId || command.studentId.trim().length === 0) {
      logger.warn("Validation Failure");
      throw new ValidationException("studentId is required");
    }

    if (!command.jobId || command.jobId.trim().length === 0) {
      logger.warn("Validation Failure");
      throw new ValidationException("jobId is required");
    }

    if (!command.cvId || command.cvId.trim().length === 0) {
      logger.warn("Validation Failure");
      throw new ValidationException("cvId is required");
    }
  }
}
