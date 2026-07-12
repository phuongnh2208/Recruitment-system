/**
 * User domain entity — Rich Domain Model.
 *
 * ═══════════════════════════════════════════════════════════════════
 * WHY RICH DOMAIN MODEL?
 * ═══════════════════════════════════════════════════════════════════
 *
 * Business rules that govern User state transitions are encapsulated
 * inside the entity itself rather than scattered across Use Cases.
 * This prevents anemic domain models and ensures consistency:
 * every code path that changes user state goes through the same
 * validation logic.
 *
 * ═══════════════════════════════════════════════════════════════════
 * IMMUTABILITY NOTE
 * ═══════════════════════════════════════════════════════════════════
 *
 * Fields are private and only exposed via getters. State mutations
 * are performed exclusively through explicit business methods
 * (activate, deactivate, lock, etc.) which enforce invariants and
 * update `updatedAt` automatically.
 *
 * ═══════════════════════════════════════════════════════════════════
 *
 * @category Domain Entity
 */
export class User {
  private _id: string | null;
  private _email: string;
  private _passwordHash: string;
  private _role: string;
  private _isActive: boolean;
  private _emailVerified: boolean;
  private _failedLoginAttempts: number;
  private _lockedUntil: Date | null;
  private _createdAt: Date;
  private _updatedAt: Date;

  constructor(props: UserProps) {
    this._id = props.id;
    this._email = props.email;
    this._passwordHash = props.passwordHash;
    this._role = props.role;
    this._isActive = props.isActive;
    this._emailVerified = props.emailVerified;
    this._failedLoginAttempts = props.failedLoginAttempts;
    this._lockedUntil = props.lockedUntil;
    this._createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
  }

  // ── Getters ──────────────────────────────────────────────────────

  get id(): string | null {
    return this._id;
  }

  get email(): string {
    return this._email;
  }

  get passwordHash(): string {
    return this._passwordHash;
  }

  get role(): string {
    return this._role;
  }

  get isActive(): boolean {
    return this._isActive;
  }

  get emailVerified(): boolean {
    return this._emailVerified;
  }

  get failedLoginAttempts(): number {
    return this._failedLoginAttempts;
  }

  get lockedUntil(): Date | null {
    return this._lockedUntil;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  // ── Business methods ─────────────────────────────────────────────

  /** Activate the user account. */
  activate(): void {
    this._isActive = true;
    this._updatedAt = new Date();
  }

  /** Deactivate the user account. */
  deactivate(): void {
    this._isActive = false;
    this._updatedAt = new Date();
  }

  /** Mark the user's email as verified. */
  verifyEmail(): void {
    this._emailVerified = true;
    this._updatedAt = new Date();
  }

  /**
   * Change the user's password hash.
   * @param newHash - The new hashed password.
   */
  changePassword(newHash: string): void {
    this._passwordHash = newHash;
    this._updatedAt = new Date();
  }

  /** Increment the failed login attempt counter. */
  increaseFailedLoginAttempts(): void {
    this._failedLoginAttempts += 1;
    this._updatedAt = new Date();
  }

  /** Reset the failed login attempt counter to zero. */
  resetFailedLoginAttempts(): void {
    this._failedLoginAttempts = 0;
    this._updatedAt = new Date();
  }

  /**
   * Lock the user account until a specific date/time.
   * @param until - The date/time until which the account is locked.
   */
  lock(until: Date): void {
    this._lockedUntil = until;
    this._updatedAt = new Date();
  }

  /** Unlock the user account (remove any lock). */
  unlock(): void {
    this._lockedUntil = null;
    this._updatedAt = new Date();
  }

  /**
   * Check whether the user is allowed to log in.
   * @returns `true` if the account is active and not locked.
   */
  canLogin(): boolean {
    if (!this._isActive) {
      return false;
    }
    if (this._lockedUntil !== null && this._lockedUntil > new Date()) {
      return false;
    }
    return true;
  }
}

/**
 * Properties required to construct a User entity.
 *
 * The `id` field is `string | null` because the entity may be created
 * before persistence (e.g. by UserFactory). The actual ID is generated
 * by the database (Prisma cuid) when the entity is first saved.
 */
export interface UserProps {
  id: string | null;
  email: string;
  passwordHash: string;
  role: string;
  isActive: boolean;
  emailVerified: boolean;
  failedLoginAttempts: number;
  lockedUntil: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
