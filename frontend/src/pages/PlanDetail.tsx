import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { apiClient } from "../services/apiClient";
import type { MealPlanContent, Plan, WorkoutPlanContent } from "../types";
import { LoadingState } from "../components/LoadingState";
import { PlanImage } from "../components/PlanImage";
import { StatusAlert } from "../components/StatusAlert";
import { PlanTypeBadge } from "../components/PlanTypeBadge";
import { IconChevronLeft, IconTrash } from "../components/icons";
import { formatDateTime } from "../utils/format";
import { MEAL_PLACEHOLDER, getExerciseImage, getMealImage, getWorkoutCoverImage } from "../utils/planImages";

export function PlanDetail() {
  const { planId } = useParams<{ planId: string }>();
  const navigate = useNavigate();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiClient
      .get<{ plan: Plan }>(`/api/plans/${planId}`)
      .then(({ plan }) => setPlan(plan))
      .catch(() => setError("This plan could not be found."));
  }, [planId]);

  async function handleDelete() {
    if (!planId) return;
    try {
      await apiClient.delete(`/api/plans/${planId}`);
      navigate("/dashboard");
    } catch {
      setError("Could not delete this plan. Please try again.");
    }
  }

  if (error) {
    return (
      <div className="container ff-page ff-page-medium">
        <StatusAlert variant="danger">{error}</StatusAlert>
        <Link to="/dashboard">Back to dashboard</Link>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="container ff-page ff-page-medium">
        <LoadingState label="Loading plan..." />
      </div>
    );
  }

  return (
    <div className="container ff-page ff-page-medium">
      <div className="d-flex justify-content-between align-items-start mb-2">
        <div>
          <PlanTypeBadge type={plan.type} />
          <h1 className="h3 mt-2 mb-1">{plan.type === "workout" ? "Workout Plan" : "Meal Plan"}</h1>
          <p className="text-muted mb-0">Saved {formatDateTime(plan.createdAt)}</p>
        </div>
        <button className="btn btn-outline-ff-danger btn-sm" onClick={handleDelete}>
          <IconTrash />
          Delete
        </button>
      </div>

      <div className="card-ff mt-3 ff-animate-in">
        <div className="card-ff-body">
          {plan.type === "workout" ? (
            <WorkoutDetail content={plan.content as WorkoutPlanContent} />
          ) : (
            <MealDetail content={plan.content as MealPlanContent} />
          )}
        </div>
      </div>

      <Link to="/dashboard" className="d-inline-flex align-items-center gap-1 mt-3">
        <IconChevronLeft width={16} height={16} />
        Back to dashboard
      </Link>
    </div>
  );
}

function WorkoutDetail({ content }: { content: WorkoutPlanContent }) {
  const [selected, setSelected] = useState({ dayIndex: 0, exerciseIndex: 0 });
  const selectedDay = content.weeklySchedule[selected.dayIndex];
  const selectedExercise = selectedDay?.exercises[selected.exerciseIndex];

  return (
    <>
      <PlanImage
        src={
          selectedExercise
            ? getExerciseImage(selectedExercise.name)
            : getWorkoutCoverImage(content.summary)
        }
        alt={selectedExercise?.name ?? "Workout plan cover"}
        variant="cover"
        priority
      />
      {selectedExercise && selectedDay && (
        <div className="mb-3">
          <span className="exercise-name">{selectedExercise.name}</span>
          <span className="text-muted small ms-2">
            {selectedDay.day} · {selectedDay.focus}
          </span>
          <div className="exercise-volume mt-1">
            {selectedExercise.sets} {selectedExercise.sets === 1 ? "set" : "sets"} × {selectedExercise.reps}
            {selectedExercise.rest && ` · ${selectedExercise.rest} rest`}
          </div>
          {selectedExercise.notes && (
            <div className="text-muted small mt-1">{selectedExercise.notes}</div>
          )}
        </div>
      )}
      <div className="plan-summary-banner">
        <p>{content.summary}</p>
        {content.progressionGuidance && (
          <p className="text-muted small mb-0">{content.progressionGuidance}</p>
        )}
      </div>
      {content.weeklySchedule.map((day, dayIndex) => (
        <div
          key={day.day}
          className="plan-day-card ff-animate-in"
          style={{ animationDelay: `${dayIndex * 60}ms` }}
        >
          <h5>
            {day.day} — {day.focus}
          </h5>
          {day.exercises.map((exercise, exerciseIndex) => {
            const isSelected = dayIndex === selected.dayIndex && exerciseIndex === selected.exerciseIndex;
            return (
              <button
                type="button"
                key={exercise.name + exerciseIndex}
                className={`plan-exercise-row${isSelected ? " is-selected" : ""}`}
                aria-pressed={isSelected}
                onClick={() => setSelected({ dayIndex, exerciseIndex })}
              >
                <div className="d-flex align-items-center gap-2">
                  <PlanImage src={getExerciseImage(exercise.name)} alt={exercise.name} variant="thumb" />
                  <span className="exercise-name">{exercise.name}</span>
                </div>
                <span className="exercise-volume">
                  {exercise.sets} {exercise.sets === 1 ? "set" : "sets"} × {exercise.reps}
                  {exercise.rest && ` · ${exercise.rest} rest`}
                </span>
              </button>
            );
          })}
        </div>
      ))}
    </>
  );
}

function MealDetail({ content }: { content: MealPlanContent }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedMeal = content.dailyMeals[selectedIndex];

  return (
    <>
      <PlanImage
        src={getMealImage(selectedMeal ?? content.dailyMeals[0])}
        alt={selectedMeal?.meal ?? "Meal plan cover"}
        variant="cover"
        fallbackSrc={MEAL_PLACEHOLDER}
        priority
      />
      {selectedMeal && (
        <div className="mb-3">
          <span className="meal-label">{selectedMeal.meal}</span>
          <div>{selectedMeal.description}</div>
          {selectedMeal.notes && <div className="text-muted small mt-1">{selectedMeal.notes}</div>}
        </div>
      )}
      <div className="plan-summary-banner">
        <p>{content.summary}</p>
      </div>
      {content.dailyMeals.map((meal, index) => (
        <button
          type="button"
          key={`${meal.meal}-${index}`}
          className={`meal-entry ff-animate-in${index === selectedIndex ? " is-selected" : ""}`}
          style={{ animationDelay: `${index * 60}ms` }}
          aria-pressed={index === selectedIndex}
          onClick={() => setSelectedIndex(index)}
        >
          <div className="d-flex align-items-start gap-2">
            <PlanImage src={getMealImage(meal)} alt={meal.meal} variant="thumb" fallbackSrc={MEAL_PLACEHOLDER} />
            <div>
              <span className="meal-label">{meal.meal}</span>
              {meal.description}
              {meal.notes && <div className="text-muted small mt-1">{meal.notes}</div>}
            </div>
          </div>
        </button>
      ))}
    </>
  );
}
