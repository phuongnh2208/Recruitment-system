/**
 * GlobalError component
 *
 * Displays a full-page error boundary fallback.
 * Used when an unexpected error occurs in the application.
 */
interface GlobalErrorProps {
  error?: Error;
  resetError?: () => void;
}

export function GlobalError({ error, resetError }: GlobalErrorProps) {
  return (
    <div
      role="alert"
      aria-label="Application error"
      className="flex min-h-screen items-center justify-center bg-gray-50 p-4"
    >
      <div className="w-full max-w-md rounded-lg border border-red-200 bg-white p-8 text-center shadow-sm">
        <div
          className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100"
          aria-hidden="true"
        >
          <svg
            className="h-8 w-8 text-red-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
        <h1 className="mb-2 text-xl font-semibold text-gray-900">
          Something went wrong
        </h1>
        <p className="mb-6 text-sm text-gray-500">
          {error?.message || "An unexpected error occurred. Please try again."}
        </p>
        {resetError && (
          <button
            onClick={resetError}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          >
            Try again
          </button>
        )}
      </div>
    </div>
  );
}
