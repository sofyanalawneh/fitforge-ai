import type { ReactNode } from "react";

export interface PlanStatBarItem {
  icon: ReactNode;
  label: string;
  value: string;
}

/** Dark stat strip shared by the workout and meal pages, each with different
 * content. Reuses the same dark-gradient visual language as InfoNotice. */
export function PlanStatsBar({ items }: { items: PlanStatBarItem[] }) {
  return (
    <div className="plan-stats-bar">
      {items.map((item) => (
        <div className="plan-stats-bar-item" key={item.label}>
          <span className="plan-stats-bar-icon">{item.icon}</span>
          <div>
            <div className="plan-stats-bar-label">{item.label}</div>
            <div className="plan-stats-bar-value">{item.value}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
