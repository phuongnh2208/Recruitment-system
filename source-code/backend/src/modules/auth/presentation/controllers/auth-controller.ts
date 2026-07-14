import { Request, Response, NextFunction } from "express";
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
 * WHY THE CONTROLLER CONTAINS NO BUSINESS LOGIC
 * ═══════════════════════════════════════════════════════════════════
 *
 *   - **Separation of Concerns** – Business rules belong in Use Cases
 *     and Domain Entities, not in HTTP handlers.
 *   - **Testability** – Use Cases can be unit-tested without HTTP
 *     scaffolding. Controllers can be integration-tested without
 *     duplicating business-rule coverage.
 *   - **Maintainability** – Changing the transport layer (e.g. from
 *     REST to GraphQL) only requires swapping the controller; the
 *     core application remains untouched.
 *   - **Consistency** – Every endpoint follows the same pattern:
 *     validate → call use case → respond or pass error.
 *
 * ═══════════════════════════════════════════════════════════════════
 * DEPENDENCY INJECTION
 * ═══════════════════════════════════════════════════════════════════
 *
 * All four use cases are injected via the constructor. This ensures
 * that the controller has zero knowledge of how use cases are
 * instantiated, which repositories they depend on, or how their
 * dependencies are resolved. The DI Container (or the composition
 * root) is responsible for wiring everything together.
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
  ) {}

  /**
   * POST /auth/register
   *
   * Registers a new user account.
   *
   * **Request body** (validated by `registerSchema`):
   * - `email`    – valid email address
   * - `password` – 8–32 chars with uppercase, lowercase, digit, special
   * - `role`     – `"STUDENT"` | `"EMPLOYER"`
   *
   * **Response** – `201 Created` with the registration result.
   *
   * @param req  - Express Request
   * @param res  - Express Response
   * @param next - Express NextFunction (error forwarder)
   */
  async register(req: Request, res: Response, _next: NextFunction): Promise<void> {
    const dto = registerSchema.parse(req.body);
    const result = await this.registerUseCase.execute(dto);
    res.status(201).json(result);
  }

  /**
   * POST /auth/login
   *
   * Authenticates a user with email and password.
   *
   * **Request body** (validated by `loginSchema`):
   * - `email`    – valid email address
   * - `password` – non-empty string
   *
   * **Response** – `200 OK` with access token, refresh token, and user info.
   *
   * @param req  - Express Request
   * @param res  - Express Response
   * @param next - Express NextFunction (error forwarder)
   */
  async login(req: Request, res: Response, _next: NextFunction): Promise<void> {
    const dto = loginSchema.parse(req.body);
    const result = await this.loginUseCase.execute(dto);
    res.status(200).json(result);
  }

  /**
   * POST /auth/logout
   *
   * Revokes the current refresh token, invalidating the session.
   *
   * **Refresh token resolution** (priority order):
   *   1. `req.cookies.refreshToken`
   *   2. `Authorization` header (Bearer scheme)
   *   3. `req.body.refreshToken`
   *
   * **Response** – `200 OK` with `{ success: true }`.
   *
   * @param req  - Express Request
   * @param res  - Express Response
   * @param next - Express NextFunction (error forwarder)
   */
  async logout(req: Request, res: Response, _next: NextFunction): Promise<void> {
    const refreshToken =
      req.cookies?.refreshToken ??
      (req.headers.authorization?.startsWith("Bearer ")
        ? req.headers.authorization.slice(7)
        : undefined) ??
      req.body?.refreshToken;

    const dto = logoutSchema.parse({ refreshToken });
    const result = await this.logoutUseCase.execute(dto);
    res.status(200).json(result);
  }

  /**
   * POST /auth/change-password
   *
   * Changes the authenticated user's password.
   *
   * **Authentication:** Requires a valid JWT. The user id is read from
   * `req.user.id` (set by AuthGuard).
   *
   * **Request body** (validated by `changePasswordSchema`):
   * - `currentPassword` – must match password policy
   * - `newPassword`     – must match password policy and differ from current
   *
   * **Response** – `200 OK` with `{ success: true }`.
   *
   * @param req  - Express Request (with `req.user` set by AuthGuard)
   * @param res  - Express Response
   * @param next - Express NextFunction (error forwarder)
   */
  async changePassword(req: Request, res: Response, _next: NextFunction): Promise<void> {
    const dto = changePasswordSchema.parse(req.body);
    const result = await this.changePasswordUseCase.execute({
      userId: req.user!.id,
      currentPassword: dto.currentPassword,
      newPassword: dto.newPassword,
    });
    res.status(200).json(result);
  }

  /**
   * POST /auth/verify-email
   *
   * Verifies a user's email address using a verification token.
   *
   * **Token resolution** (priority order):
   *   1. `req.query.token`
   *   2. `req.body.token`
   *
   * **Response** – `200 OK` with `{ success: true }`.
   *
   * @param req  - Express Request
   * @param res  - Express Response
   * @param next - Express NextFunction (error forwarder)
   */
  async verifyEmail(req: Request, res: Response, _next: NextFunction): Promise<void> {
    const token = (req.query.token as string | undefined) ?? req.body?.token;
    const dto = verifyEmailSchema.parse({ token });
    const result = await this.verifyEmailUseCase.execute(dto);
    res.status(200).json(result);
  }
}
