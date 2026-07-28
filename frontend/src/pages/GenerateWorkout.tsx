import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ApiError, apiClient } from "../services/apiClient";
import type { WorkoutPlanContent } from "../types";
import { LoadingState } from "../components/LoadingState";
import { StatusAlert } from "../components/StatusAlert";
import { InfoNotice } from "../components/plan/InfoNotice";
import { WorkoutCard } from "../components/plan/WorkoutCard";
import { IconArrowRight, IconDumbbell } from "../components/icons";

type Status = "idle" | "loading" | "error" | "profile_incomplete" | "ready" | "saved";

export function GenerateWorkout() {
  const navigate = useNavigate();
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
    <div className="container ff-page ff-page-wide">
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

      {status === "saved" && (
        <>
          <StatusAlert variant="success">Plan saved to your dashboard.</StatusAlert>
          <button
            type="button"
            className="btn btn-brand btn-lg mb-3 d-inline-flex align-items-center gap-2"
            onClick={() => navigate("/dashboard")}
          >
            Go to Dashboard
            <IconArrowRight />
          </button>
        </>
      )}

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
        <>
          <InfoNotice>
            <p>{plan.summary}</p>
            {plan.progressionGuidance && (
              <p className="text-muted small mb-0">{plan.progressionGuidance}</p>
            )}
          </InfoNotice>
          <div className="plan-card-list">
            {plan.weeklySchedule.map((day, index) => (
              <WorkoutCard key={`${day.day}-${index}`} day={day} style={{ animationDelay: `${index * 60}ms` }} />
            ))}
          </div>
          {status === "ready" && (
            <button className="btn btn-meal mt-3" onClick={save}>
              Save Plan
            </button>
          )}
        </>
      )}
    </div>
  );
}
