interface PlanStatProps {
  label: string;
  value: string | number;
}

/** Compact labeled stat used for nutrition figures (calories/protein/carbs/fat)
 * and any other small per-card metric. */
export function PlanStat({ label, value }: PlanStatProps) {
  return (
    <div className="plan-stat">
      <span className="plan-stat-value">{value}</span>
      <span className="plan-stat-label">{label}</span>
    </div>
  );
}
