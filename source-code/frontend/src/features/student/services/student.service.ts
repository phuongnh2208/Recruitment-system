/**
 * Student API service layer.
 *
 * ═══════════════════════════════════════════════════════════════════
 * SERVICE LAYER
 * ═══════════════════════════════════════════════════════════════════
 *
 * This file contains all API calls for the Student feature. Components
 * and hooks MUST NOT call axios directly — they delegate to this service.
 *
 * ═══════════════════════════════════════════════════════════════════
 * CLEAN ARCHITECTURE BOUNDARY
 * ═══════════════════════════════════════════════════════════════════
 *
 *   - ✅ API calls only (axios instance + endpoint constants)
 *   - ❌ No business logic
 *   - ❌ No form state management
 *   - ❌ No React hooks
 */

import { axiosInstance } from "../../../core/api/axios";
import { ENDPOINTS } from "../../../core/api/endpoints";
import type {
  UpdateProfileInput,
  UpdateProfileResponse,
} from "../types/student.types";
import type {
  CvListResponse,
  CvUploadResponse,
  CvActionResponse,
} from "../types/cv.types";

/**
 * Update the authenticated student's profile.
 *
 * Calls PATCH /student/profile with the provided profile data.
 *
 * @param data - The profile fields to update.
 * @returns The API response containing success status and profile ID.
 */
export async function updateProfile(
  data: UpdateProfileInput,
): Promise<UpdateProfileResponse> {
  const response = await axiosInstance.patch<UpdateProfileResponse>(
    ENDPOINTS.STUDENT.PROFILE,
    data,
  );
  return response.data;
}

/**
 * Fetch the list of CVs for the authenticated student.
 *
 * Calls GET /student/cv
 *
 * @returns The API response containing the CV list.
 */
export async function getCvList(): Promise<CvListResponse> {
  const response = await axiosInstance.get<CvListResponse>(
    ENDPOINTS.STUDENT.CV_LIST,
  );
  return response.data;
}

/**
 * Upload a new CV file.
 *
 * Calls POST /student/cv/upload with a multipart/form-data payload.
 *
 * @param file - The PDF file to upload.
 * @param onProgress - Optional callback for upload progress (0–100).
 * @returns The API response containing the uploaded CV metadata.
 */
export async function uploadCv(
  file: File,
  onProgress?: (percent: number) => void,
): Promise<CvUploadResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await axiosInstance.post<CvUploadResponse>(
    ENDPOINTS.STUDENT.CV_UPLOAD,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percent = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total,
          );
          onProgress(percent);
        }
      },
    },
  );
  return response.data;
}

/**
 * Delete a CV by its ID.
 *
 * Calls DELETE /student/cv/:cvId
 *
 * @param cvId - The ID of the CV to delete.
 * @returns The API response indicating success.
 */
export async function deleteCv(cvId: string): Promise<CvActionResponse> {
  const response = await axiosInstance.delete<CvActionResponse>(
    ENDPOINTS.STUDENT.CV_DELETE(cvId),
  );
  return response.data;
}

/**
 * Set a CV as the default CV.
 *
 * Calls PATCH /student/cv/:cvId/default
 *
 * @param cvId - The ID of the CV to set as default.
 * @returns The API response indicating success.
 */
export async function setDefaultCv(cvId: string): Promise<CvActionResponse> {
  const response = await axiosInstance.patch<CvActionResponse>(
    ENDPOINTS.STUDENT.CV_SET_DEFAULT(cvId),
  );
  return response.data;
}
