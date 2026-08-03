/**
 * JobExpiryJob — Background scheduler for auto-expiring job postings.
 *
 * ═══════════════════════════════════════════════════════════════════
 * PURPOSE
 * ═══════════════════════════════════════════════════════════════════
 *
 * Automatically transitions APPROVED job postings whose expiresAt
 * date has passed to the EXPIRED state. This enforces BR-08 / FR-SYS-11
 * without requiring manual intervention.
 *
 * ═══════════════════════════════════════════════════════════════════
 * SCHEDULE
 * ═══════════════════════════════════════════════════════════════════
 *
 * Runs every 5 minutes per FR-SYS-11.
 *
 * ═══════════════════════════════════════════════════════════════════
 * CLEAN ARCHITECTURE NOTE
 * ═══════════════════════════════════════════════════════════════════
 *
 * This is an infrastructure-level background job. It queries Prisma
 * directly because the expiry logic is a scheduled maintenance task,
 * not a user-initiated business flow. If the logic needs to be reused
 * elsewhere, it can be extracted into an ExpireJobPostingsUseCase.
 *
 * @category Infrastructure / Scheduler
 */

import cron from "node-cron";
import { PrismaClient } from "../../generated/prisma";
import { logger } from "../../common/logger";

/**
 * Start the JobExpiryJob cron scheduler.
 *
 * @param prisma - The shared PrismaClient instance.
 */
export function startJobExpiryJob(prisma: PrismaClient): void {
  // Chay moi 5 phut theo FR-SYS-11
  cron.schedule("*/5 * * * *", async () => {
    try {
      const result = await prisma.jobPosting.updateMany({
        where: {
          state: "APPROVED",
          expiresAt: { lte: new Date() },
        },
        data: { state: "EXPIRED" },
      });
      if (result.count > 0) {
        logger.info({ count: result.count }, "JobExpiryJob: expired job postings updated");
      }
    } catch (error) {
      logger.error({ error }, "JobExpiryJob failed");
    }
  });

  logger.info("JobExpiryJob scheduled (every 5 minutes)");
}
