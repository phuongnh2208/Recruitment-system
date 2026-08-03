/**
 * PDF Viewer – renders a CV PDF using the browser's native PDF viewer.
 *
 * ═══════════════════════════════════════════════════════════════════
 * UI COMPONENT
 * ═══════════════════════════════════════════════════════════════════
 *
 *   - ✅ Uses browser PDF viewer via iframe
 *   - ✅ Handles missing CV URL gracefully
 *   - ✅ Follows design.md card pattern
 *   - ❌ No custom PDF rendering
 *   - ❌ No business logic
 */
import { useEffect, useState } from "react";
import { axiosInstance } from "../../../core/api/axios";

export interface PdfViewerProps {
  /** URL to the PDF file to display. */
  pdfUrl?: string | null;
  /** Applicant name for the fallback message. */
  applicantName?: string;
}

export default function PdfViewer({ pdfUrl, applicantName }: PdfViewerProps) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    setBlobUrl(null);
    setError(false);
    if (!pdfUrl) return;

    let objectUrl: string | null = null;
    axiosInstance
      .get(pdfUrl, { responseType: "blob" })
      .then((response) => {
        objectUrl = URL.createObjectURL(response.data);
        setBlobUrl(objectUrl);
      })
      .catch(() => setError(true));

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [pdfUrl]);

  if (!pdfUrl || error) {
    return (
      <div className="rounded-card bg-white p-6 shadow-card ring-1 ring-ink/5">
        <h2 className="font-display text-lg font-semibold text-ink">
          CV ứng viên
        </h2>
        <div className="flex flex-col items-center py-8 text-center">
          <svg
            className="h-12 w-12 text-ink/20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
          </svg>
          <p className="mt-4 font-body text-sm text-ink/50">
            {error
              ? "Không thể tải CV. Vui lòng thử lại."
              : applicantName
                ? `${applicantName} chưa tải lên CV.`
                : "CV không khả dụng."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-card bg-white shadow-card ring-1 ring-ink/5 overflow-hidden">
      <div className="flex items-center justify-between border-b border-sage/50 px-6 py-4">
        <h2 className="font-display text-lg font-semibold text-ink">
          CV ứng viên
        </h2>
        {blobUrl && (
          <a
            href={blobUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-seal bg-primary px-4 py-1.5 font-body text-sm font-medium text-white transition hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            Mở trong tab mới
          </a>
        )}
      </div>
      <div className="h-[600px] w-full">
        {blobUrl ? (
          <iframe
            src={blobUrl}
            title="CV PDF"
            className="h-full w-full border-0"
            sandbox="allow-scripts allow-same-origin"
          />
        ) : (
          <div className="flex h-full items-center justify-center font-body text-sm text-ink/50">
            Đang tải CV...
          </div>
        )}
      </div>
    </div>
  );
}
