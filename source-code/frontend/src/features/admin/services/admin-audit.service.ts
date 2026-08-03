/**
 * Admin Audit Log API service layer.
 *
 * ═══════════════════════════════════════════════════════════════════
 * SERVICE LAYER
 * ═══════════════════════════════════════════════════════════════════
 *
 * This file contains all API calls for the Admin Audit Log feature.
 * Components and hooks MUST NOT call axios directly — they delegate
 * to this service.
 *
 * @category Frontend / Service
 */

import { axiosInstance } from "../../../core/api/axios";
import { ENDPOINTS } from "../../../core/api/endpoints";

export interface AuditLogItem {
  id: string;
  actorId: string;
  action: string;
  entity: string;
  entityId: string;
  metadata: Record<string, unknown> | null;
  timestamp: Date;
}

export interface AuditLogsResponse {
  items: AuditLogItem[];
  total: number;
  page: number;
  limit: number;
}

export interface AuditLogsParams {
  page?: number;
  limit?: number;
  actorId?: string;
  action?: string;
  dateFrom?: string;
  dateTo?: string;
}

/**
 * Fetch paginated audit logs with filters.
 *
 * Calls GET /admin/audit-logs with query parameters.
 *
 * @param params - Pagination and filter parameters.
 * @returns Paginated audit log response.
 */
async function fetchAuditLogs(
  params: AuditLogsParams = {},
): Promise<AuditLogsResponse> {
  const searchParams = new URLSearchParams();
  searchParams.set("page", (params.page ?? 1).toString());
  searchParams.set("limit", (params.limit ?? 10).toString());

  if (params.actorId) {
    searchParams.set("actorId", params.actorId);
  }
  if (params.action) {
    searchParams.set("action", params.action);
  }
  if (params.dateFrom) {
    searchParams.set("dateFrom", params.dateFrom);
  }
  if (params.dateTo) {
    searchParams.set("dateTo", params.dateTo);
  }

  const response = await axiosInstance.get<{
    success: true;
    data: AuditLogsResponse;
  }>(`${ENDPOINTS.ADMIN.AUDIT_LOGS}?${searchParams.toString()}`);
  return response.data.data;
}

/**
 * Admin Audit Log API service object.
 */
export const adminAuditService = {
  getAuditLogs: fetchAuditLogs,
};
