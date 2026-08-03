/**
 * CV Upload Zone component – supports drag‑and‑drop and click‑to‑upload.
 *
 * ═══════════════════════════════════════════════════════════════════
 * UI COMPONENT
 * ═══════════════════════════════════════════════════════════════════
 *
 *   - ✅ Drag‑and‑drop area with visual feedback
 *   - ✅ Clickable button to open file picker
 *   - ✅ Shows upload progress bar
 *   - ✅ Displays validation and upload error messages
 *   - ❌ Business logic – delegated to useCvUpload hook
 *   - ❌ Direct API calls
 */
import { useRef } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useCvUpload } from "../hooks/useCvUpload";

export default function CvUploadZone() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    uploadProgress,
    validationError,
    isUploading,
    isUploadSuccess,
    uploadError,
    handleFileSelect,
    resetStatus,
  } = useCvUpload();

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="mb-6">
      {/* ── Upload banner ───────────────────────────────────── */}
      {isUploadSuccess && (
        <div
          className="mb-4 rounded-lg border border-primary/20 bg-primary-light px-4 py-3"
          role="alert"
        >
          <div className="flex items-center justify-between">
            <p className="font-body text-sm font-medium text-primary">
              Tải lên CV thành công.
            </p>
            <button
              type="button"
              onClick={resetStatus}
              className="ml-2 font-body text-sm text-primary hover:text-primary-dark"
              aria-label="Đóng thông báo"
            >
              <XMarkIcon className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}
      {validationError && (
        <div
          className="mb-4 rounded-lg border border-danger/20 bg-danger-light px-4 py-3"
          role="alert"
        >
          <p className="font-body text-sm text-danger">{validationError}</p>
        </div>
      )}
      {uploadError && (
        <div
          className="mb-4 rounded-lg border border-danger/20 bg-danger-light px-4 py-3"
          role="alert"
        >
          <p className="font-body text-sm text-danger">{uploadError}</p>
        </div>
      )}

      {/* ── Drag‑and‑drop area ─────────────────────────────────── */}
      <div
        className={`
          relative rounded-card border border-ink/15 bg-white p-8 text-center
          transition duration-150 ease-out
          ${isUploading ? "opacity-60 cursor-not-allowed" : "hover:border-primary hover:shadow-raised"}
        `}
        onDrop={onDrop}
        onDragOver={onDragOver}
        role="button"
        tabIndex={0}
        aria-label="Khu vực tải lên CV. Nhấn để chọn tệp PDF."
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openFilePicker();
          }
        }}
      >
        <input
          type="file"
          accept="application/pdf"
          ref={fileInputRef}
          className="hidden"
          onChange={onFileChange}
          aria-hidden="true"
        />
        <button
          type="button"
          onClick={openFilePicker}
          disabled={isUploading}
          className="rounded-seal bg-primary px-6 py-2.5 font-body font-medium text-white shadow-card transition duration-150 ease-out hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-sage disabled:text-ink/40"
        >
          {isUploading
            ? `Đang tải lên (${uploadProgress ?? 0}%)`
            : "Chọn CV (PDF)"}
        </button>
        <p className="mt-2 font-body text-sm text-ink/60">
          Kéo và thả tệp PDF vào đây hoặc nhấn nút để chọn.
        </p>
      </div>
    </div>
  );
}
