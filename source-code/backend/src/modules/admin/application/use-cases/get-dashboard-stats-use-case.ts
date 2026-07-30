/**
 * GetDashboardStatsUseCase
 *
 * Orchestrates the dashboard statistics retrieval flow following Clean
 * Architecture principles. All dependencies are injected via the
 * constructor – no concrete implementations are instantiated inside the
 * use‑case.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * BUSINESS FLOW
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 1. Call repository.getDashboardStats().
 * 2. Return the dashboard statistics.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * DEPENDENCY INJECTION
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * - IAdminRepository (Domain Interface)
 *
 * No Prisma. No concrete repository.
 *
 * @category Application Use Case
 */

import { IAdminRepository, DashboardStats } from "../../domain/repositories/admin-repository";
import { BusinessException, InfrastructureException } from "../../../../common/exceptions";
import { logger } from "../../../../common/logger";

/**
 * Result returned after retrieving dashboard statistics.
 */
export interface GetDashboardStatsResult extends DashboardStats {
  /** Timestamp when the stats were retrieved. */
  retrievedAt: string;
}

export class GetDashboardStatsUseCase {
  constructor(private readonly adminRepository: IAdminRepository) {}

  /**
   * Retrieve the dashboard statistics.
   *
   * @returns Dashboard statistics including counts of users, jobs, applications.
   * @throws {InfrastructureException} If an unexpected error occurs.
   */
  async execute(): Promise<GetDashboardStatsResult> {
    try {
      logger.debug("Dashboard Stats Requested");

      // ── Step 1: Fetch dashboard stats from repository ───────────────────
      const stats = await this.adminRepository.getDashboardStats();

      // ── Step 2: Log success ─────────────────────────────────────────────
      logger.info(
        {
          totalUsers: stats.totalUsers,
          totalStudents: stats.totalStudents,
          totalEmployers: stats.totalEmployers,
          totalJobs: stats.totalJobs,
          totalApplications: stats.totalApplications,
          pendingEmployers: stats.pendingEmployers,
          pendingJobs: stats.pendingJobs,
        },
        "Dashboard Stats Loaded",
      );

      // ── Step 3: Return result ───────────────────────────────────────────
      return {
        ...stats,
        retrievedAt: new Date().toISOString(),
      };
    } catch (error) {
      if (error instanceof BusinessException) {
        throw error;
      }

      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      const errorStack = error instanceof Error ? error.stack : undefined;

      logger.error(
        {
          error: errorMessage,
          ...(errorStack && { stack: errorStack }),
        },
        "Unexpected Error during dashboard stats retrieval",
      );

      const details: Record<string, unknown> = {
        message: errorMessage,
        ...(errorStack && { stack: errorStack }),
      };

      throw new InfrastructureException("Failed to retrieve dashboard statistics", details);
    }
  }
}
