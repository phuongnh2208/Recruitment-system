/**
 * Skeleton loader for applicants table rows.
 *
 * ═══════════════════════════════════════════════════════════════════
 * UI COMPONENT
 * ═══════════════════════════════════════════════════════════════════
 *
 *   - ✅ Matches the structure of ApplicantRow
 *   - ✅ Uses animate-pulse for loading animation
 *   - ❌ No business logic
 */

export default function ApplicantsSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="rounded-card bg-white p-4 shadow-card ring-1 ring-ink/5"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex-1 space-y-2">
              <div className="h-5 w-48 animate-pulse rounded bg-sage/50" />
              <div className="h-4 w-32 animate-pulse rounded bg-sage/30" />
            </div>
            <div className="h-6 w-24 animate-pulse rounded-seal bg-sage/50" />
          </div>
          <div className="mt-3 flex items-center gap-2">
            <div className="h-4 w-4 animate-pulse rounded bg-sage/50" />
            <div className="h-4 w-24 animate-pulse rounded bg-sage/30" />
          </div>
        </div>
      ))}
    </div>
  );
}
