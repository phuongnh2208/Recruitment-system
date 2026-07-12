/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * STRATEGY INTERFACE — Password Hashing
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * PasswordHasher defines the contract for password hashing operations in the
 * Domain Layer. It is the **Strategy Interface** in the Strategy Pattern.
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 * WHY STRATEGY PATTERN?
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * 1. **Dependency Inversion Principle**
 *    - Domain & Application layers depend on this abstraction (NOT on a concrete
 *      implementation like BCrypt).
 *    - Concrete strategies reside in the Infrastructure Layer and implement
 *      this interface.
 *
 * 2. **Pluggable Algorithms**
 *    - The hashing algorithm can be swapped at runtime or configuration time
 *      without modifying any UseCase or Domain service.
 *    - Currently supported: BCrypt (via {@link BCryptPasswordHasher}).
 *    - Future algorithms: Argon2, Scrypt, PBKDF2, etc.
 *
 * 3. **Open / Closed Principle**
 *    - New hashing strategies can be added without modifying existing code:
 *      ```
 *      class Argon2PasswordHasher implements PasswordHasher { ... }
 *      class ScryptPasswordHasher implements PasswordHasher { ... }
 *      class PBKDF2PasswordHasher implements PasswordHasher { ... }
 *      ```
 *    - The Application Layer (e.g., RegisterUseCase) remains unchanged
 *      regardless of which concrete strategy is injected.
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 * CORRECT DEPENDENCY INJECTION (DO this)
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * ```typescript
 * class RegisterUseCase {
 *   constructor(
 *     private readonly passwordHasher: PasswordHasher,  // ✅ abstraction
 *   ) {}
 *
 *   async execute(input: RegisterInput): Promise<void> {
 *     const hashed = await this.passwordHasher.hash(input.password);
 *     // ...
 *   }
 * }
 * ```
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 * WRONG (AVOID this)
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * ```typescript
 * class RegisterUseCase {
 *   async execute(input: RegisterInput): Promise<void> {
 *     const hasher = new BCryptPasswordHasher();  // ❌ tight coupling
 *     const hashed = await hasher.hash(input.password);
 *   }
 * }
 * ```
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 * APPLICATION LAYER DEPENDS ONLY ON ABSTRACTION
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * - UseCases, Services, and Domain factories receive `PasswordHasher` via
 *   constructor injection.
 * - Switching from BCrypt to Argon2 requires ZERO changes in the Application
 *   Layer — only the composition root (e.g. DI container) changes.
 *
 * @see BCryptPasswordHasher — Current concrete implementation (bcryptjs).
 * @see PasswordHasher — This interface, the Strategy contract.
 *
 * @category Strategy Interface
 */
export interface PasswordHasher {
  /**
   * Hash a plain text password using the configured strategy.
   *
   * @param password - The plain text password to hash.
   * @returns A promise that resolves to the hashed password string.
   * @throws {Error} If hashing fails due to internal errors.
   */
  hash(password: string): Promise<string>;

  /**
   * Compare a plain text password against a hashed value.
   *
   * @param password - The plain text password to verify.
   * @param hashedPassword - The hashed password to compare against.
   * @returns A promise that resolves to true if the password matches, false otherwise.
   * @throws {Error} If comparison fails due to internal errors.
   */
  compare(password: string, hashedPassword: string): Promise<boolean>;
}
