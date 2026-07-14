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
 * CONSTRUCTION INVARIANTS
 * ═══════════════════════════════════════════════════════════════════
 *
 * The constructor validates that required fields are provided and
 * that failure-sensitive counts are non-negative. This guarantees
 * that a User entity can never exist in an invalid state:
 *
 *   - email must be a non-empty string
 *   - passwordHash must be a non-empty string
 *   - role must be a non-empty string
 *   - failedLoginAttempts must be >= 0
 *
 * ═══════════════════════════════════════════════════════════════════
 * STATE TRANSITIONS
 * ═══════════════════════════════════════════════════════════════════
 *
 * All mutations go through explicit business methods that enforce
 * preconditions and update `updatedAt` automatically:
 *
 *   User (active)
 *     → deactivate()           → User (inactive)
 *     → verifyEmail()          → User (emailVerified)
 *     → increaseFailedLogin()  → User (more failures)
 *     → resetFailedLogin()     → User (0 failures)
 *     → lock(until)            → User (lockedUntil = until)
 *     → changePassword(hash)   → User (new passwordHash)
 *
 *   User (inactive)
 *     → activate()             → User (active)
 *
 *   User (locked)
 *     → unlock()               → User (not locked)
 *
 * ═══════════════════════════════════════════════════════════════════
 * CLEAN ARCHITECTURE BOUNDARIES
 * ═══════════════════════════════════════════════════════════════════
 *
 * This entity belongs to the Domain layer. It depends ONLY on:
 *   - TypeScript built-ins
 *   - Custom BusinessException subclasses (domain-level concepts)
 *
 * It does NOT depend on:
 *   - Prisma / Databases / ORMs
 *   - Express / Controllers / DTOs
 *   - Repositories or Services
 *   - Third-party libraries
 *
 * ═══════════════════════════════════════════════════════════════════
 *
 * @category Domain Entity
 */

import { ValidationException } from "../../../../common/exceptions/validation-exception";
import { ConflictException } from "../../../../common/exceptions/conflict-exception";

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

  /**
   * Construct a User entity.
   *
   * @param props - The properties required to build the entity.
   * @throws {ValidationException} If any invariant is violated.
   */
  constructor(props: UserProps) {
    this.validateConstruction(props);

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

  // ── Construction invariants ──────────────────────────────────────

  /**
   * Validate construction invariants.
   *
   * Ensures that the entity is never created with invalid or incomplete
   * data. Called once inside the constructor.
   *
   * @param props - The user properties to validate.
   * @throws {ValidationException} When an invariant is violated.
   */
  private validateConstruction(props: UserProps): void {
    const errors: string[] = [];

    if (!props.email || props.email.trim().length === 0) {
      errors.push("Email is required");
    }

    if (!props.passwordHash || props.passwordHash.trim().length === 0) {
      errors.push("Password hash is required");
    }

    if (!props.role || props.role.trim().length === 0) {
      errors.push("Role is required");
    }

    if (props.failedLoginAttempts < 0) {
      errors.push("Failed login attempts must be a non-negative number");
    }

    if (errors.length > 0) {
      throw new ValidationException(`User construction failed: ${errors.join("; ")}`);
    }
  }

  // ── Getters ──────────────────────────────────────────────────────

  /** Unique identifier. `null` until persisted by the database. */
  get id(): string | null {
    return this._id;
  }

  /** Email address (used for login). */
  get email(): string {
    return this._email;
  }

  /** Bcrypt hash of the user's password. */
  get passwordHash(): string {
    return this._passwordHash;
  }

  /** Role assigned to this user (e.g. "CANDIDATE", "EMPLOYER", "ADMIN"). */
  get role(): string {
    return this._role;
  }

  /** Whether the account is currently active. */
  get isActive(): boolean {
    return this._isActive;
  }

  /** Whether the user's email has been verified. */
  get emailVerified(): boolean {
    return this._emailVerified;
  }

  /** Number of consecutive failed login attempts. */
  get failedLoginAttempts(): number {
    return this._failedLoginAttempts;
  }

  /**
   * Date/time until which the account is locked.
   * `null` means the account is not locked.
   */
  get lockedUntil(): Date | null {
    return this._lockedUntil;
  }

  /** Timestamp of entity creation. */
  get createdAt(): Date {
    return this._createdAt;
  }

  /** Timestamp of the last update. Updated automatically by every business method. */
  get updatedAt(): Date {
    return this._updatedAt;
  }

  // ── Business methods ─────────────────────────────────────────────

  /**
   * Activate the user account.
   *
   * Transitions the user from inactive → active.
   *
   * @throws {ConflictException} If the account is already active.
   */
  activate(): void {
    if (this._isActive) {
      throw new ConflictException("Account is already active");
    }
    this._isActive = true;
    this._updatedAt = new Date();
  }

  /**
   * Deactivate the user account.
   *
   * Transitions the user from active → inactive.
   *
   * @throws {ConflictException} If the account is already inactive.
   */
  deactivate(): void {
    if (!this._isActive) {
      throw new ConflictException("Account is already inactive");
    }
    this._isActive = false;
    this._updatedAt = new Date();
  }

  /**
   * Mark the user's email as verified.
   *
   * @throws {ConflictException} If the email is already verified.
   */
  verifyEmail(): void {
    if (this._emailVerified) {
      throw new ConflictException("Email is already verified");
    }
    this._emailVerified = true;
    this._updatedAt = new Date();
  }

  /**
   * Change the user's password hash.
   *
   * @param newHash - The new bcrypt hash of the password.
   * @throws {ValidationException} If `newHash` is empty.
   */
  changePassword(newHash: string): void {
    if (!newHash || newHash.trim().length === 0) {
      throw new ValidationException("New password hash must not be empty");
    }
    this._passwordHash = newHash;
    this._updatedAt = new Date();
  }

  /**
   * Increment the failed login attempt counter.
   *
   * Call this when authentication fails. When the count reaches a
   * threshold (e.g. 5), the application layer should call `lock()`
   * to temporarily disable the account.
   */
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
   *
   * Typically called after too many failed login attempts.
   *
   * @param until - The date/time until which the account is locked.
   * @throws {ValidationException} If `until` is in the past.
   */
  lock(until: Date): void {
    if (until <= new Date()) {
      throw new ValidationException("Lock expiry must be in the future");
    }
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
   *
   * @returns `true` if the account is active AND not currently locked.
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

  /**
   * Check whether the account is currently locked.
   *
   * @returns `true` if `lockedUntil` is set and has not yet expired.
   */
  isLocked(): boolean {
    return this._lockedUntil !== null && this._lockedUntil > new Date();
  }
}

/**
 * Properties required to construct a User entity.
 *
 * The `id` field is `string | null` because the entity may be created
 * before persistence (e.g. by UserFactory). The actual ID is generated
 * by the database (Prisma cuid) when the entity is first saved.
 *
 * @category Domain Types
 */
export interface UserProps {
  /** Unique identifier (generated by the database). */
  id: string | null;
  /** Email address. */
  email: string;
  /** Bcrypt hash of the password. */
  passwordHash: string;
  /** User role identifier. */
  role: string;
  /** Whether the account is active. */
  isActive: boolean;
  /** Whether the email has been verified. */
  emailVerified: boolean;
  /** Consecutive failed login attempts. */
  failedLoginAttempts: number;
  /** Lock expiry timestamp. `null` if not locked. */
  lockedUntil: Date | null;
  /** Creation timestamp. */
  createdAt: Date;
  /** Last update timestamp. */
  updatedAt: Date;
}
