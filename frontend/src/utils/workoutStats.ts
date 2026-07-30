// Derived, real-data-only statistics for the workout stat bar and per-day
// session summary. Nothing here is fabricated: volume/day counts are exact
// sums of the plan's own generated exercises; the calorie figure is a
// standard MET-based estimate (using the user's real body weight), always
// shown with a "~" prefix to signal it is an estimate, not a measurement.

import type { FitnessGoal, WorkoutDay, WorkoutExperience, WorkoutPlanContent } from "../types";
import { formatEnumLabel } from "./format";
import { getExerciseInfo, type MuscleGroup } from "./exerciseInfo";

const MET_BY_MUSCLE_GROUP: Record<MuscleGroup, number> = {
  cardio: 7,
  core: 3,
  arms: 4,
  chest: 5,
  back: 5,
  shoulders: 5,
  legs: 5.5,
};

const WORK_SECONDS_PER_SET = 40;
const DEFAULT_REST_SECONDS = 60;

function parseAverageSeconds(text?: string): number {
  const numbers = text?.match(/\d+/g)?.map(Number) ?? [];
  if (numbers.length === 0) return DEFAULT_REST_SECONDS;
  return numbers.reduce((sum, n) => sum + n, 0) / numbers.length;
}

const EXPERIENCE_INTENSITY_BOOST: Record<WorkoutExperience, number> = {
  beginner: -0.5,
  intermediate: 0,
  advanced: 1,
};

export interface SessionSummary {
  volume: string;
  estCalories: string;
  focusMuscles: string;
  intensity: "Low" | "Moderate" | "High";
}

export function computeSessionSummary(day: WorkoutDay, weightKg: number, experience: WorkoutExperience): SessionSummary {
  const totalSets = day.exercises.reduce((sum, exercise) => sum + exercise.sets, 0);

  let totalSeconds = 0;
  let metWeightedSeconds = 0;
  const musclesSeen: string[] = [];

  for (const exercise of day.exercises) {
    const info = getExerciseInfo(exercise.name);
    const restSeconds = parseAverageSeconds(exercise.rest);
    const setSeconds = exercise.sets * (WORK_SECONDS_PER_SET + restSeconds);
    totalSeconds += setSeconds;
    metWeightedSeconds += MET_BY_MUSCLE_GROUP[info.muscleGroup] * setSeconds;

    for (const muscle of info.targetMuscles) {
      if (!musclesSeen.includes(muscle)) musclesSeen.push(muscle);
    }
  }

  const avgMet = totalSeconds > 0 ? metWeightedSeconds / totalSeconds : 0;
  const hours = totalSeconds / 3600;
  const estCalories = Math.round(avgMet * weightKg * hours);

  const intensityScore = avgMet + EXPERIENCE_INTENSITY_BOOST[experience];
  const intensity: SessionSummary["intensity"] =
    intensityScore >= 6 ? "High" : intensityScore >= 4.5 ? "Moderate" : "Low";

  return {
    volume: `${totalSets} sets`,
    estCalories: `~${estCalories} kcal`,
    focusMuscles: musclesSeen.slice(0, 4).join(" / ") || "Full Body",
    intensity,
  };
}

/** Per-day session length in minutes, from the plan's own sets/rest (same
 * work/rest-per-set model as computeSessionSummary), rounded to the nearest
 * 5 minutes for a readable range. Independent of body weight/experience —
 * unlike estCalories/intensity, duration doesn't vary with either. */
function estimateDayMinutes(day: WorkoutDay): number {
  const totalSeconds = day.exercises.reduce((sum, exercise) => {
    const restSeconds = parseAverageSeconds(exercise.rest);
    return sum + exercise.sets * (WORK_SECONDS_PER_SET + restSeconds);
  }, 0);
  return Math.max(5, Math.round(totalSeconds / 60 / 5) * 5);
}

/** "45-60 min" (or "50 min" if every day comes out the same) across the
 * plan's real days — used for the workout detail page's Duration stat. */
export function computeWorkoutDurationRange(plan: WorkoutPlanContent): string {
  const minutesPerDay = plan.weeklySchedule.map(estimateDayMinutes);
  const min = Math.min(...minutesPerDay);
  const max = Math.max(...minutesPerDay);
  return min === max ? `${min} min` : `${min}-${max} min`;
}

export interface PlanStatItem {
  label: string;
  value: string;
}

export function computeWorkoutPlanStats(
  plan: WorkoutPlanContent,
  profile: { fitnessGoal: FitnessGoal; workoutExperience: WorkoutExperience },
): PlanStatItem[] {
  const daysPerWeek = plan.weeklySchedule.length;
  const exercisesPerSession = plan.weeklySchedule[0]?.exercises.length ?? 0;

  return [
    { label: "Goal", value: formatEnumLabel(profile.fitnessGoal) },
    { label: "Level", value: formatEnumLabel(profile.workoutExperience) },
    { label: "Days / Week", value: `${daysPerWeek} Days` },
    { label: "Sessions / Week", value: `${daysPerWeek} Sessions` },
    { label: "Exercises / Session", value: `${exercisesPerSession} Exercises` },
  ];
}
