/**
 * Filter controls for the job search page.
 *
 * ═══════════════════════════════════════════════════════════════════
 * UI COMPONENT
 * ═══════════════════════════════════════════════════════════════════
 *
 *   - ✅ Search input with icon
 *   - ✅ Location filter input
 *   - ✅ Salary range filters (min/max)
 *   - ✅ Follows design.md form input patterns
 *   - ❌ Business logic – parent component controls state
 */

import type { JobSearchFilters } from "../types/job-search.types";

export interface JobSearchFilterProps {
  /** Current filter values. */
  filters: JobSearchFilters;
  /** Callback when search input changes. */
  onSearchChange: (search: string) => void;
  /** Callback when location input changes. */
  onLocationChange: (location: string) => void;
  /** Callback when salary min changes. */
  onSalaryMinChange: (salaryMin: number | undefined) => void;
  /** Callback when salary max changes. */
  onSalaryMaxChange: (salaryMax: number | undefined) => void;
}

export default function JobSearchFilter({
  filters,
  onSearchChange,
  onLocationChange,
  onSalaryMinChange,
  onSalaryMaxChange,
}: JobSearchFilterProps) {
  const handleSalaryMinChange = (value: string) => {
    const num = value ? Number(value) : undefined;
    onSalaryMinChange(num);
  };

  const handleSalaryMaxChange = (value: string) => {
    const num = value ? Number(value) : undefined;
    onSalaryMaxChange(num);
  };

  return (
    <div className="mb-6 space-y-3">
      {/* Search and Location row */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search input */}
        <div className="flex-1">
          <label htmlFor="search" className="sr-only">
            Tìm kiếm việc làm
          </label>
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              id="search"
              type="search"
              placeholder="Tìm kiếm theo tiêu đề, công ty..."
              value={filters.search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full rounded-lg border border-ink/15 bg-white pl-10 pr-4 py-2.5 font-body text-sm text-ink placeholder:text-ink/30 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        {/* Location input */}
        <div className="sm:w-64">
          <label htmlFor="location" className="sr-only">
            Địa điểm
          </label>
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <input
              id="location"
              type="text"
              placeholder="Địa điểm..."
              value={filters.location}
              onChange={(e) => onLocationChange(e.target.value)}
              className="w-full rounded-lg border border-ink/15 bg-white pl-10 pr-4 py-2.5 font-body text-sm text-ink placeholder:text-ink/30 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>
      </div>

      {/* Salary range row */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Salary min */}
        <div className="sm:w-40">
          <label htmlFor="salaryMin" className="sr-only">
            Lương tối thiểu
          </label>
          <input
            id="salaryMin"
            type="number"
            placeholder="Lương từ (VND)"
            value={filters.salaryMin ?? ""}
            onChange={(e) => handleSalaryMinChange(e.target.value)}
            min="0"
            className="w-full rounded-lg border border-ink/15 bg-white px-4 py-2.5 font-body text-sm text-ink placeholder:text-ink/30 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {/* Salary max */}
        <div className="sm:w-40">
          <label htmlFor="salaryMax" className="sr-only">
            Lương tối đa
          </label>
          <input
            id="salaryMax"
            type="number"
            placeholder="Lương đến (VND)"
            value={filters.salaryMax ?? ""}
            onChange={(e) => handleSalaryMaxChange(e.target.value)}
            min="0"
            className="w-full rounded-lg border border-ink/15 bg-white px-4 py-2.5 font-body text-sm text-ink placeholder:text-ink/30 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>
    </div>
  );
}
