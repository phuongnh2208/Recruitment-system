/**
 * User Role Badge component.
 *
 * ═══════════════════════════════════════════════════════════════════
 * UI COMPONENT
 * ═══════════════════════════════════════════════════════════════════
 *
 *   - ✅ Displays user role with appropriate styling
 *   - ✅ Uses design.md badge patterns (rounded-seal, color tokens)
 *   - ✅ Accessibility (aria-label)
 *   - ❌ No business logic
 */

import type { UserRole } from "../types/user-management.types";
import { ROLE_BADGE_CONFIG } from "../types/user-management.types";

interface UserRoleBadgeProps {
  /** User role to display. */
  role: UserRole;
  /** Additional CSS classes. */
  className?: string;
}

export default function UserRoleBadge({
  role,
  className = "",
}: UserRoleBadgeProps) {
  const config = ROLE_BADGE_CONFIG[role];

  return (
    <span
      className={`inline-flex items-center rounded-seal px-2.5 py-0.5 font-mono text-xs font-medium ${config.className} ${className}`}
      aria-label={`Vai trò: ${config.label}`}
    >
      {config.label}
    </span>
  );
}
