/**
 * StudentProfile domain entity — Rich Domain Model.
 *
 * ═══════════════════════════════════════════════════════════════════
 * WHY RICH DOMAIN MODEL?
 * ═══════════════════════════════════════════════════════════════════
 *
 * Business rules that govern StudentProfile state transitions are
 * encapsulated inside the entity itself rather than scattered across
 * Use Cases. This prevents anemic domain models and ensures
 * consistency: every code path that changes student profile state
 * goes through the same validation and updatedAt management logic.
 *
 * ═══════════════════════════════════════════════════════════════════
 * IMMUTABILITY NOTE
 * ═══════════════════════════════════════════════════════════════════
 *
 * Fields are private and only exposed via getters. State mutations
 * are performed exclusively through explicit business methods
 * (updateProfile, changePhone, etc.) which update `updatedAt`
 * automatically.
 *
 * ═══════════════════════════════════════════════════════════════════
 *
 * @category Domain Entity
 */
export class StudentProfile {
  private _id: string | null;
  private _userId: string;
  private _fullName: string;
  private _phone: string | null;
  private _address: string | null;
  private _university: string | null;
  private _major: string | null;
  private _avatarUrl: string | null;
  private _defaultCvId: string | null;
  private _role: string;
  private _createdAt: Date;
  private _updatedAt: Date;

  constructor(props: StudentProfileProps) {
    this._id = props.id;
    this._userId = props.userId;
    this._fullName = props.fullName;
    this._phone = props.phone;
    this._address = props.address;
    this._university = props.university;
    this._major = props.major;
    this._avatarUrl = props.avatarUrl;
    this._defaultCvId = props.defaultCvId;
    this._role = props.role;
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

  get fullName(): string {
    return this._fullName;
  }

  get phone(): string | null {
    return this._phone;
  }

  get address(): string | null {
    return this._address;
  }

  get university(): string | null {
    return this._university;
  }

  get major(): string | null {
    return this._major;
  }

  get avatarUrl(): string | null {
    return this._avatarUrl;
  }

  get defaultCvId(): string | null {
    return this._defaultCvId;
  }

  get role(): string {
    return this._role;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  // ── Business methods ─────────────────────────────────────────────

  /**
   * Update the student's profile information.
   *
   * @param fullName  - Updated full name.
   * @param phone     - Updated phone number (nullable).
   * @param address   - Updated address (nullable).
   * @param university - Updated university (nullable).
   * @param major     - Updated major (nullable).
   * @param avatarUrl - Updated avatar URL (optional, nullable).
   */
  updateProfile(
    fullName: string,
    phone: string | null,
    address: string | null,
    university: string | null,
    major: string | null,
    avatarUrl?: string | null,
  ): void {
    this._fullName = fullName;
    this._phone = phone;
    this._address = address;
    this._university = university;
    this._major = major;
    if (avatarUrl !== undefined) {
      this._avatarUrl = avatarUrl;
    }
    this._updatedAt = new Date();
  }

  /**
   * Change the student's phone number.
   *
   * @param phone - The new phone number (nullable).
   */
  changePhone(phone: string | null): void {
    this._phone = phone;
    this._updatedAt = new Date();
  }

  /**
   * Change the student's address.
   *
   * @param address - The new address (nullable).
   */
  changeAddress(address: string | null): void {
    this._address = address;
    this._updatedAt = new Date();
  }

  /**
   * Change the student's university.
   *
   * @param university - The new university (nullable).
   */
  changeUniversity(university: string | null): void {
    this._university = university;
    this._updatedAt = new Date();
  }

  /**
   * Change the student's major.
   *
   * @param major - The new major (nullable).
   */
  changeMajor(major: string | null): void {
    this._major = major;
    this._updatedAt = new Date();
  }

  /**
   * Set the default CV for this student profile.
   *
   * @param cvId - The ID of the CV to set as default.
   */
  setDefaultCv(cvId: string): void {
    this._defaultCvId = cvId;
    this._updatedAt = new Date();
  }

  /**
   * Remove the default CV reference from this student profile.
   */
  removeDefaultCv(): void {
    this._defaultCvId = null;
    this._updatedAt = new Date();
  }
}

/**
 * Properties required to construct a StudentProfile entity.
 *
 * The `id` field is `string | null` because the entity may be created
 * before persistence (e.g. by StudentProfileFactory). The actual ID is
 * generated by the database (Prisma cuid) when the entity is first saved.
 */
export interface StudentProfileProps {
  id: string | null;
  userId: string;
  fullName: string;
  phone: string | null;
  address: string | null;
  university: string | null;
  major: string | null;
  avatarUrl: string | null;
  defaultCvId: string | null;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}
