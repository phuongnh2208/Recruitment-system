/**
 * Filter controls for the employer job dashboard.
 *
 * ═══════════════════════════════════════════════════════════════════
 * UI COMPONENT
 * ═══════════════════════════════════════════════════════════════════
 *
 *   - ✅ Search input with icon
 *   - ✅ State filter dropdown
 *   - ✅ Follows design.md form input patterns
 *   - ❌ Business logic – parent component controls state
 */

import type { EmployerJobsFilters } from "../types/employer-job.types";

export interface EmployerJobFilterProps {
  /** Current filter values. */
  filters: EmployerJobsFilters;
  /** Callback when search input changes. */
  onSearchChange: (search: string) => void;
  /** Callback when state filter changes. */
  onStateChange: (state: string) => void;
}

const STATE_OPTIONS = [
  { value: "", label: "Tất cả trạng thái" },
  { value: "Draft", label: "Nháp" },
  { value: "Pending", label: "Chờ duyệt" },
  { value: "Approved", label: "Đã duyệt" },
  { value: "Rejected", label: "Bị từ chối" },
  { value: "Closed", label: "Đã đóng" },
  { value: "Expired", label: "Hết hạn" },
];

export default function EmployerJobFilter({
  filters,
  onSearchChange,
  onStateChange,
}: EmployerJobFilterProps) {
  return (
    <div className="mb-6 flex flex-col sm:flex-row gap-3">
      {/* Search input */}
      <div className="flex-1">
        <label htmlFor="search" className="sr-only">
          Tìm kiếm tin tuyển dụng
        </label>
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            id="search"
            type="search"
            placeholder="Tìm kiếm theo tiêu đề hoặc địa điểm..."
            value={filters.search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full rounded-lg border border-ink/15 bg-white pl-10 pr-4 py-2.5 font-body text-sm text-ink placeholder:text-ink/30 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      {/* State filter */}
      <div className="sm:w-48">
        <label htmlFor="state" className="sr-only">
          Lọc theo trạng thái
        </label>
        <select
          id="state"
          value={filters.state}
          onChange={(e) => onStateChange(e.target.value)}
          className="w-full rounded-lg border border-ink/15 bg-white px-4 py-2.5 font-body text-sm text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          {STATE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
