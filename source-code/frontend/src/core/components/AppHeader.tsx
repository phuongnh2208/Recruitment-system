import { useLogout } from "../../features/auth/hooks/useAuth";
import { NotificationIcon } from "./NotificationIcon";

interface AppHeaderProps {
  title: string;
  role: string;
}

export function AppHeader({ title, role }: AppHeaderProps) {
  const logoutMutation = useLogout();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const roleBadgeColor =
    role === "ADMINISTRATOR"
      ? "bg-purple-100 text-purple-700"
      : role === "EMPLOYER"
        ? "bg-indigo-100 text-indigo-700"
        : "bg-blue-100 text-blue-700";

  const roleLabel =
    role === "ADMINISTRATOR"
      ? "Quản trị viên"
      : role === "EMPLOYER"
        ? "Nhà tuyển dụng"
        : "Sinh viên";

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 shadow-sm lg:px-8">
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
      </div>
      <div className="flex items-center gap-4">
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${roleBadgeColor}`}
        >
          {roleLabel}
        </span>
        <NotificationIcon />
        <button
          onClick={handleLogout}
          disabled={logoutMutation.isPending}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"
            />
          </svg>
          {logoutMutation.isPending ? "Đang đăng xuất..." : "Đăng xuất"}
        </button>
      </div>
    </header>
  );
}
