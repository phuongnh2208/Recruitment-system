/**
 * Express Request type augmentation.
 *
 * This file extends the Express Request interface to include the `user`
 * property set by AuthGuard after successful JWT verification.
 *
 * ═══════════════════════════════════════════════════════════════════
 * WHY THIS FILE EXISTS
 * ═══════════════════════════════════════════════════════════════════
 *
 * Express does not natively define a `user` property on the Request type.
 * Adding it via declaration merging allows TypeScript to recognise
 * `request.user` throughout the codebase without type assertions
 * (e.g., `(request as any).user`).
 *
 * ═══════════════════════════════════════════════════════════════════
 * USAGE
 * ═══════════════════════════════════════════════════════════════════
 *
 *   function handler(req: Request, res: Response) {
 *     const user = req.user;  // TypeScript knows this is AuthenticatedUser
 *     console.log(user.id, user.email, user.role);
 *   }
 *
 * ═══════════════════════════════════════════════════════════════════
 * IMPORTANT
 * ═══════════════════════════════════════════════════════════════════
 *
 * - Do NOT use `as any` to access request.user anywhere.
 * - Use `request.user` directly — it is now part of the Request type.
 * - The user property is set by AuthGuard. Unauthenticated routes
 *   will have `request.user` as `undefined`.
 *
 * ═══════════════════════════════════════════════════════════════════
 */
import { AuthenticatedUser } from "../common/types/authenticated-user";

declare global {
  namespace Express {
    interface Request {
      /**
       * Authenticated user information extracted from a verified JWT token.
       * Set by AuthGuard middleware. Will be `undefined` if the request
       * has not been authenticated.
       */
      user?: AuthenticatedUser;
    }
  }
}
