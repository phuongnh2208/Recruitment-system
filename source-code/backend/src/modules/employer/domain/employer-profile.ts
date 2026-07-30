/**
 * EmployerProfile domain entity — Rich Domain Model.
 *
 * ═══════════════════════════════════════════════════════════════════
 * WHY RICH DOMAIN MODEL?
 * ═══════════════════════════════════════════════════════════════════
 *
 * Business rules that govern EmployerProfile state transitions are
 * encapsulated inside the entity itself rather than scattered across
 * Use Cases. This prevents anemic domain models and ensures
 * consistency: every code path that changes employer profile state
 * goes through the same validation and updatedAt management logic.
 *
 * ═══════════════════════════════════════════════════════════════════
 * IMMUTABILITY NOTE
 * ═══════════════════════════════════════════════════════════════════
 *
 * Fields are private and only exposed via getters. State mutations
 * are performed exclusively through explicit business methods
 * (verify, unverify, updateCompanyName, updateDescription, updateWebsite,
 * updateLogo, touch) which update `updatedAt` automatically.
 *
 * ═══════════════════════════════════════════════════════════════════
 * CONSTRUCTION INVARIANTS
 * ═══════════════════════════════════════════════════════════════════
 *
 * Validated in constructor:
 * - companyName: must not be empty
 * - userId: must not be empty
 * - website: if provided, must be a valid URL
 * - description: nullable
 * - logoUrl: nullable
 * - verified: defaults to false
 * - createdAt: must not be null
 * - updatedAt: must not be null
 *
 * Violation throws ValidationException.
 *
 * ═══════════════════════════════════════════════════════════════════
 * BUSINESS METHODS
 * ═══════════════════════════════════════════════════════════════════
 *
 * verify()       - Marks employer as verified. Throws ConflictException if already verified.
 * unverify()     - Marks employer as not verified. Throws ConflictException if not verified.
 * updateCompanyName(name) - Updates company name. Validates not empty.
 * updateDescription(description) - Updates description (nullable).
 * updateWebsite(url) - Updates website. Validates URL if provided.
 * updateLogo(url) - Updates logo URL (nullable).
 * touch()        - Updates updatedAt timestamp.
 *
 * No public setters. No new object returned.
 *
 * @category Domain Entity
 */
import { ValidationException } from "../../../common/exceptions/validation-exception";
import { ConflictException } from "../../../common/exceptions/conflict-exception";

export class EmployerProfile {
  private _id: string | null;
  private _userId: string;
  private _companyName: string;
  private _description: string | null;
  private _website: string | null;
  private _logoUrl: string | null;
  private _verified: boolean;
  private _createdAt: Date;
  private _updatedAt: Date;

  constructor(props: EmployerProfileProps) {
    // Construction Invariants
    if (!props.userId || props.userId.trim() === "") {
      throw new ValidationException("userId must not be empty");
    }
    if (!props.companyName || props.companyName.trim() === "") {
      throw new ValidationException("companyName must not be empty");
    }
    if (props.website !== null && props.website !== undefined && props.website.trim() !== "") {
      if (!this.isValidUrl(props.website)) {
        throw new ValidationException("website must be a valid URL");
      }
    }
    if (props.createdAt === null || props.createdAt === undefined) {
      throw new ValidationException("createdAt must not be null");
    }
    if (props.updatedAt === null || props.updatedAt === undefined) {
      throw new ValidationException("updatedAt must not be null");
    }

    this._id = props.id;
    this._userId = props.userId;
    this._companyName = props.companyName;
    this._description = props.description;
    this._website = props.website;
    this._logoUrl = props.logoUrl;
    this._verified = props.verified ?? false;
    this._createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
  }

  /**
   * Validates if a string is a valid URL.
   */
  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  // ── Getters ────────────────────────────────────────────────────────

  get id(): string | null {
    return this._id;
  }

  get userId(): string {
    return this._userId;
  }

  get companyName(): string {
    return this._companyName;
  }

  get description(): string | null {
    return this._description;
  }

  get website(): string | null {
    return this._website;
  }

  get logoUrl(): string | null {
    return this._logoUrl;
  }

  get verified(): boolean {
    return this._verified;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  // ── Business Methods ───────────────────────────────────────────────

  /**
   * Marks the employer profile as verified.
   * @throws ConflictException if already verified.
   */
  verify(): void {
    if (this._verified) {
      throw new ConflictException("Employer profile is already verified");
    }
    this._verified = true;
    this._updatedAt = new Date();
  }

  /**
   * Marks the employer profile as not verified.
   * @throws ConflictException if not verified.
   */
  unverify(): void {
    if (!this._verified) {
      throw new ConflictException("Employer profile is not verified");
    }
    this._verified = false;
    this._updatedAt = new Date();
  }

  /**
   * Updates the company name.
   * @param name - The new company name (must not be empty).
   * @throws ValidationException if name is empty.
   */
  updateCompanyName(name: string): void {
    if (!name || name.trim() === "") {
      throw new ValidationException("companyName must not be empty");
    }
    this._companyName = name;
    this._updatedAt = new Date();
  }

  /**
   * Updates the company description.
   * @param description - The new description (nullable).
   */
  updateDescription(description: string | null): void {
    this._description = description;
    this._updatedAt = new Date();
  }

  /**
   * Updates the company website.
   * @param url - The new website URL (nullable, but must be valid if provided).
   * @throws ValidationException if URL is provided but invalid.
   */
  updateWebsite(url: string | null): void {
    if (url !== null && url !== undefined && url.trim() !== "") {
      if (!this.isValidUrl(url)) {
        throw new ValidationException("website must be a valid URL");
      }
    }
    this._website = url;
    this._updatedAt = new Date();
  }

  /**
   * Updates the company logo URL.
   * @param url - The new logo URL (nullable).
   */
  updateLogo(url: string | null): void {
    this._logoUrl = url;
    this._updatedAt = new Date();
  }

  /**
   * Updates the updatedAt timestamp to now.
   * Useful for tracking when the entity was last touched.
   */
  touch(): void {
    this._updatedAt = new Date();
  }
}

/**
 * Properties required to construct an EmployerProfile entity.
 *
 * The `id` field is `string | null` because the entity may be created
 * before persistence (e.g. by EmployerProfileFactory). The actual ID
 * is generated by the database (Prisma cuid) when the entity is first
 * saved.
 */
export interface EmployerProfileProps {
  id: string | null;
  userId: string;
  companyName: string;
  description: string | null;
  website: string | null;
  logoUrl: string | null;
  verified: boolean;
  createdAt: Date;
  updatedAt: Date;
}
