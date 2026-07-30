import { Outlet, NavLink } from "react-router-dom";

const navItems = [
  { to: "/student/profile", label: "Profile" },
  { to: "/student/cv", label: "CV Management" },
  { to: "/student/jobs", label: "Browse Jobs" },
  { to: "/student/application-history", label: "Applications" },
];

/**
 * StudentLayout provides the navigation shell for student-facing pages.
 * Includes responsive sidebar navigation and a main content area.
 */
export function StudentLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50 lg:flex-row">
      {/* Sidebar Navigation */}
      <nav
        aria-label="Student navigation"
        className="flex w-full flex-row overflow-x-auto border-b border-gray-200 bg-white shadow-sm lg:w-64 lg:flex-col lg:border-b-0 lg:border-r"
      >
        <div className="hidden border-b border-gray-200 p-6 lg:block">
          <h1 className="text-lg font-bold text-blue-600">Student Portal</h1>
        </div>
        <ul className="flex flex-row gap-1 p-2 lg:flex-col lg:gap-2 lg:p-4">
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.to === "/student/profile"}
                className={({ isActive }) =>
                  `block rounded-lg px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                    isActive
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`
                }
              >
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-4 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
}
