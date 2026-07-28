import type { SessionSummary as SessionSummaryData } from "../../utils/workoutStats";
import { IconCalendarCheck, IconFlame, IconLayoutGrid, IconTarget } from "../icons";

/** Volume / Est. Calories / Focus Muscles / Intensity for one selected
 * workout day, driven entirely by computeSessionSummary's real derived data. */
export function SessionSummary({ summary }: { summary: SessionSummaryData }) {
  return (
    <div className="session-summary">
      <div className="session-summary-title">Session Summary</div>
      <div className="session-summary-grid">
        <div className="session-summary-item">
          <span className="session-summary-icon tone-brand">
            <IconLayoutGrid />
          </span>
          <div>
            <div className="session-summary-label">Volume</div>
            <div className="session-summary-value">{summary.volume}</div>
          </div>
        </div>
        <div className="session-summary-item">
          <span className="session-summary-icon tone-workout">
            <IconFlame />
          </span>
          <div>
            <div className="session-summary-label">Est. Calories</div>
            <div className="session-summary-value">{summary.estCalories}</div>
          </div>
        </div>
        <div className="session-summary-item">
          <span className="session-summary-icon tone-meal">
            <IconTarget />
          </span>
          <div>
            <div className="session-summary-label">Focus Muscles</div>
            <div className="session-summary-value">{summary.focusMuscles}</div>
          </div>
        </div>
        <div className="session-summary-item">
          <span className="session-summary-icon tone-brand">
            <IconCalendarCheck />
          </span>
          <div>
            <div className="session-summary-label">Intensity</div>
            <div className="session-summary-value">{summary.intensity}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
