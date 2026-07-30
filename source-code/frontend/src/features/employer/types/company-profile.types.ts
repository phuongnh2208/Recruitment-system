/**
 * Employer feature type definitions.
 */

/** Company profile data matching the backend UpdateCompanyProfileCommand. */
export interface EmployerProfile {
  id?: string;
  userId?: string;
  companyName: string;
  description?: string | null;
  website?: string | null;
  logoUrl?: string | null;
  verified?: boolean;
  verifiedAt?: string | null;
  address?: string | null;
}

/** Input for the update company profile API call. */
export interface UpdateCompanyProfileInput {
  companyName: string;
  description?: string | null;
  website?: string | null;
  logoUrl?: string | null;
}

/** Response from the update company profile API. */
export interface UpdateCompanyProfileResponse {
  success: true;
  employerProfileId: string;
}
