import { useEffect, useState } from "react";
import { ApiError, apiClient } from "../services/apiClient";
import type { FitnessProfile, WorkoutPlanContent } from "../types";
import { LoadingState } from "../components/LoadingState";
import { StatusAlert } from "../components/StatusAlert";
import { InfoNotice } from "../components/plan/InfoNotice";
import { PlanSavedBanner } from "../components/plan/PlanSavedBanner";
import { PlanStatsBar } from "../components/plan/PlanStatsBar";
import { SessionSummary } from "../components/plan/SessionSummary";
import { TipCard } from "../components/plan/TipCard";
import { WeekdayTabs } from "../components/plan/WeekdayTabs";
import { WorkoutCard } from "../components/plan/WorkoutCard";
import {
  IconCalendarCheck,
  IconCheckCircle,
  IconDumbbell,
  IconLayoutGrid,
  IconRefresh,
  IconTarget,
} from "../components/icons";
import { computeSessionSummary, computeWorkoutPlanStats } from "../utils/workoutStats";

type Status = "idle" | "loading" | "error" | "profile_incomplete" | "ready" | "saved";

const STAT_ICONS = [<IconTarget key="goal" />, <IconDumbbell key="level" />, <IconCalendarCheck key="days" />, <IconLayoutGrid key="sessions" />, <IconCheckCircle key="exercises" />];

export function GenerateWorkout() {
  const [status, setStatus] = useState<Status>("idle");
  const [plan, setPlan] = useState<WorkoutPlanContent | null>(null);
  const [profile, setProfile] = useState<FitnessProfile | null>(null);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);

  useEffect(() => {
    apiClient
      .get<{ profile: FitnessProfile | null }>("/api/profile")
      .then(({ profile }) => setProfile(profile))
      .catch(() => undefined);
  }, []);

  async function generate() {
    setStatus("loading");
    setPlan(null);
    setSelectedDayIndex(0);
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

  const selectedDay = plan?.weeklySchedule[selectedDayIndex];

  return (
    <div className="container ff-page ff-page-wide">
      <div className="plan-page-header">
        <div>
          <span className="ff-eyebrow">
            <IconDumbbell /> Workout plan
          </span>
          <h1>Generate a Workout Plan</h1>
          <p>Built from your fitness goal, activity level, and workout experience.</p>
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
          We couldn&apos;t reach the workout planner right now.{" "}
          <button className="btn btn-link p-0 align-baseline fw-semibold" onClick={generate}>
            Retry
          </button>
        </StatusAlert>
      )}

      {status === "saved" && (
        <PlanSavedBanner generateLabel="Generate another workout" onGenerateAnother={generate} />
      )}

      {(status === "idle" || status === "error" || status === "profile_incomplete") && (
        <button className="btn btn-brand" onClick={generate}>
          Generate workout plan
        </button>
      )}

      {status === "loading" && <LoadingState label="Generating your plan..." />}

      {plan && profile && (status === "ready" || status === "saved") && (
        <>
          <PlanStatsBar
            items={computeWorkoutPlanStats(plan, profile).map((stat, index) => ({
              ...stat,
              icon: STAT_ICONS[index],
            }))}
          />
          <InfoNotice>
            <p>{plan.summary}</p>
            {plan.progressionGuidance && (
              <p className="text-muted small mb-0">{plan.progressionGuidance}</p>
            )}
          </InfoNotice>
          <WeekdayTabs
            days={plan.weeklySchedule.map((day) => day.day)}
            selectedIndex={selectedDayIndex}
            onSelect={setSelectedDayIndex}
          />
          {selectedDay && (
            <>
              <WorkoutCard day={selectedDay} />
              <SessionSummary summary={computeSessionSummary(selectedDay, profile.weightKg, profile.workoutExperience)} />
            </>
          )}
          <TipCard tone="workout">
            Progressive overload is key. Try to increase the weight or reps slightly each week.
          </TipCard>
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
