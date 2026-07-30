/**
 * Applicant Info Card – displays the student's personal and academic information.
 *
 * ═══════════════════════════════════════════════════════════════════
 * UI COMPONENT
 * ═══════════════════════════════════════════════════════════════════
 *
 *   - ✅ Shows student full name, email, phone, university, major
 *   - ✅ Shows graduation year if available
 *   - ✅ Follows design.md card pattern
 *   - ❌ No business logic
 */

import type { StudentInfo } from "../types/applicant-detail.types";

export interface ApplicantInfoCardProps {
  /** Student information to display. */
  student: StudentInfo;
}

export default function ApplicantInfoCard({ student }: ApplicantInfoCardProps) {
  return (
    <div className="rounded-card bg-white p-6 shadow-card ring-1 ring-ink/5">
      <h2 className="font-display text-lg font-semibold text-ink">
        Thông tin ứng viên
      </h2>

      <div className="mt-4 space-y-3">
        {/* Full name */}
        <div className="flex items-start gap-3">
          <svg
            className="mt-0.5 h-5 w-5 shrink-0 text-ink/40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          <div>
            <p className="font-body text-sm text-ink/50">Họ và tên</p>
            <p className="font-body text-base font-medium text-ink">
              {student.fullName}
            </p>
          </div>
        </div>

        {/* Email */}
        <div className="flex items-start gap-3">
          <svg
            className="mt-0.5 h-5 w-5 shrink-0 text-ink/40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <path d="M22 4L12 13 2 4" />
          </svg>
          <div>
            <p className="font-body text-sm text-ink/50">Email</p>
            <p className="font-body text-base text-ink">{student.email}</p>
          </div>
        </div>

        {/* Phone */}
        {student.phone && (
          <div className="flex items-start gap-3">
            <svg
              className="mt-0.5 h-5 w-5 shrink-0 text-ink/40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
            </svg>
            <div>
              <p className="font-body text-sm text-ink/50">Số điện thoại</p>
              <p className="font-body text-base text-ink">{student.phone}</p>
            </div>
          </div>
        )}

        {/* University */}
        {student.university && (
          <div className="flex items-start gap-3">
            <svg
              className="mt-0.5 h-5 w-5 shrink-0 text-ink/40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
              <path d="M6 12v5c3 3 9 3 12 0v-5" />
            </svg>
            <div>
              <p className="font-body text-sm text-ink/50">Trường đại học</p>
              <p className="font-body text-base text-ink">
                {student.university}
              </p>
            </div>
          </div>
        )}

        {/* Major */}
        {student.major && (
          <div className="flex items-start gap-3">
            <svg
              className="mt-0.5 h-5 w-5 shrink-0 text-ink/40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
            <div>
              <p className="font-body text-sm text-ink/50">Chuyên ngành</p>
              <p className="font-body text-base text-ink">{student.major}</p>
            </div>
          </div>
        )}

        {/* Graduation year */}
        {student.graduationYear && (
          <div className="flex items-start gap-3">
            <svg
              className="mt-0.5 h-5 w-5 shrink-0 text-ink/40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <div>
              <p className="font-body text-sm text-ink/50">Năm tốt nghiệp</p>
              <p className="font-body text-base text-ink">
                {student.graduationYear}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
