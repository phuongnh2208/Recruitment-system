/**
 * Banner displayed when the student has no default CV set.
 *
 * ═══════════════════════════════════════════════════════════════════
 * UI COMPONENT
 * ═══════════════════════════════════════════════════════════════════
 *
 *   - ✅ Informational banner with a call‑to‑action button
 *   - ❌ Business logic – parent decides when to show it
 */
import type { ReactNode } from "react";

export interface NoDefaultCvBannerProps {
  /** Optional custom message. */
  message?: string;
  /** Render prop for the primary action button. */
  action: ReactNode;
}

export default function NoDefaultCvBanner({
  message,
  action,
}: NoDefaultCvBannerProps) {
  return (
    <div
      className="mb-6 rounded-lg border border-primary/20 bg-primary-light px-4 py-3"
      role="alert"
    >
      <div className="flex items-center justify-between">
        <p className="font-body text-sm font-medium text-primary">
          {message ??
            "Bạn chưa đặt CV mặc định. Vui lòng chọn một CV làm mặc định để nộp hồ sơ."}
        </p>
        {action}
      </div>
    </div>
  );
}
