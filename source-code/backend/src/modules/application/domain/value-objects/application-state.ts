/**
 * ApplicationState — Value Object representing the lifecycle state of an Application.
 *
 * ═══════════════════════════════════════════════════════════════════
 * WHY VALUE OBJECT?
 * ═══════════════════════════════════════════════════════════════════
 *
 * ApplicationState is a Value Object because:
 *
 * 1. Immutability: Once created, the state value cannot change.
 *    Transitions create a conceptual state change on the entity,
 *    but the VO itself is immutable.
 *
 * 2. Equality by value: Two ApplicationState instances with the same
 *    state string are considered equal.
 *
 * 3. Self-validation: Invalid states are rejected at construction.
 *
 * 4. No identity: A state value does not have its own identity;
 *    it is defined solely by what it represents.
 *
 * ═══════════════════════════════════════════════════════════════════
 * ALLOWED VALUES
 * ═══════════════════════════════════════════════════════════════════
 *
 *   APPLIED       — Initial state after submission.
 *   UNDER_REVIEW  — Application is being reviewed by the employer.
 *   ACCEPTED      — Application has been accepted. Terminal state.
 *   REJECTED      — Application has been rejected. Terminal state.
 *   WITHDRAWN     — Application has been withdrawn by the student. Terminal state.
 *
 * ═══════════════════════════════════════════════════════════════════
 * BUSINESS TRANSITIONS
 * ═══════════════════════════════════════════════════════════════════
 *
 *   APPLIED ────────── review ──────────→ UNDER_REVIEW
 *   UNDER_REVIEW ───── accept ──────────→ ACCEPTED
 *   APPLIED ────────── reject ──────────→ REJECTED
 *   UNDER_REVIEW ───── reject ──────────→ REJECTED
 *   APPLIED ────────── withdraw ────────→ WITHDRAWN
 *   UNDER_REVIEW ───── withdraw ────────→ WITHDRAWN
 *
 * Each transition is validated by its own method on ApplicationState.
 *
 * @category Value Object
 */

import { ValidationException } from "../../../../common/exceptions/validation-exception";

/**
 * Allowed ApplicationState values.
 */
export type ApplicationStateValue =
  "APPLIED" | "UNDER_REVIEW" | "ACCEPTED" | "REJECTED" | "WITHDRAWN";

const ALLOWED_VALUES: readonly ApplicationStateValue[] = [
  "APPLIED",
  "UNDER_REVIEW",
  "ACCEPTED",
  "REJECTED",
  "WITHDRAWN",
] as const;

export class ApplicationState {
  private readonly _value: ApplicationStateValue;

  constructor(value: ApplicationStateValue) {
    if (!ALLOWED_VALUES.includes(value)) {
      throw new ValidationException(`Invalid ApplicationState: ${value}`);
    }
    this._value = value;
  }

  // ── Factory methods ──────────────────────────────────────────────

  /** Returns the APPLIED state. */
  static applied(): ApplicationState {
    return new ApplicationState("APPLIED");
  }

  /** Returns the UNDER_REVIEW state. */
  static underReview(): ApplicationState {
    return new ApplicationState("UNDER_REVIEW");
  }

  /** Returns the ACCEPTED state. */
  static accepted(): ApplicationState {
    return new ApplicationState("ACCEPTED");
  }

  /** Returns the REJECTED state. */
  static rejected(): ApplicationState {
    return new ApplicationState("REJECTED");
  }

  /** Returns the WITHDRAWN state. */
  static withdrawn(): ApplicationState {
    return new ApplicationState("WITHDRAWN");
  }

  // ── Getters ───────────────────────────────────────────────────────

  get value(): ApplicationStateValue {
    return this._value;
  }

  // ── Equality ──────────────────────────────────────────────────────

  equals(other: ApplicationState): boolean {
    return this._value === other._value;
  }

  // ── Display ───────────────────────────────────────────────────────

  toString(): string {
    return this._value;
  }

  // ── Transition validation methods ─────────────────────────────────

  /**
   * Returns true if this state can transition to UNDER_REVIEW.
   * Only APPLIED can be reviewed.
   */
  canReview(): boolean {
    return this._value === "APPLIED";
  }

  /**
   * Returns true if this state can transition to ACCEPTED.
   * Only UNDER_REVIEW can be accepted.
   */
  canAccept(): boolean {
    return this._value === "UNDER_REVIEW";
  }

  /**
   * Returns true if this state can transition to REJECTED.
   * APPLIED and UNDER_REVIEW can be rejected.
   */
  canReject(): boolean {
    return this._value === "APPLIED" || this._value === "UNDER_REVIEW";
  }

  /**
   * Returns true if this state can transition to WITHDRAWN.
   * APPLIED and UNDER_REVIEW can be withdrawn.
   */
  canWithdraw(): boolean {
    return this._value === "APPLIED" || this._value === "UNDER_REVIEW";
  }

  // ── Convenience checks ────────────────────────────────────────────

  /** Returns true if the application is still active (APPLIED or UNDER_REVIEW). */
  isActive(): boolean {
    return this._value === "APPLIED" || this._value === "UNDER_REVIEW";
  }
}
