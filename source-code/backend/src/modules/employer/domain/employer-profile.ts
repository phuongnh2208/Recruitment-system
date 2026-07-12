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
 * (updateCompanyInfo, verify, changeLogo, etc.) which update
 * `updatedAt` automatically.
 *
 * ═══════════════════════════════════════════════════════════════════
 *
 * @category Domain Entity
 */
export class EmployerProfile {
  private _id: string | null;
  private _userId: string;
  private _companyName: string;
  private _companyDescription: string | null;
  private _website: string | null;
  private _logoUrl: string | null;
  private _contactEmail: string | null;
  private _contactPhone: string | null;
  private _taxCode: string | null;
  private _verified: boolean;
  private _createdAt: Date;
  private _updatedAt: Date;

  constructor(props: EmployerProfileProps) {
    this._id = props.id;
    this._userId = props.userId;
    this._companyName = props.companyName;
    this._companyDescription = props.companyDescription;
    this._website = props.website;
    this._logoUrl = props.logoUrl;
    this._contactEmail = props.contactEmail;
    this._contactPhone = props.contactPhone;
    this._taxCode = props.taxCode;
    this._verified = props.verified;
    this._createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
  }

  // ── Getters ──────────────────────────────────────────────────────

  get id(): string | null {
    return this._id;
  }

  get userId(): string {
    return this._userId;
  }

  get companyName(): string {
    return this._companyName;
  }

  get companyDescription(): string | null {
    return this._companyDescription;
  }

  get website(): string | null {
    return this._website;
  }

  get logoUrl(): string | null {
    return this._logoUrl;
  }

  get contactEmail(): string | null {
    return this._contactEmail;
  }

  get contactPhone(): string | null {
    return this._contactPhone;
  }

  get taxCode(): string | null {
    return this._taxCode;
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

  // ── Business methods ─────────────────────────────────────────────

  /**
   * Update the company's core information.
   *
   * @param companyName        - The updated company name.
   * @param companyDescription - The updated company description (nullable).
   */
  updateCompanyInfo(companyName: string, companyDescription?: string | null): void {
    this._companyName = companyName;
    if (companyDescription !== undefined) {
      this._companyDescription = companyDescription;
    }
    this._updatedAt = new Date();
  }

  /**
   * Update the contact information for the employer.
   *
   * @param contactEmail - The updated contact email (nullable).
   * @param contactPhone - The updated contact phone (nullable).
   */
  updateContact(contactEmail: string | null, contactPhone: string | null): void {
    this._contactEmail = contactEmail;
    this._contactPhone = contactPhone;
    this._updatedAt = new Date();
  }

  /** Mark this employer profile as verified. */
  verify(): void {
    this._verified = true;
    this._updatedAt = new Date();
  }

  /** Mark this employer profile as not verified. */
  unverify(): void {
    this._verified = false;
    this._updatedAt = new Date();
  }

  /**
   * Change the company logo.
   *
   * @param logoUrl - The URL of the new logo (nullable).
   */
  changeLogo(logoUrl: string | null): void {
    this._logoUrl = logoUrl;
    this._updatedAt = new Date();
  }

  /**
   * Change the company website.
   *
   * @param website - The new website URL (nullable).
   */
  changeWebsite(website: string | null): void {
    this._website = website;
    this._updatedAt = new Date();
  }

  /**
   * Change the company description.
   *
   * @param description - The new company description (nullable).
   */
  changeDescription(description: string | null): void {
    this._companyDescription = description;
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
  companyDescription: string | null;
  website: string | null;
  logoUrl: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  taxCode: string | null;
  verified: boolean;
  createdAt: Date;
  updatedAt: Date;
}
