/**
 * Pagination component for application history.
 *
 * ═══════════════════════════════════════════════════════════════════
 * UI COMPONENT
 * ═══════════════════════════════════════════════════════════════════
 *
 *   - ✅ Server-side pagination controls
 *   - ✅ Previous/Next buttons
 *   - ✅ Page numbers with ellipsis
 *   - ✅ Follows design.md button patterns
 *   - ❌ Business logic – parent controls page state
 */

export interface ApplicationHistoryPaginationProps {
  /** Current page number (1-based). */
  currentPage: number;
  /** Total number of pages. */
  totalPages: number;
  /** Total number of items. */
  totalItems: number;
  /** Items per page. */
  pageSize: number;
  /** Callback when page changes. */
  onPageChange: (page: number) => void;
  /** Whether a page change is in progress. */
  isLoading?: boolean;
}

/** Generate page numbers with ellipsis for display. */
function getPageNumbers(
  currentPage: number,
  totalPages: number,
): (number | "ellipsis")[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages: (number | "ellipsis")[] = [1];

  if (currentPage > 3) {
    pages.push("ellipsis");
  }

  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (currentPage < totalPages - 2) {
    pages.push("ellipsis");
  }

  pages.push(totalPages);

  return pages;
}

export default function ApplicationHistoryPagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  isLoading = false,
}: ApplicationHistoryPaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const pageNumbers = getPageNumbers(currentPage, totalPages);
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      {/* Page info */}
      <div className="font-body text-sm text-ink/60">
        Hiển thị <span className="font-medium">{startItem}</span>–{" "}
        <span className="font-medium">{endItem}</span> của{" "}
        <span className="font-medium">{totalItems}</span> kết quả
      </div>

      {/* Pagination controls */}
      <nav
        className="flex items-center gap-1"
        aria-label="Phân trang lịch sử ứng tuyển"
      >
        {/* Previous button */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1 || isLoading}
          className="rounded-seal border border-ink/15 px-3 py-1.5 font-body text-sm text-ink/70 transition hover:bg-sage/50 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent"
          aria-label="Trang trước"
        >
          <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M15 18L9 12L15 6" />
          </svg>
        </button>

        {/* Page numbers */}
        <div className="flex items-center gap-1">
          {pageNumbers.map((page, index) =>
            page === "ellipsis" ? (
              <span
                key={`ellipsis-${index}`}
                className="px-2 font-body text-sm text-ink/40"
              >
                ...
              </span>
            ) : (
              <button
                key={page}
                type="button"
                onClick={() => onPageChange(page)}
                disabled={isLoading}
                className={`rounded-seal px-3 py-1.5 font-body text-sm transition ${
                  page === currentPage
                    ? "bg-primary text-white shadow-card"
                    : "text-ink/70 hover:bg-sage/50"
                } disabled:cursor-not-allowed disabled:opacity-50`}
                aria-label={`Trang ${page}`}
                aria-current={page === currentPage ? "page" : undefined}
              >
                {page}
              </button>
            ),
          )}
        </div>

        {/* Next button */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages || isLoading}
          className="rounded-seal border border-ink/15 px-3 py-1.5 font-body text-sm text-ink/70 transition hover:bg-sage/50 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent"
          aria-label="Trang sau"
        >
          <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M9 6L15 12L9 18" />
          </svg>
        </button>
      </nav>
    </div>
  );
}
