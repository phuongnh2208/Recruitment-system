import { Outlet, NavLink } from "react-router-dom";
import { AppHeader } from "../components/AppHeader";

const navItems = [
  { to: "/admin/dashboard", label: "Bảng điều khiển", icon: "📊" },
  { to: "/admin/pending-approvals", label: "Phê duyệt", icon: "✅" },
  { to: "/admin/users", label: "Quản lý người dùng", icon: "👥" },
];

/**
 * AdminLayout provides the navigation shell for admin-facing pages.
 * Includes responsive sidebar navigation, header with user info, and a main content area.
 */
export function AdminLayout() {
  const role = localStorage.getItem("userRole") || "ADMINISTRATOR";

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      {/* Header with logout */}
      <AppHeader title="TrustHire - Quản trị" role={role} />

      <div className="flex flex-1 flex-col lg:flex-row">
        {/* Sidebar Navigation */}
        <nav
          aria-label="Admin navigation"
          className="w-full border-b border-gray-200 bg-white shadow-sm lg:w-64 lg:border-b-0 lg:border-r"
        >
          <div className="hidden border-b border-gray-100 p-6 lg:block">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-600 text-sm font-bold text-white">
                T
              </div>
              <div>
                <h2 className="text-sm font-semibold text-gray-900">
                  TrustHire
                </h2>
                <p className="text-xs text-gray-500">Quản trị hệ thống</p>
              </div>
            </div>
          </div>
          <ul className="flex flex-row gap-1 overflow-x-auto p-2 lg:flex-col lg:gap-1 lg:p-4">
            {navItems.map((item) => (
              <li key={item.to} className="flex-shrink-0">
                <NavLink
                  to={item.to}
                  end={item.to === "/admin/dashboard"}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
                      isActive
                        ? "bg-purple-50 text-purple-700 shadow-sm"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    }`
                  }
                >
                  <span className="text-base">{item.icon}</span>
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
