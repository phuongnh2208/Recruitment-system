/**
 * Business Exceptions — barrel export.
 *
 * ═══════════════════════════════════════════════════════════════════
 * Usage
 * ═══════════════════════════════════════════════════════════════════
 *
 *   import {
 *     BusinessException,
 *     ValidationException,
 *     AuthenticationException,
 *     ForbiddenException,
 *     NotFoundException,
 *     ConflictException,
 *     InfrastructureException,
 *     ErrorCode,
 *   } from "../common/exceptions";
 *
 * ═══════════════════════════════════════════════════════════════════
 */

export { BusinessException } from "./business-exception";
export { ValidationException } from "./validation-exception";
export { AuthenticationException } from "./authentication-exception";
export { ForbiddenException } from "./forbidden-exception";
export { NotFoundException } from "./not-found-exception";
export { ConflictException } from "./conflict-exception";
export { InfrastructureException } from "./infrastructure-exception";
export { ErrorCode } from "./error-code";
