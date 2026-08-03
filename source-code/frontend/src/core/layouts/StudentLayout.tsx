import { Outlet, NavLink } from "react-router-dom";
import {
  UserCircleIcon,
  BriefcaseIcon,
  ClipboardDocumentListIcon,
} from "@heroicons/react/24/outline";
import { AppHeader } from "../components/AppHeader";

const navItems = [
  { to: "/student/profile", label: "Hồ sơ cá nhân", Icon: UserCircleIcon },
  { to: "/student/jobs", label: "Việc làm", Icon: BriefcaseIcon },
  {
    to: "/student/application-history",
    label: "Lịch sử ứng tuyển",
    Icon: ClipboardDocumentListIcon,
  },
];

/**
 * StudentLayout provides the navigation shell for student-facing pages.
 * Includes responsive sidebar navigation, header with user info, and a main content area.
 */
export function StudentLayout() {
  const role = localStorage.getItem("userRole") || "STUDENT";

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      {/* Header with logout */}
      <AppHeader title="TrustHire - Sinh viên" role={role} />

      <div className="flex flex-1 flex-col lg:flex-row">
        {/* Sidebar Navigation */}
        <nav
          aria-label="Student navigation"
          className="w-full border-b border-gray-200 bg-white shadow-sm lg:w-64 lg:border-b-0 lg:border-r"
        >
          <div className="hidden border-b border-gray-100 p-6 lg:block">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-sm font-bold text-white">
                T
              </div>
              <div>
                <h2 className="text-sm font-semibold text-gray-900">
                  TrustHire
                </h2>
                <p className="text-xs text-gray-500">Cổng việc làm sinh viên</p>
              </div>
            </div>
          </div>
          <ul className="flex flex-row gap-1 overflow-x-auto p-2 lg:flex-col lg:gap-1 lg:p-4">
            {navItems.map((item) => (
              <li key={item.to} className="flex-shrink-0">
                <NavLink
                  to={item.to}
                  end={item.to === "/student/profile"}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
                      isActive
                        ? "bg-blue-50 text-blue-700 shadow-sm"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    }`
                  }
                >
                  <item.Icon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
                  <span className="hidden lg:inline">{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-4 lg:p-8">
          <div className="mx-auto max-w-6xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
