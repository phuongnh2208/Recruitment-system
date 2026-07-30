import { Navigate, Route, Routes } from "react-router-dom";
import ApplicationHistoryPage from "./features/student/components/ApplicationHistoryPage";
import ApplicantDetailPage from "./features/employer/components/ApplicantDetailPage";
import ApplicantsPage from "./features/employer/components/ApplicantsPage";
import CompanyProfilePage from "./features/employer/components/CompanyProfilePage";
import EmployerJobDashboard from "./features/job/components/EmployerJobDashboard";
import JobDetailPage from "./features/job/components/JobDetailPage";
import JobSearchPage from "./features/job/components/JobSearchPage";
import StudentCvPage from "./features/student/components/StudentCvPage";
import StudentProfilePage from "./features/student/components/StudentProfilePage";
import AdminDashboardPage from "./features/admin/components/AdminDashboardPage";
import PendingApprovalPage from "./features/admin/components/PendingApprovalPage";
import UserManagementPage from "./features/admin/components/UserManagementPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/student/profile" replace />} />
      <Route path="/student/profile" element={<StudentProfilePage />} />
      <Route path="/student/cv" element={<StudentCvPage />} />
      <Route
        path="/student/application-history"
        element={<ApplicationHistoryPage />}
      />
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
      <Route path="/student/jobs" element={<JobSearchPage />} />
      <Route path="/student/jobs/:jobId" element={<JobDetailPage />} />
      <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
      <Route
        path="/admin/pending-approvals"
        element={<PendingApprovalPage />}
      />
      <Route path="/admin/users" element={<UserManagementPage />} />
      <Route path="*" element={<Navigate to="/student/profile" replace />} />
    </Routes>
  );
}

export default App;
