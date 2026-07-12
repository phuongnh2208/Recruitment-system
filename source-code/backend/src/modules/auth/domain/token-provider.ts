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
 * Strategy interface for token management.
 *
 * Defines the contract for generating, verifying, and decoding
 * Access and Refresh tokens. This is the **Strategy** role in the
 * **Strategy Pattern** — it defines the abstraction that all concrete
 * token providers must implement.
 *
 * ═══════════════════════════════════════════════════════════════════
 * STRATEGY PATTERN
 * ═══════════════════════════════════════════════════════════════════
 *
 *   ┌─────────────────────────────────────────────────────┐
 *   │  TokenProvider  (Strategy Interface)                │
 *   │  ─ Domain Layer ─                                   │
 *   │  Defines the contract (generate / verify / decode). │
 *   └──────────────┬──────────────────────────────────────┘
 *                   │ implements
 *          ┌────────┴────────┐
 *          ▼                 ▼
 *   ┌──────────────┐  ┌──────────────┐
 *   │JwtToken      │  │PasetoToken   │  ← future
 *   │Provider      │  │Provider      │
 *   │(Concrete     │  │(Concrete     │
 *   │ Strategy)    │  │ Strategy)    │
 *   └──────────────┘  └──────────────┘
 *
 * The Application Layer (Use Cases, AuthGuard) depends ONLY on this
 * interface — not on any concrete implementation.
 *
 * ═══════════════════════════════════════════════════════════════════
 * DEPENDENCY INVERSION (DIP)
 * ═══════════════════════════════════════════════════════════════════
 *
 * High-level modules (Use Cases, AuthGuard) MUST NOT depend on
 * low-level modules (JwtTokenProvider). Both MUST depend on
 * abstractions (TokenProvider).
 *
 * ✅ CORRECT — Dependency injection via constructor:
 *
 *   class LoginUseCase {
 *     constructor(private readonly tokenProvider: TokenProvider) {}
 *   }
 *
 * ❌ WRONG — Instantiating concrete implementation in Use Case:
 *
 *   class LoginUseCase {
 *     private tokenProvider = new JwtTokenProvider();  // BAD
 *   }
 *
 * The concrete implementation is instantiated ONLY at the
 * Composition Root (e.g., main.ts or app.module.ts).
 *
 * ═══════════════════════════════════════════════════════════════════
 * OPEN / CLOSED PRINCIPLE (OCP)
 * ═══════════════════════════════════════════════════════════════════
 *
 * The system is OPEN for extension but CLOSED for modification.
 * New token strategy implementations can be added WITHOUT modifying
 * existing consumers:
 *
 *   - PasetoTokenProvider   → PASETO-based tokens
 *   - OAuthTokenProvider    → OAuth2 / OIDC integration
 *   - OpaqueTokenProvider   → Server-side session tokens
 *
 * None of these require changes to LoginUseCase, RefreshTokenUseCase,
 * or AuthGuard — they all depend solely on TokenProvider.
 *
 * ═══════════════════════════════════════════════════════════════════
 * LAYER BOUNDARY
 * ═══════════════════════════════════════════════════════════════════
 *
 * This interface belongs to the Domain Layer so that:
 * - Application / Use Case layers depend on an abstraction
 * - The Infrastructure layer (JwtTokenProvider) implements it
 * - Swapping JWT for another format requires zero changes above
 *   the composition boundary
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
 *
 * @see JwtTokenProvider — The primary concrete strategy using jsonwebtoken.
 * @see {@link https://refactoring.guru/design-patterns/strategy | Strategy Pattern}
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
