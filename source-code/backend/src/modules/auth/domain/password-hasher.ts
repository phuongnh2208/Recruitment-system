/**
 * Interface for password hashing operations.
 *
 * This interface defines the contract for password hashing in the Domain Layer.
 * It follows the Dependency Inversion Principle, allowing the Domain and
 * Application layers to depend on this abstraction rather than concrete
 * implementations in the Infrastructure Layer.
 *
 * @example
 * ```typescript
 * class RegisterUseCase {
 *   constructor(private readonly passwordHasher: PasswordHasher) {}
 *
 *   async execute(input: RegisterInput): Promise<void> {
 *     const hashedPassword = await this.passwordHasher.hash(input.password);
 *     // ...
 *   }
 * }
 * ```
 */
export interface PasswordHasher {
  /**
   * Hash a plain text password.
   * @param password - The plain text password to hash.
   * @returns A promise that resolves to the hashed password string.
   * @throws {Error} If hashing fails due to internal errors.
   */
  hash(password: string): Promise<string>;

  /**
   * Compare a plain text password against a hashed value.
   * @param password - The plain text password to verify.
   * @param hashedPassword - The hashed password to compare against.
   * @returns A promise that resolves to true if the password matches, false otherwise.
   * @throws {Error} If comparison fails due to internal errors.
   */
  compare(password: string, hashedPassword: string): Promise<boolean>;
}
