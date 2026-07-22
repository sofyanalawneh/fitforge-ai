import { useState } from "react";
import { ApiError, apiClient } from "../services/apiClient";
import type { MealPlanContent } from "../types";
import { LoadingState } from "../components/LoadingState";
import { StatusAlert } from "../components/StatusAlert";
import { IconSalad } from "../components/icons";

type Status = "idle" | "loading" | "error" | "profile_incomplete" | "ready" | "saved";

export function GenerateMeal() {
  const [status, setStatus] = useState<Status>("idle");
  const [plan, setPlan] = useState<MealPlanContent | null>(null);

  async function generate() {
    setStatus("loading");
    setPlan(null);
    try {
      const result = await apiClient.post<{ type: "meal"; content: MealPlanContent }>(
        "/api/plans/meal/generate",
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
    await apiClient.post("/api/plans", { type: "meal", content: plan });
    setStatus("saved");
  }

  return (
    <div className="container ff-page ff-page-medium">
      <div className="ff-page-header">
        <span className="ff-eyebrow">
          <IconSalad /> Meal plan
        </span>
        <h1>Generate a Meal Plan</h1>
        <p>Built from your fitness goal and dietary preference.</p>
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
          We couldn&apos;t reach the meal planner right now.{" "}
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
          Generate meal plan
        </button>
      )}

      {status === "loading" && <LoadingState label="Generating your plan..." />}

      {plan && (status === "ready" || status === "saved") && (
        <div className="card-ff mt-3 ff-animate-in">
          <div className="card-ff-body">
            <div className="plan-summary-banner">
              <p>{plan.summary}</p>
            </div>
            {plan.dailyMeals.map((meal, index) => (
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
            {status === "ready" && (
              <button className="btn btn-meal mt-3" onClick={save}>
                Save Plan
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
