/**
 * Loading skeleton for the applicant detail page.
 *
 * ═══════════════════════════════════════════════════════════════════
 * UI COMPONENT
 * ═══════════════════════════════════════════════════════════════════
 *
 *   - ✅ Matches the structure of ApplicantDetailPage
 *   - ✅ Uses animate-pulse for loading animation
 *   - ❌ No business logic
 */

export default function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-paper">
      <div className="mx-auto max-w-5xl px-4 py-8 md:px-6 md:py-12">
        {/* Header skeleton */}
        <div className="mb-8 space-y-3">
          <div className="h-8 w-64 animate-pulse rounded bg-sage/50" />
          <div className="h-4 w-96 animate-pulse rounded bg-sage/30" />
        </div>

        {/* Back button skeleton */}
        <div className="mb-6">
          <div className="h-5 w-32 animate-pulse rounded bg-sage/30" />
        </div>

        {/* Info card skeleton */}
        <div className="rounded-card bg-white p-6 shadow-card ring-1 ring-ink/5">
          <div className="h-6 w-40 animate-pulse rounded bg-sage/50" />
          <div className="mt-4 space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="h-5 w-5 animate-pulse rounded bg-sage/50" />
                <div className="flex-1 space-y-1">
                  <div className="h-3 w-20 animate-pulse rounded bg-sage/30" />
                  <div className="h-4 w-48 animate-pulse rounded bg-sage/40" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
