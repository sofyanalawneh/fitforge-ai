import type { CSSProperties, ReactNode } from "react";

interface PlanCardProps {
  /** Left-side (desktop) / top (mobile) visual — an image or icon panel. */
  visual: ReactNode;
  accent: "workout" | "meal";
  children: ReactNode;
  style?: CSSProperties;
}

/** Shared horizontal card foundation for MealCard and WorkoutCard: a visual
 * area plus a content area, laid out side by side on desktop and stacked on
 * mobile. Built on the existing `.card-ff` shell so radius/border/shadow and
 * the workout/meal accent border match every other card in the app. */
export function PlanCard({ visual, accent, children, style }: PlanCardProps) {
  return (
    <div className={`plan-card card-ff card-ff-interactive accent-${accent} ff-animate-in`} style={style}>
      <div className="plan-card-visual">{visual}</div>
      <div className="plan-card-content">{children}</div>
    </div>
  );
}
