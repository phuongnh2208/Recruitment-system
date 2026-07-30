/**
 * Job Description Card – displays the job description section.
 *
 * ═══════════════════════════════════════════════════════════════════
 * UI COMPONENT
 * ═══════════════════════════════════════════════════════════════════
 *
 *   - ✅ Shows job description with proper formatting
 *   - ✅ Follows design.md card patterns
 */

export interface JobDescriptionCardProps {
  /** Job description text (can contain line breaks). */
  description: string;
}

export default function JobDescriptionCard({
  description,
}: JobDescriptionCardProps) {
  return (
    <div className="rounded-card bg-white p-6 shadow-card ring-1 ring-ink/5">
      <h2 className="font-display font-semibold text-xl text-ink">
        Mô tả công việc
      </h2>
      <div className="mt-4 font-body text-base text-ink/80 leading-relaxed whitespace-pre-wrap">
        {description}
      </div>
    </div>
  );
}
