import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { apiClient } from "../services/apiClient";
import type { MealPlanContent, Plan, WorkoutPlanContent } from "../types";
import { LoadingState } from "../components/LoadingState";
import { StatusAlert } from "../components/StatusAlert";
import { InfoNotice } from "../components/plan/InfoNotice";
import { MealCard } from "../components/plan/MealCard";
import { PlanPageHeader } from "../components/plan/PlanPageHeader";
import { WorkoutCard } from "../components/plan/WorkoutCard";
import { IconDumbbell, IconSalad, IconTrash } from "../components/icons";
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
      <div className="container ff-page ff-page-wide">
        <StatusAlert variant="danger">{error}</StatusAlert>
        <Link to="/dashboard">Back to dashboard</Link>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="container ff-page ff-page-wide">
        <LoadingState label="Loading plan..." />
      </div>
    );
  }

  const isWorkout = plan.type === "workout";

  return (
    <div className="container ff-page ff-page-wide">
      <PlanPageHeader
        eyebrow={
          <>
            {isWorkout ? <IconDumbbell /> : <IconSalad />}
            {isWorkout ? "Workout plan" : "Meal plan"}
          </>
        }
        title={isWorkout ? "Your Workout Plan" : "Your Meal Plan"}
        subtitle={`Saved ${formatDateTime(plan.createdAt)}`}
        actions={
          <button className="btn btn-outline-ff-danger btn-sm" onClick={handleDelete}>
            <IconTrash />
            Delete
          </button>
        }
      />

      {isWorkout ? (
        <WorkoutPlanView content={plan.content as WorkoutPlanContent} />
      ) : (
        <MealPlanView content={plan.content as MealPlanContent} />
      )}
    </div>
  );
}

function WorkoutPlanView({ content }: { content: WorkoutPlanContent }) {
  return (
    <>
      <InfoNotice>
        <p>{content.summary}</p>
        {content.progressionGuidance && (
          <p className="text-muted small mb-0">{content.progressionGuidance}</p>
        )}
      </InfoNotice>
      <div className="plan-card-list">
        {content.weeklySchedule.map((day, index) => (
          <WorkoutCard key={`${day.day}-${index}`} day={day} style={{ animationDelay: `${index * 60}ms` }} />
        ))}
      </div>
    </>
  );
}

function MealPlanView({ content }: { content: MealPlanContent }) {
  return (
    <>
      <InfoNotice>
        <p>{content.summary}</p>
      </InfoNotice>
      <div className="plan-card-list">
        {content.dailyMeals.map((meal, index) => (
          <MealCard key={`${meal.meal}-${index}`} meal={meal} style={{ animationDelay: `${index * 60}ms` }} />
        ))}
      </div>
    </>
  );
}
