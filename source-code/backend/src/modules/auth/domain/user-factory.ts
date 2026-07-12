import { User } from "./user";
import { PasswordHasher } from "./password-hasher";
import { ValidationException } from "../../../common/exceptions/validation-exception";

/**
 * Input data required to create a new User via UserFactory.
 */
export interface CreateUserInput {
  /** Unique email address for the user. */
  email: string;
  /** Plain-text password (will be hashed by the factory). */
  password: string;
  /** Role assigned to the user. Must be a valid Role enum value. */
  role: string;
}

/**
 * Factory for creating User domain entities.
 *
 * ═══════════════════════════════════════════════════════════════════
 * RESPONSIBILITIES
 * ═══════════════════════════════════════════════════════════════════
 *
 * 1. Validate input data (email, password constraints).
 * 2. Hash the plain-text password via the injected PasswordHasher.
 * 3. Set sensible defaults for all security-related fields.
 * 4. Return a fully constructed User entity.
 *
 * ═══════════════════════════════════════════════════════════════════
 * WHY PASSWORDHASHER IS INJECTED
 * ═══════════════════════════════════════════════════════════════════
 *
 * Following the Dependency Inversion Principle, the Domain Layer
 * depends on the PasswordHasher abstraction, not on a concrete
 * implementation (e.g. BcryptPasswordHasher). This keeps the
 * factory testable and decoupled from Infrastructure.
 *
 * ═══════════════════════════════════════════════════════════════════
 * WHY THE FACTORY DOES NOT GENERATE ID
 * ═══════════════════════════════════════════════════════════════════
 *
 * The User entity's `id` is set to `null` because ID generation is
 * a persistence concern. The database (Prisma) generates the actual
 * ID (cuid) when the entity is first saved. The factory stays
 * focused solely on domain object creation.
 *
 * ═══════════════════════════════════════════════════════════════════
 * BOUNDARIES
 * ═══════════════════════════════════════════════════════════════════
 *
 * - Does NOT access the database.
 * - Does NOT call any Repository.
 * - Does NOT send emails.
 * - Does NOT generate tokens.
 * - ONLY creates a User object.
 *
 * ═══════════════════════════════════════════════════════════════════
 *
 * @category Domain Factory
 */
export class UserFactory {
  constructor(private readonly passwordHasher: PasswordHasher) {}

  /**
   * Create a new User domain entity.
   *
   * @param input - The data required to create the user.
   * @returns A promise that resolves to a fully constructed User entity.
   * @throws {ValidationException} If input validation fails.
   */
  async create(input: CreateUserInput): Promise<User> {
    this.validateInput(input);

    const hashedPassword = await this.passwordHasher.hash(input.password);
    const now = new Date();

    return new User({
      id: null,
      email: input.email,
      passwordHash: hashedPassword,
      role: input.role,
      isActive: false,
      emailVerified: false,
      failedLoginAttempts: 0,
      lockedUntil: null,
      createdAt: now,
      updatedAt: now,
    });
  }

  /**
   * Validate the input data before creating a User.
   *
   * @param input - The input data to validate.
   * @throws {ValidationException} If validation fails.
   */
  private validateInput(input: CreateUserInput): void {
    if (!input.email || input.email.trim().length === 0) {
      throw new ValidationException("Email is required");
    }

    if (!input.password || input.password.trim().length === 0) {
      throw new ValidationException("Password is required");
    }

    if (input.password.length < 8) {
      throw new ValidationException("Password must be at least 8 characters long");
    }

    if (!input.role || input.role.trim().length === 0) {
      throw new ValidationException("Role is required");
    }
  }
}
