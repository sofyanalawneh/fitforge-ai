import type { CSSProperties } from "react";
import type { WorkoutDay } from "../../types";
import { getExerciseInfo } from "../../utils/exerciseInfo";
import { getWorkoutDayImages, getWorkoutFocusVisual, type WorkoutIconKey } from "../../utils/planImages";
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
  const images = getWorkoutDayImages(day);

  return (
    <PlanCard accent="workout" style={style} visual={<WorkoutCardVisual focus={day.focus} />}>
      <span className="plan-card-eyebrow">{day.day}</span>
      <h3 className="plan-card-title">{day.focus}</h3>
      <ul className="workout-exercise-list">
        {day.exercises.map((exercise, index) => {
          const info = getExerciseInfo(exercise.name);
          return (
            <li key={`${exercise.name}-${index}`} className="workout-exercise-row">
              <span className="workout-exercise-badge">{index + 1}</span>
              <PlanImage
                src={images[index]}
                alt={exercise.name}
                variant="thumb"
                className="workout-exercise-thumb"
              />
              <div className="workout-exercise-info">
                <span className="workout-exercise-name">{exercise.name}</span>
                <p className="workout-exercise-description">{info.description}</p>
                <span className="workout-exercise-muscles">
                  <span className="workout-exercise-muscles-dot" aria-hidden="true" />
                  {info.targetMuscles.join(", ")}
                </span>
              </div>
              <div className="workout-exercise-volume-box">
                <span className="workout-exercise-volume-main">
                  {exercise.sets} {exercise.sets === 1 ? "set" : "sets"} × {exercise.reps}
                </span>
                {exercise.rest && <span className="workout-exercise-rest">Rest: {exercise.rest}</span>}
                {exercise.duration && <span className="workout-exercise-rest">{exercise.duration}</span>}
              </div>
            </li>
          );
        })}
      </ul>
    </PlanCard>
  );
}
