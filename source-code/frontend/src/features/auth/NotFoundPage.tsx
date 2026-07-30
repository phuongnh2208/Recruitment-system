import { Link } from "react-router-dom";

/**
 * 404 Not Found page.
 * Displayed when no route matches the current URL.
 */
export function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md text-center">
        <h1 className="mb-4 text-6xl font-bold text-gray-300">404</h1>
        <h2 className="mb-2 text-xl font-semibold text-gray-900">
          Page Not Found
        </h2>
        <p className="mb-6 text-sm text-gray-500">
          The page you are looking for does not exist or has been moved.
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
