/**
 * CV List Item – displays a single CV entry with actions.
 *
 * ═══════════════════════════════════════════════════════════════════
 * UI COMPONENT
 * ═══════════════════════════════════════════════════════════════════
 *
 *   - ✅ Shows file name, size, upload date
 *   - ✅ Displays “Default” badge when applicable
 *   - ✅ “Set as Default” button (disabled if already default)
 *   - ✅ “Delete” button with confirmation
 *   - ❌ Business logic – delegated to useDeleteCv / useSetDefaultCv hooks
 *   - ❌ Direct API calls
 */
import { useSetDefaultCv, useDeleteCv } from "../hooks/useCvList";

export interface CvListItemProps {
  /** CV metadata to display. */
  cv: import("../types/cv.types").CVMetadata;
}

/** Helper to format file size in a human‑readable way. */
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(1)} MB`;
}

/** CV list item component. */
export default function CvListItem({ cv }: CvListItemProps) {
  const { mutate: deleteMutate, isPending: isDeleting } = useDeleteCv();
  const { mutate: setDefaultMutate, isPending: isSettingDefault } =
    useSetDefaultCv();

  const handleDelete = () => {
    // Simple confirmation – can be replaced with a modal later.
    if (window.confirm("Bạn có chắc muốn xóa CV này?")) {
      deleteMutate(cv.id);
    }
  };

  const handleSetDefault = () => {
    setDefaultMutate(cv.id);
  };

  return (
    <div className="rounded-card bg-white p-4 shadow-card ring-1 ring-ink/5 flex items-center justify-between">
      {/* Left side – file info */}
      <div className="flex flex-col">
        <span className="font-body text-sm font-medium text-ink">
          {cv.fileName}
        </span>
        <span className="font-body text-xs text-ink/60">
          {formatFileSize(cv.fileSize)} •{" "}
          {new Date(cv.uploadedAt).toLocaleDateString()}
        </span>
      </div>

      {/* Right side – actions */}
      <div className="flex items-center gap-3">
        {cv.isDefault && (
          <span className="inline-flex items-center gap-1 rounded-seal bg-accent-light px-3 py-1 font-mono text-xs font-medium text-accent ring-1 ring-accent/30">
            Mặc định
          </span>
        )}
        <button
          type="button"
          onClick={handleSetDefault}
          disabled={cv.isDefault || isSettingDefault}
          className="rounded-seal bg-primary px-4 py-1.5 font-body text-sm text-white shadow-card transition duration-150 ease-out hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-sage disabled:text-ink/40"
        >
          {isSettingDefault ? "Đang cập nhật..." : "Đặt làm mặc định"}
        </button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={isDeleting}
          className="rounded-seal border border-danger px-4 py-1.5 font-body text-sm text-danger transition duration-150 ease-out hover:bg-danger-light focus:outline-none focus:ring-2 focus:ring-danger/20 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          aria-label={`Xóa CV ${cv.fileName}`}
        >
          {isDeleting ? "Đang xóa..." : "Xóa"}
        </button>
      </div>
    </div>
  );
}
