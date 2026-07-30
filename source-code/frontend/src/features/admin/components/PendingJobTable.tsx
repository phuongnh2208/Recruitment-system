/**
 * Pending jobs table component.
 *
 * ═══════════════════════════════════════════════════════════════════
 * UI COMPONENT
 * ═══════════════════════════════════════════════════════════════════
 *
 *   - ✅ Displays a list of job postings awaiting approval
 *   - ✅ Responsive table with mobile card fallback
 *   - ✅ Status badge with "Pending" state per design.md
 *   - ❌ No business logic
 */

import type { PendingJob } from "../types/dashboard.types";

interface PendingJobTableProps {
  jobs: PendingJob[];
}

export default function PendingJobTable({ jobs }: PendingJobTableProps) {
  if (jobs.length === 0) {
    return null;
  }

  return (
    <section aria-label="Danh sách tin tuyển dụng chờ duyệt">
      <h2 className="font-display text-xl font-semibold text-ink">
        Tin tuyển dụng chờ duyệt
      </h2>
      <div className="mt-4 overflow-hidden rounded-card ring-1 ring-ink/5">
        {/* Desktop table */}
        <table className="hidden w-full bg-white md:table">
          <thead>
            <tr className="border-b border-sage bg-paper">
              <th
                scope="col"
                className="px-4 py-3 text-left font-body text-xs font-medium uppercase tracking-wider text-ink/60"
              >
                Tiêu đề
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left font-body text-xs font-medium uppercase tracking-wider text-ink/60"
              >
                Doanh nghiệp
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left font-body text-xs font-medium uppercase tracking-wider text-ink/60"
              >
                Ngày tạo
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left font-body text-xs font-medium uppercase tracking-wider text-ink/60"
              >
                Trạng thái
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-sage/50">
            {jobs.map((job) => (
              <tr
                key={job.id}
                className="transition hover:bg-paper/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                tabIndex={0}
              >
                <td className="px-4 py-3 font-body text-sm font-medium text-ink">
                  {job.title}
                </td>
                <td className="px-4 py-3 font-body text-sm text-ink/70">
                  {job.employerName}
                </td>
                <td className="px-4 py-3 font-mono text-xs text-ink/50">
                  {new Date(job.createdAt).toLocaleDateString("vi-VN")}
                </td>
                <td className="px-4 py-3">
                  <span className="inline-flex rounded-seal bg-warning-light px-2.5 py-0.5 font-mono text-xs font-medium text-warning ring-1 ring-warning/20">
                    Pending
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Mobile card list */}
        <div className="divide-y divide-sage/50 md:hidden">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="bg-white px-4 py-3 transition hover:bg-paper/50"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="font-body text-sm font-medium text-ink">
                  {job.title}
                </p>
                <span className="shrink-0 rounded-seal bg-warning-light px-2 py-0.5 font-mono text-xs text-warning ring-1 ring-warning/20">
                  Pending
                </span>
              </div>
              <p className="mt-0.5 font-body text-xs text-ink/60">
                {job.employerName}
              </p>
              <p className="mt-1 font-mono text-xs text-ink/40">
                {new Date(job.createdAt).toLocaleDateString("vi-VN")}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
