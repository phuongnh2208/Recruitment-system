/**
 * GlobalLoading component
 *
 * Displays a full-page loading spinner.
 * Used during initial app loading, lazy-loading transitions, and auth checks.
 */
export function GlobalLoading() {
  return (
    <div
      role="status"
      aria-label="Loading"
      className="flex min-h-screen items-center justify-center bg-gray-50"
    >
      <div className="flex flex-col items-center gap-4">
        <div
          className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"
          aria-hidden="true"
        />
        <p className="text-sm font-medium text-gray-500">Loading...</p>
      </div>
    </div>
  );
}
