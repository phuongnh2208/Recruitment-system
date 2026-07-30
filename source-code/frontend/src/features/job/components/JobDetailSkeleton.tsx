/**
 * Job Detail Skeleton – loading state for the job detail page.
 *
 * ═══════════════════════════════════════════════════════════════════
 * UI COMPONENT
 * ═══════════════════════════════════════════════════════════════════
 *
 *   - ✅ Shows skeleton placeholders while loading
 *   - ✅ Follows design.md spacing and animation patterns
 */

export default function JobDetailSkeleton() {
  return (
    <div className="min-h-screen bg-paper">
      <div className="mx-auto max-w-5xl px-4 py-8 md:px-6 md:py-12">
        {/* Header skeleton */}
        <div className="mb-6">
          <div className="h-8 w-3/4 animate-pulse rounded bg-sage/50" />
          <div className="mt-2 h-4 w-1/4 animate-pulse rounded bg-sage/50" />
        </div>

        {/* Main content skeleton */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left column - Job details */}
          <div className="space-y-6 lg:col-span-2">
            <div className="rounded-card bg-white p-6 shadow-card">
              <div className="h-6 w-1/3 animate-pulse rounded bg-sage/50" />
              <div className="mt-4 space-y-2">
                <div className="h-4 w-full animate-pulse rounded bg-sage/50" />
                <div className="h-4 w-full animate-pulse rounded bg-sage/50" />
                <div className="h-4 w-2/3 animate-pulse rounded bg-sage/50" />
              </div>
            </div>

            <div className="rounded-card bg-white p-6 shadow-card">
              <div className="h-6 w-1/3 animate-pulse rounded bg-sage/50" />
              <div className="mt-4 space-y-2">
                <div className="h-4 w-full animate-pulse rounded bg-sage/50" />
                <div className="h-4 w-full animate-pulse rounded bg-sage/50" />
                <div className="h-4 w-2/3 animate-pulse rounded bg-sage/50" />
              </div>
            </div>
          </div>

          {/* Right column - Sidebar */}
          <div className="space-y-6 lg:col-span-1">
            <div className="rounded-card bg-white p-6 shadow-card">
              <div className="h-6 w-1/2 animate-pulse rounded bg-sage/50" />
              <div className="mt-4 space-y-3">
                <div className="h-4 w-full animate-pulse rounded bg-sage/50" />
                <div className="h-4 w-full animate-pulse rounded bg-sage/50" />
                <div className="h-4 w-2/3 animate-pulse rounded bg-sage/50" />
              </div>
            </div>

            <div className="rounded-card bg-white p-6 shadow-card">
              <div className="h-10 w-full animate-pulse rounded bg-sage/50" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
