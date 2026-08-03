import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "./core/routes/ProtectedRoute";
import { StudentLayout } from "./core/layouts/StudentLayout";
import { EmployerLayout } from "./core/layouts/EmployerLayout";
import { AdminLayout } from "./core/layouts/AdminLayout";
import { NotFoundPage } from "./features/auth/NotFoundPage";
import { UnauthorizedPage } from "./features/auth/UnauthorizedPage";
import { ForbiddenPage } from "./features/auth/ForbiddenPage";
import { ToastProvider } from "./core/components/ToastContext";
import { GlobalLoading } from "./core/components/GlobalLoading";

// Lazy-loaded pages for code splitting
const LoginPage = lazy(() => import("./features/auth/LoginPage"));
const RegisterPage = lazy(() => import("./features/auth/RegisterPage"));

const ApplicationHistoryPage = lazy(
  () => import("./features/student/components/ApplicationHistoryPage"),
);
const ApplicantDetailPage = lazy(
  () => import("./features/employer/components/ApplicantDetailPage"),
);
const ApplicantsPage = lazy(
  () => import("./features/employer/components/ApplicantsPage"),
);
const CompanyProfilePage = lazy(
  () => import("./features/employer/components/CompanyProfilePage"),
);
const EmployerJobDashboard = lazy(
  () => import("./features/job/components/EmployerJobDashboard"),
);
const JobFormPage = lazy(() => import("./features/job/components/JobFormPage"));
const JobDetailPage = lazy(
  () => import("./features/job/components/JobDetailPage"),
);
const JobSearchPage = lazy(
  () => import("./features/job/components/JobSearchPage"),
);
const StudentProfilePage = lazy(
  () => import("./features/student/components/StudentProfilePage"),
);
const AdminDashboardPage = lazy(
  () => import("./features/admin/components/AdminDashboardPage"),
);
const PendingApprovalPage = lazy(
  () => import("./features/admin/components/PendingApprovalPage"),
);
const UserManagementPage = lazy(
  () => import("./features/admin/components/UserManagementPage"),
);
const AuditLogPage = lazy(
  () => import("./features/admin/components/AuditLogPage"),
);

function App() {
  return (
    <ToastProvider>
      <Suspense fallback={<GlobalLoading />}>
        <Routes>
          {/* Public auth routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          <Route path="/forbidden" element={<ForbiddenPage />} />

          {/* Student routes - require STUDENT role */}
          <Route element={<ProtectedRoute allowedRoles={["STUDENT"]} />}>
            <Route element={<StudentLayout />}>
              <Route path="/student/profile" element={<StudentProfilePage />} />
              <Route
                path="/student/cv"
                element={<Navigate to="/student/profile" replace />}
              />
              <Route
                path="/student/application-history"
                element={<ApplicationHistoryPage />}
              />
              <Route path="/student/jobs" element={<JobSearchPage />} />
              <Route path="/student/jobs/:jobId" element={<JobDetailPage />} />
            </Route>
          </Route>

          {/* Employer routes - require EMPLOYER role */}
          <Route element={<ProtectedRoute allowedRoles={["EMPLOYER"]} />}>
            <Route element={<EmployerLayout />}>
              <Route
                path="/employer/company-profile"
                element={<CompanyProfilePage />}
              />
              <Route path="/employer/applicants" element={<ApplicantsPage />} />
              <Route
                path="/employer/applicants/:applicationId"
                element={<ApplicantDetailPage />}
              />
              <Route path="/employer/jobs" element={<EmployerJobDashboard />} />
              <Route
                path="/employer/jobs/create"
                element={<JobFormPage mode="create" />}
              />
              <Route
                path="/employer/jobs/:jobId/edit"
                element={<JobFormPage mode="edit" />}
              />
            </Route>
          </Route>

          {/* Admin routes - require ADMINISTRATOR role */}
          <Route element={<ProtectedRoute allowedRoles={["ADMINISTRATOR"]} />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
              <Route
                path="/admin/pending-approvals"
                element={<PendingApprovalPage />}
              />
              <Route path="/admin/users" element={<UserManagementPage />} />
              <Route path="/admin/audit-logs" element={<AuditLogPage />} />
            </Route>
          </Route>

          {/* Default redirect - role-aware */}
          <Route path="/" element={<RoleRedirect />} />

          {/* 404 catch-all */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </ToastProvider>
  );
}

function RoleRedirect() {
  const role = localStorage.getItem("userRole");
  const target =
    role === "ADMINISTRATOR"
      ? "/admin/dashboard"
      : role === "EMPLOYER"
        ? "/employer/jobs"
        : "/student/jobs";
  return <Navigate to={target} replace />;
}

export default App;
