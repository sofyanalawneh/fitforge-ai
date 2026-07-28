import { useEffect, useState } from "react";
import { ApiError, apiClient } from "../services/apiClient";
import type { FitnessProfile, MealPlanContent } from "../types";
import { LoadingState } from "../components/LoadingState";
import { StatusAlert } from "../components/StatusAlert";
import { DailyNutritionSummary } from "../components/plan/DailyNutritionSummary";
import { InfoNotice } from "../components/plan/InfoNotice";
import { MealCard } from "../components/plan/MealCard";
import { PlanSavedBanner } from "../components/plan/PlanSavedBanner";
import { PlanStatsBar } from "../components/plan/PlanStatsBar";
import { TipCard } from "../components/plan/TipCard";
import {
  IconCalendarCheck,
  IconDumbbell,
  IconRefresh,
  IconSalad,
  IconTarget,
} from "../components/icons";
import { formatEnumLabel } from "../utils/format";
import { computeDailyTargets, computeDailyTotals } from "../utils/mealStats";

type Status = "idle" | "loading" | "error" | "profile_incomplete" | "ready" | "saved";

const TARGET_ICONS = [<IconTarget key="goal" />, <IconCalendarCheck key="cal" />, <IconDumbbell key="protein" />, <IconSalad key="carbs" />, <IconSalad key="fat" />];

export function GenerateMeal() {
  const [status, setStatus] = useState<Status>("idle");
  const [plan, setPlan] = useState<MealPlanContent | null>(null);
  const [profile, setProfile] = useState<FitnessProfile | null>(null);

  useEffect(() => {
    apiClient
      .get<{ profile: FitnessProfile | null }>("/api/profile")
      .then(({ profile }) => setProfile(profile))
      .catch(() => undefined);
  }, []);

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

  const dailyTotals = plan ? computeDailyTotals(plan.dailyMeals) : null;

  return (
    <div className="container ff-page ff-page-wide">
      <div className="plan-page-header">
        <div>
          <span className="ff-eyebrow">
            <IconSalad /> Meal plan
          </span>
          <h1>Generate a Meal Plan</h1>
          <p>Built from your fitness goal and dietary preference.</p>
        </div>
        {plan && (status === "ready" || status === "saved") && (
          <div className="plan-page-header-actions">
            <button
              type="button"
              className="btn btn-outline-dark btn-sm d-inline-flex align-items-center gap-2"
              onClick={generate}
            >
              <IconRefresh width={16} height={16} />
              Generate another version
            </button>
          </div>
        )}
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

      {status === "saved" && (
        <PlanSavedBanner generateLabel="Generate another meal plan" onGenerateAnother={generate} />
      )}

      {(status === "idle" || status === "error" || status === "profile_incomplete") && (
        <button className="btn btn-brand" onClick={generate}>
          Generate meal plan
        </button>
      )}

      {status === "loading" && <LoadingState label="Generating your plan..." />}

      {plan && profile && (status === "ready" || status === "saved") && (
        <>
          {(() => {
            const targets = computeDailyTargets(profile);
            const items = [
              { label: "Goal", value: formatEnumLabel(profile.fitnessGoal) },
              { label: "Calories / Day", value: `${targets.calories} kcal` },
              { label: "Protein / Day", value: `${targets.protein} g` },
              { label: "Carbs / Day", value: `${targets.carbs} g` },
              { label: "Fats / Day", value: `${targets.fat} g` },
            ];
            return (
              <PlanStatsBar items={items.map((item, index) => ({ ...item, icon: TARGET_ICONS[index] }))} />
            );
          })()}
          <InfoNotice>
            <p>{plan.summary}</p>
          </InfoNotice>
          <div className="plan-card-list">
            {plan.dailyMeals.map((meal, index) => (
              <MealCard key={`${meal.meal}-${index}`} meal={meal} style={{ animationDelay: `${index * 60}ms` }} />
            ))}
          </div>
          {dailyTotals && <DailyNutritionSummary totals={dailyTotals} />}
          <TipCard tone="meal">Drink plenty of water and aim for 7-8 hours of sleep for optimal results.</TipCard>
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
