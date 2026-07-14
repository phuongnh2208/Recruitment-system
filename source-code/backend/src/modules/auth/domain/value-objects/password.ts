import { ValidationException } from "../../../../common/exceptions/validation-exception";

/**
 * Password Value Object.
 *
 * ═══════════════════════════════════════════════════════════════════
 * VALUE OBJECT
 * ═══════════════════════════════════════════════════════════════════
 *
 * Password is a Value Object — it has no identity of its own. Two
 * Password instances are considered equal if their underlying
 * `_value` strings are identical.
 *
 * ═══════════════════════════════════════════════════════════════════
 * CONSTRUCTION INVARIANTS
 * ═══════════════════════════════════════════════════════════════════
 *
 * The constructor guarantees that every Password instance is in a
 * valid state by enforcing the following password policy:
 *
 *   - Length must be between 8 and 32 characters (inclusive).
 *   - Must contain at least one lowercase letter (a-z).
 *   - Must contain at least one uppercase letter (A-Z).
 *   - Must contain at least one digit (0-9).
 *   - Must contain at least one special character
 *     (e.g. ! @ # $ % ^ & * ( ) _ + - = [ ] { } | ; : ' " , . < > ? / ~ `).
 *   - Must not have leading whitespace.
 *   - Must not have trailing whitespace.
 *   - Must not be empty.
 *
 * If any invariant is violated, a ValidationException is thrown.
 *
 * ═══════════════════════════════════════════════════════════════════
 * WHY PASSWORD IS NOT HASHED HERE
 * ═══════════════════════════════════════════════════════════════════
 *
 * The Password Value Object contains only the **plain-text** password.
 * Hashing is a separate concern handled by a **PasswordHasher Strategy**
 * (an abstraction in the Domain layer with concrete implementations
 * in Infrastructure, e.g. BcryptPasswordHasher).
 *
 * This separation follows the Single Responsibility Principle:
 *
 *   - **Password Value Object** → validates password format / policy.
 *   - **PasswordHasher** → cryptographic hashing.
 *
 * Keeping them separate also simplifies testing: unit tests can
 * validate password policy without setting up a hasher.
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
 * Password policy is a domain concern — it defines the minimum
 * security requirements for user passwords in the recruitment system.
 * By placing this logic in a Value Object within the Domain layer,
 * every code path that accepts a password benefits from the same
 * validation rules, preventing weak passwords from entering the
 * system.
 *
 * ═══════════════════════════════════════════════════════════════════
 *
 * @example
 * ```ts
 * // Valid: meets all policy requirements
 * const pw = new Password("Abc123@!");
 * pw.value();   // "Abc123@!"
 * pw.length();  // 8
 *
 * // Invalid: throws ValidationException
 * new Password("abc");          // too short, missing uppercase/digit/special
 * new Password("");             // empty
 * new Password("  Abc123@!");   // leading whitespace
 * new Password("Abc123@!  ");   // trailing whitespace
 * ```
 *
 * @category Domain Value Object
 */
export class Password {
  /** Minimum allowed password length. */
  private static readonly MIN_LENGTH = 8;

  /** Maximum allowed password length. */
  private static readonly MAX_LENGTH = 32;

  /** Regex to detect at least one lowercase letter. */
  private static readonly LOWERCASE_PATTERN = /[a-z]/;

  /** Regex to detect at least one uppercase letter. */
  private static readonly UPPERCASE_PATTERN = /[A-Z]/;

  /** Regex to detect at least one digit. */
  private static readonly DIGIT_PATTERN = /\d/;

  /** Regex to detect at least one special character. */
  private static readonly SPECIAL_PATTERN = /[!@#$%^&*()_+\-=[\]{}|;:'",.<>?/~`]/;

  /** The plain-text password value. */
  private readonly _value: string;

  /**
   * Construct a Password Value Object.
   *
   * @param value - The plain-text password to validate.
   * @throws {ValidationException} If the password violates any policy
   *   constraint.
   */
  constructor(value: string) {
    this.validate(value);
    this._value = value;
  }

  /**
   * Validate the password against the defined password policy.
   *
   * @param value - The plain-text password to validate.
   * @throws {ValidationException} When a policy constraint is violated.
   */
  private validate(value: string): void {
    if (value.length === 0) {
      throw new ValidationException("Password must not be empty");
    }

    if (value !== value.trim()) {
      throw new ValidationException("Password must not have leading or trailing whitespace");
    }

    if (value.length < Password.MIN_LENGTH || value.length > Password.MAX_LENGTH) {
      throw new ValidationException(
        `Password must be between ${Password.MIN_LENGTH} and ${Password.MAX_LENGTH} characters long`,
      );
    }

    if (!Password.LOWERCASE_PATTERN.test(value)) {
      throw new ValidationException("Password must contain at least one lowercase letter");
    }

    if (!Password.UPPERCASE_PATTERN.test(value)) {
      throw new ValidationException("Password must contain at least one uppercase letter");
    }

    if (!Password.DIGIT_PATTERN.test(value)) {
      throw new ValidationException("Password must contain at least one digit");
    }

    if (!Password.SPECIAL_PATTERN.test(value)) {
      throw new ValidationException("Password must contain at least one special character");
    }
  }

  /**
   * Return the plain-text password value.
   *
   * @returns The password string.
   */
  value(): string {
    return this._value;
  }

  /**
   * Check equality with another Password Value Object.
   *
   * Two Password instances are equal if their plain-text values are
   * identical (character-for-character).
   *
   * @param other - The other Password to compare.
   * @returns `true` if both represent the same password.
   */
  equals(other: Password): boolean {
    return this._value === other._value;
  }

  /**
   * Return the length of the password.
   *
   * @returns The number of characters in the password.
   */
  length(): number {
    return this._value.length;
  }
}
