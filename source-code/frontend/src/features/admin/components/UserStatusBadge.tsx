/**
 * User Status Badge component.
 *
 * ═══════════════════════════════════════════════════════════════════
 * UI COMPONENT
 * ═══════════════════════════════════════════════════════════════════
 *
 *   - ✅ Displays user status with appropriate styling
 *   - ✅ Uses design.md badge patterns (rounded-seal, color tokens)
 *   - ✅ Accessibility (aria-label)
 *   - ❌ No business logic
 */

import type { UserStatus } from "../types/user-management.types";
import { STATUS_BADGE_CONFIG } from "../types/user-management.types";

interface UserStatusBadgeProps {
  /** User status to display. */
  status: UserStatus;
  /** Additional CSS classes. */
  className?: string;
}

export default function UserStatusBadge({
  status,
  className = "",
}: UserStatusBadgeProps) {
  const config = STATUS_BADGE_CONFIG[status];

  return (
    <span
      className={`inline-flex items-center rounded-seal px-2.5 py-0.5 font-mono text-xs font-medium ${config.className} ${className}`}
      aria-label={`Trạng thái: ${config.label}`}
    >
      {config.label}
    </span>
  );
}
