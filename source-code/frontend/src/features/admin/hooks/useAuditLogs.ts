/**
 * useAuditLogs — React Query hook for fetching audit logs.
 *
 * @category Frontend / Hook
 */

import { useQuery } from "@tanstack/react-query";
import { adminAuditService } from "../services/admin-audit.service";
import type { AuditLogsParams } from "../services/admin-audit.service";

export function useAuditLogs(params: AuditLogsParams = {}) {
  return useQuery({
    queryKey: ["admin", "audit-logs", params],
    queryFn: () => adminAuditService.getAuditLogs(params),
  });
}
