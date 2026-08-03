/**
 * JobState — Value Object representing the lifecycle state of a JobPosting.
 *
 * ═══════════════════════════════════════════════════════════════════
 * WHY VALUE OBJECT?
 * ═══════════════════════════════════════════════════════════════════
 *
 * JobState is a Value Object because:
 *
 * 1. Immutability: Once created, the state value cannot change.
 *    Transitions create a conceptual state change on the entity,
 *    but the VO itself is immutable.
 *
 * 2. Equality by value: Two JobState instances with the same state
 *    string are considered equal.
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
 *   DRAFT     — Initial state after creation. Not yet submitted.
 *   SUBMITTED — Submitted for approval, awaiting admin review.
 *   APPROVED  — Approved and visible to candidates.
 *   REJECTED  — Rejected during review.
 *   CLOSED    — Manually closed by the employer.
 *   EXPIRED   — Automatically expired after the deadline passed.
 *
 * ═══════════════════════════════════════════════════════════════════
 * BUSINESS TRANSITIONS
 * ═══════════════════════════════════════════════════════════════════
 *
 *   DRAFT ────────── submit ───────────→ SUBMITTED
 *   SUBMITTED ────── approve ──────────→ APPROVED
 *   SUBMITTED ────── reject ───────────→ REJECTED
 *   REJECTED ─────── reopen ───────────→ DRAFT
 *   APPROVED ─────── close ────────────→ CLOSED
 *   APPROVED ─────── expire ───────────→ EXPIRED
 *
 * Each transition is validated by its own method on JobState.
 *
 * @category Value Object
 */

import { ValidationException } from "../../../../common/exceptions/validation-exception";

/**
 * Allowed JobState values.
 */
export type JobStateValue = "DRAFT" | "SUBMITTED" | "APPROVED" | "REJECTED" | "CLOSED" | "EXPIRED";

const ALLOWED_VALUES: readonly JobStateValue[] = [
  "DRAFT",
  "SUBMITTED",
  "APPROVED",
  "REJECTED",
  "CLOSED",
  "EXPIRED",
] as const;

export class JobState {
  private readonly _value: JobStateValue;

  constructor(value: JobStateValue) {
    if (!ALLOWED_VALUES.includes(value)) {
      throw new ValidationException(`Invalid JobState: ${value}`);
    }
    this._value = value;
  }

  // ── Factory methods ──────────────────────────────────────────────

  /** Returns the DRAFT state. */
  static draft(): JobState {
    return new JobState("DRAFT");
  }

  /** Returns the SUBMITTED state. */
  static submitted(): JobState {
    return new JobState("SUBMITTED");
  }

  /** Returns the APPROVED state. */
  static approved(): JobState {
    return new JobState("APPROVED");
  }

  /** Returns the REJECTED state. */
  static rejected(): JobState {
    return new JobState("REJECTED");
  }

  /** Returns the CLOSED state. */
  static closed(): JobState {
    return new JobState("CLOSED");
  }

  /** Returns the EXPIRED state. */
  static expired(): JobState {
    return new JobState("EXPIRED");
  }

  // ── Getters ───────────────────────────────────────────────────────

  get value(): JobStateValue {
    return this._value;
  }

  // ── Equality ──────────────────────────────────────────────────────

  equals(other: JobState): boolean {
    return this._value === other._value;
  }

  // ── Display ───────────────────────────────────────────────────────

  toString(): string {
    return this._value;
  }

  // ── Transition validation methods ─────────────────────────────────

  /**
   * Returns true if this state can transition to SUBMITTED.
   * Only DRAFT can be submitted.
   */
  canSubmit(): boolean {
    return this._value === "DRAFT";
  }

  /**
   * Returns true if this state can transition to APPROVED.
   * Only SUBMITTED can be approved.
   */
  canApprove(): boolean {
    return this._value === "SUBMITTED";
  }

  /**
   * Returns true if this state can transition to REJECTED.
   * Only SUBMITTED can be rejected.
   */
  canReject(): boolean {
    return this._value === "SUBMITTED";
  }

  /**
   * Returns true if this state can transition to DRAFT (reopen).
   * Only REJECTED can be reopened.
   */
  canReopen(): boolean {
    return this._value === "REJECTED";
  }

  /**
   * Returns true if this state can transition to CLOSED.
   * Only APPROVED can be closed.
   */
  canClose(): boolean {
    return this._value === "APPROVED";
  }

  // ── Convenience checks ────────────────────────────────────────────

  /** Returns true if the posting is publicly visible. */
  isVisible(): boolean {
    return this._value === "APPROVED";
  }

  /** Returns true if the posting is editable by the employer. */
  isEditable(): boolean {
    return this._value === "DRAFT" || this._value === "REJECTED";
  }
}
