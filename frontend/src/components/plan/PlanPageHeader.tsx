import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { IconChevronLeft } from "../icons";

interface PlanPageHeaderProps {
  /** Small orange uppercase label, e.g. an icon + "Workout plan". */
  eyebrow: ReactNode;
  title: string;
  subtitle?: ReactNode;
  /** Extra actions (e.g. Delete) rendered before the Back to dashboard button. */
  actions?: ReactNode;
}

/** Shared header for the meal/workout plan detail pages: eyebrow, title,
 * subtitle on the left; a "Back to dashboard" button (plus any extra
 * actions) at the top-right on desktop, stacking below on mobile. */
export function PlanPageHeader({ eyebrow, title, subtitle, actions }: PlanPageHeaderProps) {
  return (
    <div className="plan-page-header">
      <div>
        <span className="ff-eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      <div className="plan-page-header-actions">
        {actions}
        <Link to="/dashboard" className="btn btn-outline-dark btn-sm d-inline-flex align-items-center gap-1">
          <IconChevronLeft width={16} height={16} />
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
