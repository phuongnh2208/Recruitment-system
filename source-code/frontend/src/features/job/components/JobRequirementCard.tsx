/**
 * Job Requirement Card – displays the job requirements section.
 *
 * ═══════════════════════════════════════════════════════════════════
 * UI COMPONENT
 * ═══════════════════════════════════════════════════════════════════
 *
 *   - ✅ Shows job requirements with proper formatting
 *   - ✅ Follows design.md card patterns
 */

export interface JobRequirementCardProps {
  /** Job requirements text (can contain line breaks). */
  requirements: string;
}

export default function JobRequirementCard({
  requirements,
}: JobRequirementCardProps) {
  return (
    <div className="rounded-card bg-white p-6 shadow-card ring-1 ring-ink/5">
      <h2 className="font-display font-semibold text-xl text-ink">
        Yêu cầu công việc
      </h2>
      <div className="mt-4 font-body text-base text-ink/80 leading-relaxed whitespace-pre-wrap">
        {requirements}
      </div>
    </div>
  );
}
