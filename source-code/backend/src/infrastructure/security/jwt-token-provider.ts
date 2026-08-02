import jwt, { JwtPayload, SignOptions, VerifyErrors } from "jsonwebtoken";
import { TokenProvider, TokenPayload } from "../../modules/auth/domain/token-provider";
import { config } from "../../config";
import { AuthenticationException, InfrastructureException } from "../../common/exceptions";

/**
 * Concrete Strategy — JWT implementation of TokenProvider.
 *
 * This class resides in the Infrastructure Layer and implements the
 * TokenProvider interface (Strategy Interface) defined in the Domain Layer.
 * This follows the Dependency Inversion Principle: high-level modules
 * depend on the abstraction (TokenProvider), not on this concrete class.
 *
 * ═══════════════════════════════════════════════════════════════════
 * STRATEGY PATTERN ROLE
 * ═══════════════════════════════════════════════════════════════════
 *
 *   ┌──────────────────────────────────────┐
 *   │ TokenProvider  (Strategy Interface)  │ ← modules/auth/domain/
 *   ├──────────────────────────────────────┤
 *   │ JwtTokenProvider (Concrete Strategy) │ ← infrastructure/security/
 *   └──────────────────────────────────────┘
 *
 * ═══════════════════════════════════════════════════════════════════
 * TOKEN POLICY
 * ═══════════════════════════════════════════════════════════════════
 *
 * - Access Token:  short-lived (default 15 minutes), used for API access.
 * - Refresh Token: long-lived  (default 7 days),     used to obtain new
 *   Access Tokens without re-authentication.
 * - Each token type uses a separate secret for security isolation
 *   (JWT_ACCESS_SECRET vs JWT_REFRESH_SECRET).
 *
 * ═══════════════════════════════════════════════════════════════════
 * CONFIGURATION (From centralized config)
 * ═══════════════════════════════════════════════════════════════════
 *
 * - jwt.secret            — Access token secret
 * - jwt.refreshSecret     — Refresh token secret
 * - jwt.accessTokenExpiry — Access token expiry (default: "15m")
 * - jwt.refreshTokenExpiry — Refresh token expiry (default: "7d")
 *
 * ═══════════════════════════════════════════════════════════════════
 * LAYER BOUNDARY
 * ═══════════════════════════════════════════════════════════════════
 *
 * This class MUST NOT be referenced outside the Infrastructure Layer
 * except at the Composition Root (main.ts). Use Cases and AuthGuard
 * receive TokenProvider via constructor injection only.
 *
 *   ✅ Composition Root (app.ts):
 *      const tokenProvider = new JwtTokenProvider();
 *      const authGuard = createAuthGuard(tokenProvider);
 *
 *   ❌ Use Case:
 *      private tokenProvider = new JwtTokenProvider();  // FORBIDDEN
 *
 * ═══════════════════════════════════════════════════════════════════
 */
export class JwtTokenProvider implements TokenProvider {
  private readonly accessSecret: string;
  private readonly refreshSecret: string;
  private readonly accessExpiresIn: string;
  private readonly refreshExpiresIn: string;

  constructor() {
    this.accessSecret = config.jwt.secret;
    this.refreshSecret = config.jwt.refreshSecret;
    this.accessExpiresIn = config.jwt.accessTokenExpiry;
    this.refreshExpiresIn = config.jwt.refreshTokenExpiry;
  }

  /**
   * Generate a signed Access Token with the given payload.
   * @param payload - The claims to embed in the token.
   * @returns A signed JWT string.
   * @throws {Error} If signing fails.
   */
  async generateAccessToken(payload: TokenPayload): Promise<string> {
    return this.signToken(payload, this.accessSecret, {
      expiresIn: this.accessExpiresIn as SignOptions["expiresIn"],
    });
  }

  /**
   * Generate a signed Refresh Token with the given payload.
   * @param payload - The claims to embed in the token.
   * @returns A signed JWT string.
   * @throws {Error} If signing fails.
   */
  async generateRefreshToken(payload: TokenPayload): Promise<string> {
    return this.signToken(payload, this.refreshSecret, {
      expiresIn: this.refreshExpiresIn as SignOptions["expiresIn"],
    });
  }

  /**
   * Verify an Access Token and return its decoded payload.
   * @param token - The JWT string to verify.
   * @returns The decoded and verified payload.
   * @throws {Error} If the token is expired, malformed, or has an invalid signature.
   */
  async verifyAccessToken(token: string): Promise<TokenPayload> {
    return this.verifyToken(token, this.accessSecret, "Access");
  }

  /**
   * Verify a Refresh Token and return its decoded payload.
   * @param token - The JWT string to verify.
   * @returns The decoded and verified payload.
   * @throws {Error} If the token is expired, malformed, or has an invalid signature.
   */
  async verifyRefreshToken(token: string): Promise<TokenPayload> {
    return this.verifyToken(token, this.refreshSecret, "Refresh");
  }

  /**
   * Decode a JWT without verifying signature or expiry.
   * @param token - The JWT string to decode.
   * @returns The decoded payload (unverified).
   * @throws {Error} If the token is malformed and cannot be decoded.
   */
  async decode(token: string): Promise<TokenPayload> {
    return new Promise<TokenPayload>((resolve, reject) => {
      try {
        const decoded = jwt.decode(token);

        if (!decoded || typeof decoded !== "object") {
          reject(new AuthenticationException("Invalid token format."));
          return;
        }

        const payload = decoded as JwtPayload;
        this.assertTokenPayload(payload);
        resolve({
          sub: payload.sub as string,
          email: payload.email as string,
          role: payload.role as string,
        });
      } catch (error) {
        reject(
          new AuthenticationException(
            error instanceof Error ? error.message : "Invalid token format.",
          ),
        );
      }
    });
  }

  /**
   * Internal helper to sign a JWT with the given secret and options.
   * @param payload - The claims to embed.
   * @param secret - The secret key used for signing.
   * @param options - Additional signing options (e.g., expiresIn).
   * @returns A signed JWT string.
   * @throws {Error} If signing fails.
   */
  private signToken(payload: TokenPayload, secret: string, options: SignOptions): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      try {
        jwt.sign(
          {
            sub: payload.sub,
            email: payload.email,
            role: payload.role,
          },
          secret,
          { ...options, algorithm: "HS256" },
          (error: Error | null, token: string | undefined) => {
            if (error || !token) {
              reject(
                new InfrastructureException(
                  `Token generation failed: ${error?.message || "Unknown error"}`,
                ),
              );
              return;
            }
            resolve(token);
          },
        );
      } catch (error) {
        reject(
          new InfrastructureException(
            `Token generation failed: ${error instanceof Error ? error.message : "Unknown error"}`,
          ),
        );
      }
    });
  }

  /**
   * Internal helper to verify a JWT and extract its payload.
   * @param token - The JWT string to verify.
   * @param secret - The secret key used for verification.
   * @param tokenType - Human-readable token type for error messages ("Access" or "Refresh").
   * @returns The decoded and verified payload.
   * @throws {Error} If verification fails.
   */
  private verifyToken(token: string, secret: string, tokenType: string): Promise<TokenPayload> {
    return new Promise<TokenPayload>((resolve, reject) => {
      try {
        jwt.verify(
          token,
          secret,
          { algorithms: ["HS256"] },
          (error: VerifyErrors | null, decoded: unknown) => {
            if (error) {
              reject(this.mapVerifyError(error, tokenType));
              return;
            }

            if (!decoded || typeof decoded !== "object") {
              reject(
                new AuthenticationException(
                  `${tokenType} token verification failed: decoded value is not an object.`,
                ),
              );
              return;
            }

            const payload = decoded as JwtPayload;
            try {
              this.assertTokenPayload(payload);
              resolve({
                sub: payload.sub as string,
                email: payload.email as string,
                role: payload.role as string,
              });
            } catch (assertError) {
              reject(assertError);
            }
          },
        );
      } catch (error) {
        reject(
          new AuthenticationException(
            `${tokenType} token verification failed: ${error instanceof Error ? error.message : "Unknown error"}.`,
          ),
        );
      }
    });
  }

  /**
   * Map jsonwebtoken errors to descriptive error messages.
   *
   * @param error - The VerifyErrors object from jsonwebtoken.
   * @param tokenType - "Access" or "Refresh" for the error message.
   * @returns An AuthenticationException with a descriptive message.
   */
  private mapVerifyError(error: VerifyErrors, tokenType: string): AuthenticationException {
    switch (error.name) {
      case "TokenExpiredError": {
        const expiredAt = (error as jwt.TokenExpiredError).expiredAt;
        return new AuthenticationException(
          `${tokenType} token has expired${expiredAt ? ` at ${expiredAt.toISOString()}` : ""}. Please obtain a new token.`,
        );
      }
      case "JsonWebTokenError":
        return new AuthenticationException(
          `${tokenType} token is invalid: ${error.message}. Ensure the token was issued by this server and has not been tampered with.`,
        );
      case "NotBeforeError":
        return new AuthenticationException(
          `${tokenType} token is not yet active: ${error.message}. The token cannot be used before its 'nbf' claim.`,
        );
      default:
        return new AuthenticationException(
          `${tokenType} token verification failed: ${error.message}.`,
        );
    }
  }

  /**
   * Validate that a decoded JwtPayload contains the required claims
   * and convert it to a TokenPayload.
   *
   * @param payload - The decoded JwtPayload to validate.
   * @throws {Error} If required claims are missing or have invalid types.
   */
  private assertTokenPayload(
    payload: JwtPayload,
  ): asserts payload is Required<Pick<JwtPayload, "sub" | "email" | "role">> {
    if (!payload.sub || typeof payload.sub !== "string") {
      throw new AuthenticationException(
        "Token payload is invalid: missing or invalid 'sub' claim.",
      );
    }
    if (!payload.email || typeof payload.email !== "string") {
      throw new AuthenticationException(
        "Token payload is invalid: missing or invalid 'email' claim.",
      );
    }
    if (!payload.role || typeof payload.role !== "string") {
      throw new AuthenticationException(
        "Token payload is invalid: missing or invalid 'role' claim.",
      );
    }
  }
}
