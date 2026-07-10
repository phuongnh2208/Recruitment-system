import bcrypt from "bcryptjs";
import { PasswordHasher } from "../../modules/auth/domain/password-hasher";

/**
 * Cost factor for BCrypt hashing.
 * Higher values increase computation time and security.
 * Value is centralized here to avoid hard-coding in multiple places.
 */
const BCRYPT_COST_FACTOR = 12;

/**
 * Implementation of PasswordHasher using bcryptjs.
 *
 * This class resides in the Infrastructure Layer and implements the
 * PasswordHasher interface defined in the Domain Layer, following
 * the Dependency Inversion Principle.
 *
 * BCrypt is an adaptive hash function based on the Blowfish cipher.
 * The cost factor determines the iteration count (2^cost iterations),
 * making it resistant to brute-force attacks even as hardware improves.
 */
export class BCryptPasswordHasher implements PasswordHasher {
  /**
   * Hash a plain text password using BCrypt with the configured cost factor.
   * @param password - The plain text password to hash.
   * @returns A promise that resolves to the hashed password string.
   * @throws {Error} If hashing fails (e.g., invalid input or internal error).
   */
  async hash(password: string): Promise<string> {
    try {
      const salt = await bcrypt.genSalt(BCRYPT_COST_FACTOR);
      return await bcrypt.hash(password, salt);
    } catch (error) {
      throw new Error(
        `Failed to hash password: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Compare a plain text password against a BCrypt hashed value.
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
}
