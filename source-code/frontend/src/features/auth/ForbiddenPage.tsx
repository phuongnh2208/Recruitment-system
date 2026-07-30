import { Link } from "react-router-dom";

/**
 * Forbidden page.
 * Displayed when a user is authenticated but does not have the required role.
 */
export function ForbiddenPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md text-center">
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
              d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
            />
          </svg>
        </div>
        <h1 className="mb-2 text-xl font-semibold text-gray-900">
          Access Denied
        </h1>
        <p className="mb-6 text-sm text-gray-500">
          You do not have the required permissions to access this page.
        </p>
        <Link
          to="/student/profile"
          className="inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
        >
          Go to Home
        </Link>
      </div>
    </div>
  );
}
