// Daily nutrition figures for the meal page. computeDailyTotals sums the
// plan's own generated meal macros (real numbers, only counting meals that
// have them). computeDailyTargets is a standard Mifflin-St Jeor BMR +
// activity-multiplier + goal-based macro split, using the user's real
// profile — a real formula, not a fabricated number.

import type { ActivityLevel, FitnessGoal, FitnessProfile, MealEntry } from "../types";

export interface MacroTotals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export function computeDailyTotals(meals: MealEntry[]): MacroTotals | null {
  const withMacros = meals.filter((m) => m.calories != null);
  if (withMacros.length === 0) return null;

  return withMacros.reduce(
    (totals, meal) => ({
      calories: totals.calories + (meal.calories ?? 0),
      protein: totals.protein + (meal.protein ?? 0),
      carbs: totals.carbs + (meal.carbs ?? 0),
      fat: totals.fat + (meal.fat ?? 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  );
}

const ACTIVITY_MULTIPLIER: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  lightly_active: 1.375,
  moderately_active: 1.55,
  very_active: 1.725,
};

const GOAL_CALORIE_ADJUSTMENT: Record<FitnessGoal, number> = {
  lose_weight: 0.8,
  build_muscle: 1.1,
  improve_endurance: 1,
  general_fitness: 1,
};

const GOAL_PROTEIN_PER_KG: Record<FitnessGoal, number> = {
  lose_weight: 2.2,
  build_muscle: 2,
  improve_endurance: 1.6,
  general_fitness: 1.8,
};

function computeBmr(profile: FitnessProfile): number {
  const base = 10 * profile.weightKg + 6.25 * profile.heightCm - 5 * profile.age;
  if (profile.gender === "male") return base + 5;
  if (profile.gender === "female") return base - 161;
  // No male/female-specific formula applies; average the two offsets.
  return base - 78;
}

export function computeDailyTargets(profile: FitnessProfile): MacroTotals {
  const bmr = computeBmr(profile);
  const tdee = bmr * ACTIVITY_MULTIPLIER[profile.activityLevel];
  const targetCalories = Math.round(tdee * GOAL_CALORIE_ADJUSTMENT[profile.fitnessGoal]);

  const proteinG = Math.round(GOAL_PROTEIN_PER_KG[profile.fitnessGoal] * profile.weightKg);
  const fatCalories = targetCalories * 0.25;
  const fatG = Math.round(fatCalories / 9);
  const remainingCalories = Math.max(0, targetCalories - proteinG * 4 - fatCalories);
  const carbsG = Math.round(remainingCalories / 4);

  return { calories: targetCalories, protein: proteinG, carbs: carbsG, fat: fatG };
}
