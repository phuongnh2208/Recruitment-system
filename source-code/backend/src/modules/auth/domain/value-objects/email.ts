import { ValidationException } from "../../../../common/exceptions/validation-exception";

/**
 * Email Value Object.
 *
 * ═══════════════════════════════════════════════════════════════════
 * VALUE OBJECT
 * ═══════════════════════════════════════════════════════════════════
 *
 * Email is a Value Object — it has no identity of its own. Two Email
 * instances are considered equal if their underlying `_value` strings
 * are identical (case-insensitively, since we normalize to lowercase).
 *
 * ═══════════════════════════════════════════════════════════════════
 * CONSTRUCTION INVARIANTS
 * ═══════════════════════════════════════════════════════════════════
 *
 * The constructor guarantees that every Email instance is in a valid
 * state by enforcing:
 *
 *   1. The input is trimmed (leading/trailing whitespace removed).
 *   2. The input is lowercased (email addresses are case-insensitive
 *      per RFC 5321, so we normalize to lowercase for consistency).
 *   3. The result is not empty.
 *   4. The result matches a basic RFC email pattern.
 *
 * If any invariant is violated, a ValidationException is thrown.
 *
 * ═══════════════════════════════════════════════════════════════════
 * WHY NORMALIZE TO LOWERCASE?
 * ═══════════════════════════════════════════════════════════════════
 *
 * Email addresses are case-insensitive per RFC 5321. Normalizing to
 * lowercase prevents duplicate accounts that differ only by casing
 * (e.g. "User@Example.com" vs "user@example.com") and simplifies
 * equality checks.
 *
 * ═══════════════════════════════════════════════════════════════════
 * IMMUTABILITY
 * ═══════════════════════════════════════════════════════════════════
 *
 * The class is immutable:
 *   - `_value` is `readonly` and set once in the constructor.
 *   - No setter methods are exposed.
 *   - No mutable state is exposed.
 *
 * ═══════════════════════════════════════════════════════════════════
 * DOMAIN LAYER RESPONSIBILITY
 * ═══════════════════════════════════════════════════════════════════
 *
 * Email validation is a domain concern — it defines what constitutes
 * a valid email address for the recruitment system. By placing this
 * logic in a Value Object within the Domain layer, we ensure that
 * every part of the system that handles an email address benefits
 * from the same validation rules.
 *
 * ═══════════════════════════════════════════════════════════════════
 *
 * @example
 * ```ts
 * // "Admin@Example.com" => "admin@example.com"
 * const email = new Email("Admin@Example.com");
 * email.value(); // "admin@example.com"
 *
 * // " TEST@GMAIL.COM " => "test@gmail.com"
 * const email2 = new Email(" TEST@GMAIL.COM ");
 * email2.value(); // "test@gmail.com"
 *
 * // Invalid: throws ValidationException
 * new Email("");        // empty
 * new Email("abc");     // missing @ and domain
 * new Email("@");       // missing local-part and domain
 * ```
 *
 * @category Domain Value Object
 */
export class Email {
  /** Basic RFC-compliant email pattern. */
  private static readonly EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  /** The normalized email value (trimmed, lowercased). */
  private readonly _value: string;

  /**
   * Construct an Email Value Object.
   *
   * @param value - The raw email string to validate and normalize.
   * @throws {ValidationException} If the input is empty or does not
   *   match a valid email format.
   */
  constructor(value: string) {
    const trimmed = value.trim();
    const lowercased = trimmed.toLowerCase();

    if (lowercased.length === 0) {
      throw new ValidationException("Email must not be empty");
    }

    if (!Email.EMAIL_PATTERN.test(lowercased)) {
      throw new ValidationException(`Invalid email format: "${value}"`);
    }

    this._value = lowercased;
  }

  /**
   * Return the normalized email value.
   *
   * @returns The email string in lowercase.
   */
  value(): string {
    return this._value;
  }

  /**
   * Check equality with another Email Value Object.
   *
   * Two Email instances are equal if their normalized values are
   * identical (case-insensitive comparison is guaranteed because
   * both values are already lowercased).
   *
   * @param other - The other Email to compare.
   * @returns `true` if both represent the same email address.
   */
  equals(other: Email): boolean {
    return this._value === other._value;
  }

  /**
   * Return the string representation of the email.
   *
   * @returns The normalized email string.
   */
  toString(): string {
    return this._value;
  }
}
