/**
 * RefreshToken domain entity — Rich Domain Model.
 *
 * ═══════════════════════════════════════════════════════════════════
 * WHY RICH DOMAIN MODEL?
 * ═══════════════════════════════════════════════════════════════════
 *
 * Instead of letting services manipulate token state directly
 * (leading to logic duplication and inconsistency), the entity
 * encapsulates all rules that govern a refresh token's lifecycle:
 *
 *   - What makes a token expired?
 *   - What makes a token revoked?
 *   - Can this token still be used to issue new access tokens?
 *
 * ═══════════════════════════════════════════════════════════════════
 * CONSTRUCTION INVARIANTS
 * ═══════════════════════════════════════════════════════════════════
 *
 * The constructor validates that:
 *   - tokenHash is a non-empty string
 *   - expiresAt is a future date (tokens that already expired at
 *     creation time are meaningless)
 *   - userId is a non-empty string
 *
 * ═══════════════════════════════════════════════════════════════════
 * STATE TRANSITIONS
 * ═══════════════════════════════════════════════════════════════════
 *
 *   RefreshToken (active)
 *     → revoke()     → RefreshToken (revoked)
 *     → touch()      → RefreshToken (updatedAt refreshed)
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

export class RefreshToken {
  private _id: string | null;
  private _userId: string;
  private _tokenHash: string;
  private _expiresAt: Date;
  private _revokedAt: Date | null;
  private _createdAt: Date;
  private _updatedAt: Date;

  /**
   * Construct a RefreshToken entity.
   *
   * @param props - The properties required to build the entity.
   * @throws {ValidationException} If any invariant is violated.
   */
  constructor(props: RefreshTokenProps) {
    this.validateConstruction(props);

    this._id = props.id;
    this._userId = props.userId;
    this._tokenHash = props.tokenHash;
    this._expiresAt = props.expiresAt;
    this._revokedAt = props.revokedAt;
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
   * @param props - The refresh token properties to validate.
   * @throws {ValidationException} When an invariant is violated.
   */
  private validateConstruction(props: RefreshTokenProps): void {
    const errors: string[] = [];

    if (!props.userId || props.userId.trim().length === 0) {
      errors.push("User ID is required");
    }

    if (!props.tokenHash || props.tokenHash.trim().length === 0) {
      errors.push("Token hash is required");
    }

    if (!props.expiresAt) {
      errors.push("Expiration date is required");
    } else if (props.expiresAt <= new Date()) {
      errors.push("Expiration date must be in the future");
    }

    if (errors.length > 0) {
      throw new ValidationException(`RefreshToken construction failed: ${errors.join("; ")}`);
    }
  }

  // ── Getters ──────────────────────────────────────────────────────

  /** Unique identifier. `null` until persisted by the database. */
  get id(): string | null {
    return this._id;
  }

  /** ID of the user to whom this token belongs. */
  get userId(): string {
    return this._userId;
  }

  /** Hashed value of the actual refresh token string. */
  get tokenHash(): string {
    return this._tokenHash;
  }

  /** Date/time after which this token expires. */
  get expiresAt(): Date {
    return this._expiresAt;
  }

  /**
   * Date/time when this token was revoked.
   * `null` means the token has not been revoked.
   */
  get revokedAt(): Date | null {
    return this._revokedAt;
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
   * Revoke this refresh token.
   *
   * Transitions the token from active → revoked. Once revoked, the
   * token can no longer be used to issue new access tokens.
   *
   * @throws {ConflictException} If the token is already revoked.
   */
  revoke(): void {
    if (this._revokedAt !== null) {
      throw new ConflictException("Refresh token is already revoked");
    }
    this._revokedAt = new Date();
    this._updatedAt = new Date();
  }

  /**
   * Check whether the token has expired.
   *
   * @returns `true` if the current time is past `expiresAt`.
   */
  isExpired(): boolean {
    return new Date() > this._expiresAt;
  }

  /**
   * Check whether the token has been revoked.
   *
   * @returns `true` if `revokedAt` is not `null`.
   */
  isRevoked(): boolean {
    return this._revokedAt !== null;
  }

  /**
   * Check whether the token is still valid (not expired and not revoked).
   *
   * @returns `true` if the token can still be used.
   */
  isValid(): boolean {
    return !this.isExpired() && !this.isRevoked();
  }

  /**
   * Touch the token's `updatedAt` timestamp.
   *
   * Use this method when the token's metadata is refreshed (for example,
   * when a new access token is issued using this refresh token) to
   * indicate that the token was recently active.
   */
  touch(): void {
    this._updatedAt = new Date();
  }
}

/**
 * Properties required to construct a RefreshToken entity.
 *
 * The `id` field is `string | null` because the entity may be created
 * before persistence. The actual ID is generated by the database
 * (Prisma cuid) when the entity is first saved.
 *
 * @category Domain Types
 */
export interface RefreshTokenProps {
  /** Unique identifier (generated by the database). */
  id: string | null;
  /** ID of the user who owns this token. */
  userId: string;
  /** Hashed token value. */
  tokenHash: string;
  /** Date/time after which the token expires. */
  expiresAt: Date;
  /** Date/time when the token was revoked. `null` if not revoked. */
  revokedAt: Date | null;
  /** Creation timestamp. */
  createdAt: Date;
  /** Last update timestamp. */
  updatedAt: Date;
}
