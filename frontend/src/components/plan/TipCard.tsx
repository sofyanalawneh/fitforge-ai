import type { ReactNode } from "react";
import { IconSparkle } from "../icons";

interface TipCardProps {
  tone?: "workout" | "meal";
  children: ReactNode;
}

/** Generic tip banner, reused for the workout progression tip (blue tone)
 * and the meal hydration/sleep tip (green tone). */
export function TipCard({ tone = "workout", children }: TipCardProps) {
  return (
    <div className={`tip-card tone-${tone}`}>
      <span className="tip-card-icon">
        <IconSparkle />
      </span>
      <p>{children}</p>
    </div>
  );
}
