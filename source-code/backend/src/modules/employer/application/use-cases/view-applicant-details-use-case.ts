import { Application } from "../../../application/domain/entities/application";
import { IJobPostingRepository } from "../../../job/domain/repositories/job-posting-repository";
import { IEmployerRepository } from "../../domain/repositories/employer-repository";
import { IStudentProfileRepository } from "../../../student/domain/repositories/student-profile-repository";
import { ICVRepository } from "../../../student/domain/repositories/cv-repository";
import { IUserRepository } from "../../../auth/domain/repositories/user-repository";
import {
  ValidationException,
  AuthenticationException,
  NotFoundException,
  BusinessException,
  InfrastructureException,
} from "../../../../common/exceptions";
import { logger } from "../../../../common/logger";

export interface IApplicationRepository {
  findById(id: string): Promise<Application | null>;
}

export interface ViewApplicantDetailsCommand {
  employerId: string;
  applicationId: string;
}

const STATE_LABELS: Record<string, string> = {
  APPLIED: "Applied",
  UNDER_REVIEW: "Under Review",
  ACCEPTED: "Accepted",
  REJECTED: "Rejected",
  WITHDRAWN: "Withdrawn",
};

export interface ViewApplicantDetailsResult {
  id: string;
  jobTitle: string;
  student: {
    fullName: string;
    email: string;
    phone: string | null;
    university: string | null;
    major: string | null;
    graduationYear: number | null;
  };
  coverLetter: string | null;
  status: string;
  appliedDate: string;
  cvUrl: string | null;
}

export class ViewApplicantDetailsUseCase {
  constructor(
    private readonly applicationRepository: IApplicationRepository,
    private readonly jobPostingRepository: IJobPostingRepository,
    private readonly employerRepository: IEmployerRepository,
    private readonly studentProfileRepository: IStudentProfileRepository,
    private readonly cvRepository: ICVRepository,
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(command: ViewApplicantDetailsCommand): Promise<ViewApplicantDetailsResult> {
    try {
      if (!command.employerId || command.employerId.trim().length === 0) {
        logger.warn("Validation Failure – employerId is required");
        throw new ValidationException("employerId is required");
      }

      if (!command.applicationId || command.applicationId.trim().length === 0) {
        logger.warn("Validation Failure – applicationId is required");
        throw new ValidationException("applicationId is required");
      }

      logger.debug(
        {
          employerId: command.employerId,
          applicationId: command.applicationId,
        },
        "Applicant Detail Requested",
      );

      const application = await this.applicationRepository.findById(command.applicationId);

      if (!application) {
        logger.warn(
          {
            applicationId: command.applicationId,
          },
          "Applicant Not Found",
        );
        throw new NotFoundException("Application not found");
      }

      const job = await this.jobPostingRepository.findById(application.jobPostingId);

      if (!job) {
        logger.warn(
          {
            jobPostingId: application.jobPostingId,
            applicationId: command.applicationId,
          },
          "Job Not Found",
        );
        throw new NotFoundException(`Job posting ${application.jobPostingId} not found`);
      }

      // Resolve User.id → EmployerProfile.id before comparing ownership.
      const employerProfile = await this.employerRepository.findByUserId(command.employerId);
      if (!employerProfile?.id) {
        logger.warn(
          {
            employerId: command.employerId,
          },
          "Employer Profile Not Found",
        );
        throw new NotFoundException(`Employer profile for user ${command.employerId} not found`);
      }

      if (job.employerId !== employerProfile.id) {
        logger.warn(
          {
            employerId: command.employerId,
            applicationId: command.applicationId,
          },
          "Unauthorized Applicant Access",
        );
        throw new AuthenticationException(
          "You are not authorized to view this applicant's details",
        );
      }

      const studentProfile = await this.studentProfileRepository.findById(application.studentId);
      if (!studentProfile) {
        logger.warn({ studentId: application.studentId }, "Student Profile Not Found");
        throw new NotFoundException(`Student profile ${application.studentId} not found`);
      }

      const studentUser = await this.userRepository.findById(studentProfile.userId);
      if (!studentUser) {
        logger.warn({ userId: studentProfile.userId }, "Student User Not Found");
        throw new NotFoundException(`User ${studentProfile.userId} not found`);
      }

      const cv = await this.cvRepository.findById(application.cvId);
      const cvUrl = cv ? `/uploads/${cv.storagePath.replace(/\\/g, "/")}` : null;

      logger.info(
        {
          applicationId: command.applicationId,
          employerId: command.employerId,
        },
        "Applicant Detail Loaded",
      );

      return {
        id: application.id!,
        jobTitle: job.title,
        student: {
          fullName: studentProfile.fullName,
          email: studentUser.email,
          phone: studentProfile.phone,
          university: studentProfile.university,
          major: studentProfile.major,
          graduationYear: studentProfile.graduationYear,
        },
        coverLetter: application.coverLetter,
        status: STATE_LABELS[application.state.value],
        appliedDate: application.appliedAt.toISOString(),
        cvUrl,
      };
    } catch (error) {
      if (
        error instanceof ValidationException ||
        error instanceof AuthenticationException ||
        error instanceof NotFoundException ||
        error instanceof BusinessException ||
        error instanceof InfrastructureException
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
        "Unexpected Error during applicant detail retrieval",
      );

      const details: Record<string, unknown> = {
        message: errorMessage,
        ...(errorStack && { stack: errorStack }),
      };

      throw new InfrastructureException("Failed to retrieve applicant details", details);
    }
  }
}
