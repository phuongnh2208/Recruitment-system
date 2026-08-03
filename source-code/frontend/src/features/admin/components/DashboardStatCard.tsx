/**
 * Dashboard statistic card component.
 *
 * ═══════════════════════════════════════════════════════════════════
 * UI COMPONENT
 * ═══════════════════════════════════════════════════════════════════
 *
 *   - ✅ Displays a single KPI statistic with label and value
 *   - ✅ Uses font-mono for numeric values per design.md
 *   - ✅ Responsive layout
 *   - ❌ No business logic
 */

interface DashboardStatCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
}

export default function DashboardStatCard({
  label,
  value,
  icon,
}: DashboardStatCardProps) {
  return (
    <div
      className="rounded-card bg-white p-6 shadow-card ring-1 ring-ink/5 transition hover:shadow-raised"
      role="region"
      aria-label={label}
    >
      <div className="flex items-center gap-4">
        <div
          className="flex h-12 w-12 items-center justify-center rounded-seal bg-primary-light text-primary"
          aria-hidden="true"
        >
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-body text-sm text-ink/60">{label}</p>
          <p className="font-mono text-2xl font-medium text-ink">
            {(value ?? 0).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}
