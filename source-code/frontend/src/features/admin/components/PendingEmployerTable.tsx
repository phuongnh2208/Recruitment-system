/**
 * Pending employers table component.
 *
 * ═══════════════════════════════════════════════════════════════════
 * UI COMPONENT
 * ═══════════════════════════════════════════════════════════════════
 *
 *   - ✅ Displays a list of employers awaiting verification
 *   - ✅ Responsive table with mobile card fallback
 *   - ✅ Uses status styling per design.md
 *   - ❌ No business logic
 */

import type { PendingEmployer } from "../types/dashboard.types";

interface PendingEmployerTableProps {
  employers: PendingEmployer[];
}

export default function PendingEmployerTable({
  employers,
}: PendingEmployerTableProps) {
  if (employers.length === 0) {
    return null;
  }

  return (
    <section aria-label="Danh sách doanh nghiệp chờ duyệt">
      <h2 className="font-display text-xl font-semibold text-ink">
        Doanh nghiệp chờ duyệt
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
                Tên doanh nghiệp
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left font-body text-xs font-medium uppercase tracking-wider text-ink/60"
              >
                Email
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left font-body text-xs font-medium uppercase tracking-wider text-ink/60"
              >
                Website
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left font-body text-xs font-medium uppercase tracking-wider text-ink/60"
              >
                Ngày đăng ký
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-sage/50">
            {employers.map((employer) => (
              <tr
                key={employer.id}
                className="transition hover:bg-paper/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                tabIndex={0}
              >
                <td className="px-4 py-3 font-body text-sm font-medium text-ink">
                  {employer.companyName}
                </td>
                <td className="px-4 py-3 font-body text-sm text-ink/70">
                  {employer.email}
                </td>
                <td className="px-4 py-3 font-body text-sm text-ink/70">
                  {employer.website || "—"}
                </td>
                <td className="px-4 py-3 font-mono text-xs text-ink/50">
                  {new Date(employer.registeredAt).toLocaleDateString("vi-VN")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Mobile card list */}
        <div className="divide-y divide-sage/50 md:hidden">
          {employers.map((employer) => (
            <div
              key={employer.id}
              className="bg-white px-4 py-3 transition hover:bg-paper/50"
            >
              <p className="font-body text-sm font-medium text-ink">
                {employer.companyName}
              </p>
              <p className="mt-0.5 font-body text-xs text-ink/60">
                {employer.email}
              </p>
              <div className="mt-1 flex items-center gap-3">
                {employer.website && (
                  <span className="font-body text-xs text-ink/50">
                    {employer.website}
                  </span>
                )}
                <span className="font-mono text-xs text-ink/40">
                  {new Date(employer.registeredAt).toLocaleDateString("vi-VN")}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
