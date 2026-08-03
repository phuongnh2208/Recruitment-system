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
  university?: string;
  major?: string;
  graduationYear?: string;
  avatarUrl?: string;
  defaultCvId?: string | null;
}

/** Input for the update profile API call. */
export interface UpdateProfileInput {
  fullName: string;
  phone: string;
  address?: string;
  university?: string;
  major?: string;
  graduationYear?: string;
}

/** Response from the update profile API. */
export interface UpdateProfileResponse {
  success: true;
  data: { studentProfileId: string };
}

/** Response from the get profile API. */
export interface GetProfileResponse {
  success: boolean;
  data: {
    profile: StudentProfile | null;
    exists: boolean;
  };
}
