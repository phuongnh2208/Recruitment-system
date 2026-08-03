import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { registerSchema } from "../validators/register.schema";
import { loginSchema } from "../validators/login.schema";
import { logoutSchema } from "../validators/logout.schema";
import { changePasswordSchema } from "../validators/change-password.schema";
import { verifyEmailSchema } from "../validators/verify-email.schema";
import { RegisterUseCase } from "../../application/use-cases/register-use-case";
import { LoginUseCase } from "../../application/use-cases/login-use-case";
import { LogoutUseCase } from "../../application/use-cases/logout-use-case";
import { ChangePasswordUseCase } from "../../application/use-cases/change-password-use-case";
import { VerifyEmailUseCase } from "../../application/use-cases/verify-email-use-case";
import { RefreshTokenUseCase } from "../../application/use-cases/refresh-token-use-case";
import { AuthenticationException } from "../../../../common/exceptions";

/**
 * AuthController
 *
 * Handles HTTP requests for the Authentication module and delegates all
 * business logic to the corresponding Use Cases.
 *
 * ═══════════════════════════════════════════════════════════════════
 * RESPONSIBILITIES
 * ═══════════════════════════════════════════════════════════════════
 *
 *   1. Extract input data from the HTTP request (body, params, query,
 *      cookies, headers).
 *   2. Validate the input using the dedicated Zod schemas.
 *   3. Call the appropriate Use Case's `execute()` method.
 *   4. Return a standardised HTTP response with the result.
 *   5. Forward any exception to the Global Error Middleware via
 *      `next(error)` — this controller does NOT handle errors itself.
 *
 * ═══════════════════════════════════════════════════════════════════
 * CLEAN ARCHITECTURE BOUNDARY
 * ═══════════════════════════════════════════════════════════════════
 *
 * This controller sits at the outermost layer (Presentation / Interface
 * Adapters). Its sole purpose is to translate between HTTP and the
 * application layer. All business logic, validation rules, domain
 * decisions, and infrastructure concerns are completely absent from
 * this class.
 *
 * ═══════════════════════════════════════════════════════════════════
 * DEPENDENCY INJECTION
 * ═══════════════════════════════════════════════════════════════════
 *
 * All use cases are injected via the constructor. This ensures
 * that the controller has zero knowledge of how use cases are
 * instantiated, which repositories they depend on, or how their
 * dependencies are resolved.
 *
 * @category Presentation Controller
 */
export class AuthController {
  constructor(
    private readonly registerUseCase: RegisterUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly logoutUseCase: LogoutUseCase,
    private readonly changePasswordUseCase: ChangePasswordUseCase,
    private readonly verifyEmailUseCase: VerifyEmailUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
  ) {}

  /**
   * POST /auth/register
   *
   * Registers a new user account.
   *
   * **Response** – `201 Created` with the registration result.
   */
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto = registerSchema.parse(req.body);
      const result = await this.registerUseCase.execute(dto);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /auth/login
   *
   * Authenticates a user with email and password.
   *
   * **Response** – `200 OK` with access token, refresh token, and user info.
   */
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto = loginSchema.parse(req.body);
      const result = await this.loginUseCase.execute(dto);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /auth/logout
   *
   * Revokes the current refresh token, invalidating the session.
   *
   * **Response** – `200 OK` with `{ success: true }`.
   */
  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const refreshToken =
        req.cookies?.refreshToken ??
        (req.headers.authorization?.startsWith("Bearer ")
          ? req.headers.authorization.slice(7)
          : undefined) ??
        req.body?.refreshToken;

      const dto = logoutSchema.parse({ refreshToken });
      const result = await this.logoutUseCase.execute(dto);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /auth/change-password
   *
   * Changes the authenticated user's password.
   *
   * **Authentication:** Requires a valid JWT. The user id is read from
   * `req.user.id` (set by AuthGuard).
   *
   * **Response** – `200 OK` with `{ success: true }`.
   */
  async changePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // AuthGuard guarantees req.user is present on protected routes.
      // If it is missing, forward a typed AuthenticationException so the
      // global exception filter returns a consistent 401 response.
      if (!req.user) {
        next(new AuthenticationException("Authentication required."));
        return;
      }

      const dto = changePasswordSchema.parse(req.body);
      const result = await this.changePasswordUseCase.execute({
        userId: req.user.id,
        currentPassword: dto.currentPassword,
        newPassword: dto.newPassword,
      });
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /auth/verify-email
   *
   * Verifies a user's email address using a verification token.
   *
   * **Response** – `200 OK` with `{ success: true }`.
   */
  async verifyEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const token = (req.query.token as string | undefined) ?? req.body?.token;
      const dto = verifyEmailSchema.parse({ token });
      const result = await this.verifyEmailUseCase.execute(dto);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /auth/refresh-token
   *
   * Refreshes the access token using a valid refresh token.
   *
   * **Response** – `200 OK` with new access token and refresh token.
   */
  async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body;
      const result = await this.refreshTokenUseCase.execute({ refreshToken });
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}
