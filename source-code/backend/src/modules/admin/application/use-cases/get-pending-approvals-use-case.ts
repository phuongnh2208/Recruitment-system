/**
 * GetPendingApprovalsUseCase
 *
 * Orchestrates retrieving pending employers and jobs for admin approval.
 * Following Clean Architecture principles with constructor injection.
 *
 * ══════════════════════════════════════════════════════════════════
 * BUSINESS FLOW
 * ══════════════════════════════════════════════════════════════════
 *
 * 1. Call repository.getPendingEmployers()
 * 2. Call repository.getPendingJobs()
 * 3. Return combined result with arrays of pending items.
 *
 * ══════════════════════════════════════════════════════════════════
 * DEPENDENCY INJECTION
 * ══════════════════════════════════════════════════════════════════
 *
 * - IAdminRepository (Domain Interface)
 *
 * No Prisma. No concrete repository.
 *
 * @category Application Use Case
 */

import {
  IAdminRepository,
  PendingEmployer,
  PendingJob,
} from "../../domain/repositories/admin-repository";
import { InfrastructureException } from "../../../../common/exceptions";
import { logger } from "../../../../common/logger";

/**
 * Result returned after retrieving pending approvals.
 */
export interface GetPendingApprovalsResult {
  /** List of employers awaiting verification. */
  pendingEmployers: PendingEmployer[];
  /** List of jobs awaiting approval. */
  pendingJobs: PendingJob[];
  /** Timestamp when the data was retrieved. */
  retrievedAt: string;
}

export class GetPendingApprovalsUseCase {
  constructor(private readonly adminRepository: IAdminRepository) {}

  /**
   * Retrieve all pending approvals (employers + jobs).
   *
   * @returns Pending employers and jobs with full details for rendering.
   * @throws {InfrastructureException} If an unexpected error occurs.
   */
  async execute(): Promise<GetPendingApprovalsResult> {
    try {
      logger.debug("Pending Approvals Requested");

      // ── Step 1: Fetch pending employers and jobs in parallel ─────────────
      const [pendingEmployers, pendingJobs] = await Promise.all([
        this.adminRepository.getPendingEmployers(),
        this.adminRepository.getPendingJobs(),
      ]);

      // ── Step 2: Log success ─────────────────────────────────────────────
      logger.info(
        {
          pendingEmployersCount: pendingEmployers.length,
          pendingJobsCount: pendingJobs.length,
        },
        "Pending Approvals Loaded",
      );

      // ── Step 3: Return result ───────────────────────────────────────────
      return {
        pendingEmployers,
        pendingJobs,
        retrievedAt: new Date().toISOString(),
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      const errorStack = error instanceof Error ? error.stack : undefined;

      logger.error(
        {
          error: errorMessage,
          ...(errorStack && { stack: errorStack }),
        },
        "Unexpected Error during pending approvals retrieval",
      );

      const details: Record<string, unknown> = {
        message: errorMessage,
        ...(errorStack && { stack: errorStack }),
      };

      throw new InfrastructureException("Failed to retrieve pending approvals", details);
    }
  }
}
