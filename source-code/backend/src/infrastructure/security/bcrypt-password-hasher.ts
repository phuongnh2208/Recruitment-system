import bcrypt from "bcryptjs";
import { PasswordHasher } from "../../modules/auth/domain/password-hasher";

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * CONCRETE STRATEGY — BCrypt Password Hashing
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * BCryptPasswordHasher is a **Concrete Strategy** in the Strategy Pattern.
 * It implements the {@link PasswordHasher} interface using the bcryptjs library.
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 * ARCHITECTURE
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * - **Layer:** Infrastructure
 * - **Imports:** PasswordHasher (Domain Layer) — following the Dependency
 *   Inversion Principle, the domain defines the contract and the infrastructure
 *   provides the implementation.
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 * CONFIGURATION
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * The cost factor is read from the environment variable `BCRYPT_COST_FACTOR`.
 * If not set, it defaults to **12** (2^12 = 4096 iterations).
 *
 * | Variable            | Required | Default | Description                            |
 * |---------------------|----------|---------|----------------------------------------|
 * | BCRYPT_COST_FACTOR  | No       | 12      | BCrypt cost factor (4–31). Higher = slower but more secure. |
 *
 * @example
 * ```env
 * # .env
 * BCRYPT_COST_FACTOR=14   # Increase security at the cost of performance
 * ```
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 * COST FACTOR RESOLUTION
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Resolved once at module load time:
 * 1. Read `process.env.BCRYPT_COST_FACTOR`
 * 2. If present and parseable, use that value
 * 3. Otherwise fall back to 12
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 * OPEN / CLOSED PRINCIPLE
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * This class can be replaced with any other PasswordHasher implementation
 * without modifying the callers. Future strategies can be added as:
 *
 * ```
 * class Argon2PasswordHasher implements PasswordHasher { ... }
 * class ScryptPasswordHasher implements PasswordHasher { ... }
 * class PBKDF2PasswordHasher implements PasswordHasher { ... }
 * ```
 *
 * @see PasswordHasher — The Strategy Interface in the Domain Layer.
 * @see https://www.npmjs.com/package/bcryptjs — bcryptjs library.
 *
 * @category Concrete Strategy
 */
export class BCryptPasswordHasher implements PasswordHasher {
  private readonly costFactor: number;

  /**
   * Create a BCryptPasswordHasher instance.
   *
   * The cost factor is resolved from process.env.BCRYPT_COST_FACTOR,
   * falling back to 12 if not set or invalid.
   */
  constructor() {
    this.costFactor = BCryptPasswordHasher.resolveCostFactor();
  }

  /**
   * Hash a plain text password using BCrypt with the configured cost factor.
   *
   * @param password - The plain text password to hash.
   * @returns A promise that resolves to the hashed password string.
   * @throws {Error} If hashing fails (e.g., invalid input or internal error).
   */
  async hash(password: string): Promise<string> {
    try {
      const salt = await bcrypt.genSalt(this.costFactor);
      return await bcrypt.hash(password, salt);
    } catch (error) {
      throw new Error(
        `Failed to hash password: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Compare a plain text password against a BCrypt hashed value.
   *
   * @param password - The plain text password to verify.
   * @param hashedPassword - The BCrypt hashed password to compare against.
   * @returns A promise that resolves to true if the password matches, false otherwise.
   * @throws {Error} If comparison fails due to internal errors.
   */
  async compare(password: string, hashedPassword: string): Promise<boolean> {
    try {
      return await bcrypt.compare(password, hashedPassword);
    } catch (error) {
      throw new Error(
        `Failed to compare password: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Resolve the BCrypt cost factor from environment or default.
   *
   * Priority:
   * 1. process.env.BCRYPT_COST_FACTOR (if valid number between 4–31)
   * 2. 12 (safe default)
   *
   * @returns The resolved cost factor.
   */
  private static resolveCostFactor(): number {
    const envValue = process.env.BCRYPT_COST_FACTOR?.trim();

    if (envValue) {
      const parsed = Number.parseInt(envValue, 10);
      if (!Number.isNaN(parsed) && parsed >= 4 && parsed <= 31) {
        return parsed;
      }
    }

    return 12;
  }
}
