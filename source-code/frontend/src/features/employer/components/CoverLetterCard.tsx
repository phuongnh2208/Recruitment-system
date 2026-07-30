/**
 * Cover Letter Card – displays the applicant's cover letter content.
 *
 * ═══════════════════════════════════════════════════════════════════
 * UI COMPONENT
 * ═══════════════════════════════════════════════════════════════════
 *
 *   - ✅ Shows cover letter content with proper typography
 *   - ✅ Handles empty/missing cover letter gracefully
 *   - ✅ Follows design.md card pattern
 *   - ❌ No business logic
 */

export interface CoverLetterCardProps {
  /** Cover letter content. */
  coverLetter?: string | null;
}

export default function CoverLetterCard({ coverLetter }: CoverLetterCardProps) {
  return (
    <div className="rounded-card bg-white p-6 shadow-card ring-1 ring-ink/5">
      <h2 className="font-display text-lg font-semibold text-ink">
        Thư giới thiệu
      </h2>

      <div className="mt-4">
        {coverLetter ? (
          <div className="prose prose-sm max-w-none font-body text-ink/80 leading-relaxed whitespace-pre-wrap">
            {coverLetter}
          </div>
        ) : (
          <div className="flex flex-col items-center py-8 text-center">
            <svg
              className="h-10 w-10 text-ink/20"
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
              Ứng viên không có thư giới thiệu
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
