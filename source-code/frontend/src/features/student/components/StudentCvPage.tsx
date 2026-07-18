/**
 * Student CV Management Page – implements TSK-FE-ST-202.
 *
 * ═══════════════════════════════════════════════════════════════════
 * UI COMPONENT (Presentation Layer)
 * ═══════════════════════════════════════════════════════════════════
 *
 *   - ✅ Drag‑and‑drop PDF upload with progress state
 *   - ✅ Click‑to‑upload button
 *   - ✅ Loading / error handling
 *   - ✅ Empty state when no CVs exist
 *   - ✅ Informational banner when no default CV is set
 *   - ✅ List of CV items with “Set as Default” and “Delete” actions
 *   - ✅ Retry action on error
 *   - ✅ Success feedback
 *   - ❌ No direct API calls – uses service layer via hooks
 *   - ❌ No business logic – delegated to hooks / service
 */
import { useEffect } from "react";
import { useCvList } from "../hooks/useCvList";
import { useCvUpload } from "../hooks/useCvUpload";
import CvUploadZone from "./CvUploadZone";
import CvListItem from "./CvListItem";
import CvEmptyState from "./CvEmptyState";
import NoDefaultCvBanner from "./NoDefaultCvBanner";

export default function StudentCvPage() {
  const { data: cvList, isLoading, isError, error, refetch } = useCvList();
  const { isUploadSuccess, resetStatus } = useCvUpload();

  // Refetch CV list on mount to ensure fresh data.
  useEffect(() => {
    refetch();
  }, [refetch]);

  const hasDefault = cvList?.some((cv) => cv.isDefault) ?? false;

  return (
    <div className="min-h-screen bg-paper">
      <div className="mx-auto max-w-3xl px-4 py-8 md:px-6 md:py-12">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="font-display text-2xl font-semibold text-ink md:text-3xl">
            Quản lý CV
          </h1>
          <p className="mt-1 font-body text-sm text-ink/60">
            Tải lên, xem và quản lý các hồ sơ cá nhân của bạn.
          </p>
        </div>

        {/* Success feedback */}
        {isUploadSuccess && (
          <div
            className="mb-6 rounded-lg border border-primary/20 bg-primary-light px-4 py-3"
            role="alert"
          >
            <p className="font-body text-sm font-medium text-primary">
              Tải lên CV thành công!
            </p>
            <button
              onClick={resetStatus}
              className="mt-1 font-body text-xs text-primary/70 hover:text-primary"
            >
              Đóng
            </button>
          </div>
        )}

        {/* Error state with retry */}
        {isError && (
          <div
            className="mb-6 rounded-lg border border-danger/20 bg-danger-light px-4 py-3"
            role="alert"
          >
            <p className="font-body text-sm font-medium text-danger">
              {(error as Error).message ?? "Không thể tải danh sách CV."}
            </p>
            <button
              onClick={() => refetch()}
              className="mt-2 rounded-seal border border-danger px-4 py-1.5 font-body text-sm text-danger transition hover:bg-danger/10"
            >
              Thử lại
            </button>
          </div>
        )}

        {/* Informational banner when no default CV */}
        {!hasDefault && cvList && cvList.length > 0 && (
          <NoDefaultCvBanner
            action={
              <button className="rounded-seal bg-primary px-4 py-1.5 font-body text-sm text-white hover:bg-primary-dark">
                Đặt mặc định
              </button>
            }
          />
        )}

        {/* Upload zone */}
        <CvUploadZone />

        {/* Loading state */}
        {isLoading && (
          <div className="mt-6 space-y-4">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="rounded-card bg-white p-4 shadow-card ring-1 ring-ink/5"
              >
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="h-4 w-48 animate-pulse rounded bg-sage/50" />
                    <div className="h-3 w-32 animate-pulse rounded bg-sage/30" />
                  </div>
                  <div className="flex gap-3">
                    <div className="h-9 w-32 animate-pulse rounded bg-sage/50" />
                    <div className="h-9 w-16 animate-pulse rounded bg-sage/50" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CV list or empty state */}
        {!isLoading && cvList && cvList.length > 0 ? (
          <div className="mt-6 space-y-4">
            {cvList.map((cv) => (
              <CvListItem key={cv.id} cv={cv} />
            ))}
          </div>
        ) : (
          !isLoading &&
          !isError && (
            <CvEmptyState
              action={
                <button className="rounded-seal bg-primary px-6 py-2.5 font-body text-white hover:bg-primary-dark">
                  Tải lên CV
                </button>
              }
            />
          )
        )}
      </div>
    </div>
  );
}
