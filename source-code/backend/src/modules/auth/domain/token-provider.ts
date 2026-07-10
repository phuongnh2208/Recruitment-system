/**
 * Payload embedded in JWT tokens.
 *
 * Follows the standard JWT claims convention. The `sub` (subject) claim
 * holds the user's unique identifier. This payload is used for both
 * Access and Refresh tokens.
 *
 * Must NOT include sensitive data like passwords.
 *
 * TODO (TSK-INF-204): Replace string fields with branded types
 * (UserId, Email) once BusinessException/ValidationException base
 * classes are implemented.
 */
export interface TokenPayload {
  /** Subject — the unique identifier of the user (maps to JWT `sub` claim). */
  sub: string;

  /** Email address of the user. */
  email: string;

  /** Role assigned to the user (Student | Employer | Administrator). */
  role: string;
}

/**
 * Interface for JWT token management.
 *
 * Defines the contract for generating, verifying, and decoding
 * Access and Refresh tokens. This interface belongs to the Domain Layer
 * so that Application / Use Case layers depend on an abstraction rather
 * than a concrete jsonwebtoken implementation.
 *
 * ═══════════════════════════════════════════════════════════════════
 * DEPENDENCY INVERSION
 * ═══════════════════════════════════════════════════════════════════
 *
 * Use Cases MUST NOT instantiate JwtTokenProvider directly.
 * Instead, receive TokenProvider via constructor injection:
 *
 *   constructor(private readonly tokenProvider: TokenProvider)
 *
 * The concrete implementation (JwtTokenProvider) is instantiated
 * once at the Composition Root (e.g., app.module.ts or main.ts)
 * and injected into all Use Cases that need token services.
 *
 * ═══════════════════════════════════════════════════════════════════
 * FUTURE EXTENSIBILITY
 * ═══════════════════════════════════════════════════════════════════
 *
 * A convenience method generateTokenPair() can be added here in the
 * future to generate both tokens in one call. Doing so will NOT break
 * existing consumers because the current methods remain unchanged.
 *
 *   // Future addition (non-breaking):
 *   generateTokenPair(payload: TokenPayload): Promise<{
 *     accessToken: string;
 *     refreshToken: string;
 *   }>;
 *
 * ═══════════════════════════════════════════════════════════════════
 *
 * @example
 * ```typescript
 * class LoginUseCase {
 *   constructor(private readonly tokenProvider: TokenProvider) {}
 *
 *   async execute(input: LoginInput): Promise<LoginOutput> {
 *     const payload: TokenPayload = {
 *       sub: user.id,
 *       email: user.email,
 *       role: user.role,
 *     };
 *     const accessToken = await this.tokenProvider.generateAccessToken(payload);
 *     const refreshToken = await this.tokenProvider.generateRefreshToken(payload);
 *     return { accessToken, refreshToken };
 *   }
 * }
 * ```
 */
export interface TokenProvider {
  /**
   * Generate a short-lived Access Token (default: 15 minutes).
   * Used to authenticate API requests.
   *
   * @param payload - Claims to embed in the token (sub, email, role).
   * @returns A signed JWT string.
   * @throws {Error} If token generation fails.
   */
  generateAccessToken(payload: TokenPayload): Promise<string>;

  /**
   * Generate a long-lived Refresh Token (default: 7 days).
   * Used to obtain new Access Tokens without re-authentication.
   *
   * @param payload - Claims to embed in the token (sub, email, role).
   * @returns A signed JWT string.
   * @throws {Error} If token generation fails.
   */
  generateRefreshToken(payload: TokenPayload): Promise<string>;

  /**
   * Verify and decode an Access Token.
   *
   * @param token - The JWT string to verify.
   * @returns The decoded payload if the token is valid.
   * @throws {Error} If the token is expired, malformed, or signature is invalid.
   */
  verifyAccessToken(token: string): Promise<TokenPayload>;

  /**
   * Verify and decode a Refresh Token.
   *
   * @param token - The JWT string to verify.
   * @returns The decoded payload if the token is valid.
   * @throws {Error} If the token is expired, malformed, or signature is invalid.
   */
  verifyRefreshToken(token: string): Promise<TokenPayload>;

  /**
   * Decode a JWT token without verifying its signature or expiry.
   * Useful for reading token metadata (e.g., during debugging or
   * extracting the JWT ID for revocation checks before full verification).
   *
   * @param token - The JWT string to decode.
   * @returns The decoded payload (unverified).
   * @throws {Error} If the token is malformed and cannot be decoded.
   */
  decode(token: string): Promise<TokenPayload>;
}
