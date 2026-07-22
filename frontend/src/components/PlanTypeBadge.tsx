import type { PlanType } from "../types";
import { IconDumbbell, IconSalad } from "./icons";

export function PlanTypeBadge({ type }: { type: PlanType }) {
  const isWorkout = type === "workout";
  return (
    <span className={`badge-plan ${isWorkout ? "badge-plan-workout" : "badge-plan-meal"}`}>
      {isWorkout ? <IconDumbbell /> : <IconSalad />}
      {isWorkout ? "Workout" : "Meal"}
    </span>
  );
}
