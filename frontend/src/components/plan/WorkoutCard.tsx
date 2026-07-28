import type { CSSProperties } from "react";
import type { WorkoutDay } from "../../types";
import { getWorkoutFocusVisual, type WorkoutIconKey } from "../../utils/planImages";
import { PlanImage } from "../PlanImage";
import { IconDumbbell, IconShieldCheck, IconTarget } from "../icons";
import { PlanCard } from "./PlanCard";

const FOCUS_ICONS: Record<WorkoutIconKey, typeof IconDumbbell> = {
  dumbbell: IconDumbbell,
  core: IconTarget,
  rest: IconShieldCheck,
};

function WorkoutCardVisual({ focus }: { focus: string }) {
  const visual = getWorkoutFocusVisual(focus);
  if (visual.kind === "image") {
    return <PlanImage src={visual.src} alt={focus} variant="plan" />;
  }
  const Icon = FOCUS_ICONS[visual.icon];
  return (
    <div className="plan-visual-icon-panel" role="img" aria-label={focus}>
      <Icon />
    </div>
  );
}

interface WorkoutCardProps {
  day: WorkoutDay;
  style?: CSSProperties;
}

export function WorkoutCard({ day, style }: WorkoutCardProps) {
  return (
    <PlanCard accent="workout" style={style} visual={<WorkoutCardVisual focus={day.focus} />}>
      <span className="plan-card-eyebrow">{day.day}</span>
      <h3 className="plan-card-title">{day.focus}</h3>
      <ul className="plan-card-exercise-list">
        {day.exercises.map((exercise, index) => (
          <li key={`${exercise.name}-${index}`} className="plan-card-exercise">
            <div className="plan-card-exercise-main">
              <span className="plan-card-exercise-name">{exercise.name}</span>
              <span className="plan-card-exercise-volume">
                {exercise.sets} {exercise.sets === 1 ? "set" : "sets"} × {exercise.reps}
                {exercise.rest && ` · ${exercise.rest} rest`}
                {exercise.duration && ` · ${exercise.duration}`}
              </span>
            </div>
            {exercise.notes && <p className="plan-card-exercise-notes">{exercise.notes}</p>}
          </li>
        ))}
      </ul>
    </PlanCard>
  );
}
