/**
 * Student feature type definitions.
 */

/** Student profile data matching the backend UpdateProfileCommand. */
export interface StudentProfile {
  id?: string;
  userId?: string;
  fullName: string;
  phone: string;
  address?: string;
  school?: string;
  major?: string;
  graduationYear?: string;
  avatarUrl?: string;
}

/** Input for the update profile API call. */
export interface UpdateProfileInput {
  fullName: string;
  phone: string;
  address?: string;
  school?: string;
  major?: string;
  graduationYear?: string;
}

/** Response from the update profile API. */
export interface UpdateProfileResponse {
  success: true;
  studentProfileId: string;
}
