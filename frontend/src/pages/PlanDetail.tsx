import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { apiClient } from "../services/apiClient";
import type { MealPlanContent, Plan, WorkoutPlanContent } from "../types";
import { LoadingState } from "../components/LoadingState";
import { StatusAlert } from "../components/StatusAlert";
import { PlanTypeBadge } from "../components/PlanTypeBadge";
import { IconChevronLeft, IconTrash } from "../components/icons";
import { formatDateTime } from "../utils/format";

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
  return (
    <>
      <div className="plan-summary-banner">
        <p>{content.summary}</p>
      </div>
      {content.weeklySchedule.map((day, index) => (
        <div
          key={day.day}
          className="plan-day-card ff-animate-in"
          style={{ animationDelay: `${index * 60}ms` }}
        >
          <h5>
            {day.day} — {day.focus}
          </h5>
          {day.exercises.map((exercise) => (
            <div key={exercise.name} className="plan-exercise-row">
              <span className="exercise-name">{exercise.name}</span>
              <span className="exercise-volume">
                {exercise.sets} sets × {exercise.reps} reps
              </span>
            </div>
          ))}
        </div>
      ))}
    </>
  );
}

function MealDetail({ content }: { content: MealPlanContent }) {
  return (
    <>
      <div className="plan-summary-banner">
        <p>{content.summary}</p>
      </div>
      {content.dailyMeals.map((meal, index) => (
        <div
          key={meal.meal}
          className="meal-entry ff-animate-in"
          style={{ animationDelay: `${index * 60}ms` }}
        >
          <span className="meal-label">{meal.meal}</span>
          {meal.description}
          {meal.notes && <div className="text-muted small mt-1">{meal.notes}</div>}
        </div>
      ))}
    </>
  );
}
