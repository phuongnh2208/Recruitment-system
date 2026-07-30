/**
 * Job Information Card – displays key job information (location, salary, expiry).
 *
 * ═══════════════════════════════════════════════════════════════════
 * UI COMPONENT
 * ═══════════════════════════════════════════════════════════════════
 *
 *   - ✅ Shows location, salary range, and expiration date
 *   - ✅ Follows design.md card and icon patterns
 */

export interface JobInformationCardProps {
  /** Job location. */
  location: string;
  /** Minimum salary (optional). */
  salaryMin?: number | null;
  /** Maximum salary (optional). */
  salaryMax?: number | null;
  /** Currency code (default: VND). */
  currency?: string;
  /** Expiration date string. */
  expiresAt: string;
}

/** Format date to Vietnamese locale. */
function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/** Format salary range for display. */
function formatSalary(
  min?: number | null,
  max?: number | null,
  currency?: string,
): string {
  if (!min && !max) return "Thỏa thuận";

  const curr = currency || "VND";
  const formatNumber = (num: number) => num.toLocaleString("vi-VN");

  if (min && max) {
    return `${formatNumber(min)} - ${formatNumber(max)} ${curr}`;
  }
  if (min) {
    return `Từ ${formatNumber(min)} ${curr}`;
  }
  if (max) {
    return `Đến ${formatNumber(max)} ${curr}`;
  }
  return "Thỏa thuận";
}

export default function JobInformationCard({
  location,
  salaryMin,
  salaryMax,
  currency,
  expiresAt,
}: JobInformationCardProps) {
  return (
    <div className="rounded-card bg-white p-6 shadow-card ring-1 ring-ink/5">
      <h2 className="font-display font-semibold text-xl text-ink">
        Thông tin công việc
      </h2>
      <div className="mt-4 space-y-3">
        {/* Location */}
        <div className="flex items-center gap-2">
          <svg
            className="h-5 w-5 text-ink/40 shrink-0"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          <span className="font-body text-sm text-ink/70">{location}</span>
        </div>

        {/* Salary */}
        <div className="flex items-center gap-2">
          <svg
            className="h-5 w-5 text-ink/40 shrink-0"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <line x1="12" y1="1" x2="12" y2="23" />
            <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
          </svg>
          <span className="font-body text-sm text-ink/70">
            {formatSalary(salaryMin, salaryMax, currency)}
          </span>
        </div>

        {/* Expiry date */}
        <div className="flex items-center gap-2">
          <svg
            className="h-5 w-5 text-ink/40 shrink-0"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <span className="font-body text-sm text-ink/70">
            Hạn nộp: {formatDate(expiresAt)}
          </span>
        </div>
      </div>
    </div>
  );
}
