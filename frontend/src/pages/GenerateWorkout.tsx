import { useState } from "react";
import { ApiError, apiClient } from "../services/apiClient";
import type { WorkoutPlanContent } from "../types";
import { LoadingState } from "../components/LoadingState";
import { PlanImage } from "../components/PlanImage";
import { StatusAlert } from "../components/StatusAlert";
import { IconDumbbell } from "../components/icons";
import { getExerciseImage, getWorkoutCoverImage } from "../utils/planImages";

type Status = "idle" | "loading" | "error" | "profile_incomplete" | "ready" | "saved";

export function GenerateWorkout() {
  const [status, setStatus] = useState<Status>("idle");
  const [plan, setPlan] = useState<WorkoutPlanContent | null>(null);

  async function generate() {
    setStatus("loading");
    setPlan(null);
    try {
      const result = await apiClient.post<{ type: "workout"; content: WorkoutPlanContent }>(
        "/api/plans/workout/generate",
      );
      setPlan(result.content);
      setStatus("ready");
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setStatus("profile_incomplete");
      } else {
        setStatus("error");
      }
    }
  }

  async function save() {
    if (!plan) return;
    await apiClient.post("/api/plans", { type: "workout", content: plan });
    setStatus("saved");
  }

  return (
    <div className="container ff-page ff-page-medium">
      <div className="ff-page-header">
        <span className="ff-eyebrow">
          <IconDumbbell /> Workout plan
        </span>
        <h1>Generate a Workout Plan</h1>
        <p>Built from your fitness goal, activity level, and workout experience.</p>
      </div>

      {status === "profile_incomplete" && (
        <StatusAlert variant="warning">
          Please complete your fitness profile before generating a plan.{" "}
          <a href="/profile" className="fw-semibold">
            Go to profile
          </a>
          .
        </StatusAlert>
      )}

      {status === "error" && (
        <StatusAlert variant="danger">
          We couldn&apos;t reach the workout planner right now.{" "}
          <button className="btn btn-link p-0 align-baseline fw-semibold" onClick={generate}>
            Retry
          </button>
        </StatusAlert>
      )}

      {status === "saved" && <StatusAlert variant="success">Plan saved to your dashboard.</StatusAlert>}

      {(status === "idle" ||
        status === "error" ||
        status === "profile_incomplete" ||
        status === "saved") && (
        <button className="btn btn-brand" onClick={generate}>
          Generate workout plan
        </button>
      )}

      {status === "loading" && <LoadingState label="Generating your plan..." />}

      {plan && (status === "ready" || status === "saved") && (
        <div className="card-ff mt-3 ff-animate-in">
          <div className="card-ff-body">
            <PlanImage
              src={getWorkoutCoverImage(plan.summary)}
              alt="Workout plan cover"
              variant="cover"
              priority
            />
            <div className="plan-summary-banner">
              <p>{plan.summary}</p>
              {plan.progressionGuidance && (
                <p className="text-muted small mb-0">{plan.progressionGuidance}</p>
              )}
            </div>
            {plan.weeklySchedule.map((day, index) => (
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
                    <div className="d-flex align-items-center gap-2">
                      <PlanImage
                        src={getExerciseImage(exercise.name)}
                        alt={exercise.name}
                        variant="thumb"
                      />
                      <span className="exercise-name">{exercise.name}</span>
                    </div>
                    <span className="exercise-volume">
                      {exercise.sets} {exercise.sets === 1 ? "set" : "sets"} × {exercise.reps}
                      {exercise.rest && ` · ${exercise.rest} rest`}
                    </span>
                  </div>
                ))}
              </div>
            ))}
            {status === "ready" && (
              <button className="btn btn-meal" onClick={save}>
                Save Plan
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
