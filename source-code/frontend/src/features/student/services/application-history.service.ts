import { axiosInstance } from "../../../core/api/axios";
import { ENDPOINTS } from "../../../core/api/endpoints";
import type { ApplicationHistoryResponse } from "../types/application-history.types";

/**
 * Service for fetching a student's application history.
 * Delegates to the backend endpoint `/api/student/applications`.
 */
export const applicationHistoryService = {
  /**
   * @param page - 1-based page number
   * @param size - number of items per page
   */
  getHistory: async (
    page: number,
    size: number,
  ): Promise<ApplicationHistoryResponse> => {
    const res = await axiosInstance.get<ApplicationHistoryResponse>(
      `${ENDPOINTS.STUDENT.APPLICATIONS}?page=${page}&size=${size}`,
    );
    return res.data;
  },
};
