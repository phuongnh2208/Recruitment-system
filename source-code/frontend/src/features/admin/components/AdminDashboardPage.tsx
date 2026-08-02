/**
 * Admin Dashboard Page – implements TSK-FE-AD-201.
 *
 * ═══════════════════════════════════════════════════════════════════
 * PAGE COMPONENT (Presentation Layer)
 * ═══════════════════════════════════════════════════════════════════
 *
 *   - ✅ Displays dashboard statistics (Total Users, Students, Employers,
 *        Jobs, Applications)
 *   - ✅ Displays pending employers and pending jobs tables
 *   - ✅ Loading skeleton state
 *   - ✅ Empty state
 *   - ✅ Error state with retry button
 *   - ✅ Responsive layout (Desktop, Tablet, Mobile)
 *   - ❌ No direct API calls – uses service layer via hooks
 *   - ❌ No business logic – delegated to hooks / service
 */

import { useAdminDashboard } from "../hooks/useAdminDashboard";
import DashboardStatCard from "./DashboardStatCard";
import DashboardSkeleton from "./DashboardSkeleton";
import DashboardEmptyState from "./DashboardEmptyState";

export default function AdminDashboardPage() {
  const {
    data: dashboardData,
    isLoading,
    isError,
    error,
    refetch,
  } = useAdminDashboard();

  const handleRetry = () => {
    refetch();
  };

  return (
    <div className="min-h-screen bg-paper">
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-12">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="font-display text-2xl font-semibold text-ink md:text-3xl">
            Dashboard
          </h1>
          <p className="mt-1 font-body text-sm text-ink/60">
            Tổng quan hệ thống quản trị TrustHire.
          </p>
        </div>

        {/* Error state with retry */}
        {isError && (
          <div
            className="mb-6 rounded-lg border border-danger/20 bg-danger-light px-4 py-3"
            role="alert"
          >
            <p className="font-body text-sm font-medium text-danger">
              {(error as Error).message ?? "Không thể tải dữ liệu dashboard."}
            </p>
            <button
              onClick={handleRetry}
              className="mt-2 rounded-seal border border-danger px-4 py-1.5 font-body text-sm text-danger transition hover:bg-danger/10"
            >
              Thử lại
            </button>
          </div>
        )}

        {/* Loading state */}
        {isLoading && <DashboardSkeleton />}

        {/* Content */}
        {!isLoading && !isError && (
          <>
            {dashboardData ? (
              <div className="space-y-8">
                {/* Statistics cards */}
                <section aria-label="Thống kê hệ thống">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                    <DashboardStatCard
                      label="Tổng người dùng"
                      value={dashboardData.totalUsers}
                      icon={
                        <svg
                          className="h-6 w-6"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        >
                          <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                          <circle cx="8.5" cy="7" r="4" />
                          <path d="M20 8v6" />
                          <path d="M23 11h-6" />
                        </svg>
                      }
                    />
                    <DashboardStatCard
                      label="Sinh viên"
                      value={dashboardData.totalStudents}
                      icon={
                        <svg
                          className="h-6 w-6"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        >
                          <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                          <path d="M6 12v5c3 3 9 3 12 0v-5" />
                        </svg>
                      }
                    />
                    <DashboardStatCard
                      label="Nhà tuyển dụng"
                      value={dashboardData.totalEmployers}
                      icon={
                        <svg
                          className="h-6 w-6"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        >
                          <rect
                            x="2"
                            y="7"
                            width="20"
                            height="14"
                            rx="2"
                            ry="2"
                          />
                          <path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" />
                        </svg>
                      }
                    />
                    <DashboardStatCard
                      label="Tin tuyển dụng"
                      value={dashboardData.totalJobs}
                      icon={
                        <svg
                          className="h-6 w-6"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        >
                          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                          <polyline points="14 2 14 8 20 8" />
                          <line x1="16" y1="13" x2="8" y2="13" />
                          <line x1="16" y1="17" x2="8" y2="17" />
                        </svg>
                      }
                    />
                    <DashboardStatCard
                      label="Đơn ứng tuyển"
                      value={dashboardData.totalApplications}
                      icon={
                        <svg
                          className="h-6 w-6"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        >
                          <path d="M9 12h6" />
                          <path d="M9 16h6" />
                          <path d="M9 20h6" />
                          <rect
                            x="3"
                            y="4"
                            width="18"
                            height="18"
                            rx="2"
                            ry="2"
                          />
                          <circle cx="12" cy="8" r="2" />
                        </svg>
                      }
                    />
                  </div>
                </section>

                {/* Pending items summary */}
                {(dashboardData.pendingEmployers > 0 ||
                  dashboardData.pendingJobs > 0) && (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="rounded-lg border border-ink/10 bg-white p-6">
                      <h3 className="font-display text-lg font-semibold text-ink">
                        Nhà tuyển dụng chờ duyệt
                      </h3>
                      <p className="mt-2 font-body text-3xl font-bold text-primary">
                        {dashboardData.pendingEmployers}
                      </p>
                      <p className="mt-1 font-body text-sm text-ink/60">
                        Nhà tuyển dụng đang chờ xác minh
                      </p>
                    </div>
                    <div className="rounded-lg border border-ink/10 bg-white p-6">
                      <h3 className="font-display text-lg font-semibold text-ink">
                        Tin tuyển dụng chờ duyệt
                      </h3>
                      <p className="mt-2 font-body text-3xl font-bold text-primary">
                        {dashboardData.pendingJobs}
                      </p>
                      <p className="mt-1 font-body text-sm text-ink/60">
                        Tin tuyển dụng đang chờ phê duyệt
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <DashboardEmptyState />
            )}
          </>
        )}
      </div>
    </div>
  );
}
