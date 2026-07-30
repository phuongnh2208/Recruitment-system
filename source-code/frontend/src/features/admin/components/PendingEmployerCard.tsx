/**
 * Pending employer card component.
 *
 * ═══════════════════════════════════════════════════════════════════
 * UI COMPONENT
 * ═══════════════════════════════════════════════════════════════════
 *
 *   - ✅ Displays a single pending employer with verify button
 *   - ✅ Uses design.md card patterns (rounded-card, shadow-card, hover)
 *   - ✅ Accessibility (aria-label, focus-visible)
 *   - ❌ No business logic
 */

import type { PendingEmployer } from "../types/pending.types";

interface PendingEmployerCardProps {
  employer: PendingEmployer;
  onVerify: (employerId: string) => void;
  isVerifying: boolean;
}

export default function PendingEmployerCard({
  employer,
  onVerify,
  isVerifying,
}: PendingEmployerCardProps) {
  return (
    <div
      className="rounded-card bg-white p-6 shadow-card ring-1 ring-ink/5 transition hover:shadow-raised"
      tabIndex={0}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-display font-semibold text-lg text-ink">
            {employer.companyName}
          </h3>
          <p className="mt-1 font-body text-sm text-ink/70">
            {employer.representativeName}
          </p>
          <p className="mt-1 font-body text-sm text-ink/70">{employer.email}</p>
          <p className="mt-2 font-mono text-xs text-ink/50">
            Đăng ký:{" "}
            {new Date(employer.registeredAt).toLocaleDateString("vi-VN")}
          </p>
        </div>
        <button
          type="button"
          onClick={() => onVerify(employer.id)}
          disabled={isVerifying}
          aria-label={`Xác thực doanh nghiệp ${employer.companyName}`}
          className="shrink-0 rounded-seal bg-primary px-6 py-2.5 font-body font-medium text-white shadow-card transition hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isVerifying ? (
            <span className="flex items-center justify-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              Đang xác thực...
            </span>
          ) : (
            "Xác thực"
          )}
        </button>
      </div>
    </div>
  );
}
