import { Link } from "react-router-dom";
import { StatusAlert } from "../StatusAlert";
import { IconArrowRight } from "../icons";

interface PlanSavedBannerProps {
  generateLabel: string;
  onGenerateAnother: () => void;
}

/** Shared post-save UI for both generation pages: a success banner with a
 * subtle "View Dashboard" link on the right, plus exactly one primary action
 * below it to generate another version. Replaces the previous large "Go to
 * Dashboard" CTA so the generated plan stays the visual focus. */
export function PlanSavedBanner({ generateLabel, onGenerateAnother }: PlanSavedBannerProps) {
  return (
    <>
      <StatusAlert variant="success">
        <div className="plan-saved-banner-row">
          <span>Plan saved to your dashboard.</span>
          <Link to="/dashboard" className="plan-saved-banner-link">
            View Dashboard
            <IconArrowRight width={14} height={14} />
          </Link>
        </div>
      </StatusAlert>
      <button type="button" className="btn btn-brand" onClick={onGenerateAnother}>
        {generateLabel}
      </button>
    </>
  );
}
