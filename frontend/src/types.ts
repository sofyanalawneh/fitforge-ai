// Mirrors backend/src/models/types.ts (see data-model.md). Frontend and backend
// are separate deployable units per plan.md, so these types are intentionally
// duplicated rather than shared via a package.

export type Gender = "male" | "female" | "other" | "prefer_not_to_say";

export type FitnessGoal =
  | "lose_weight"
  | "build_muscle"
  | "improve_endurance"
  | "general_fitness";

export type ActivityLevel =
  | "sedentary"
  | "lightly_active"
  | "moderately_active"
  | "very_active";

export type DietaryPreference = "none" | "vegetarian" | "vegan" | "other";

export type WorkoutExperience = "beginner" | "intermediate" | "advanced";

export interface FitnessProfile {
  age: number;
  gender: Gender;
  heightCm: number;
  weightKg: number;
  fitnessGoal: FitnessGoal;
  activityLevel: ActivityLevel;
  dietaryPreferences: DietaryPreference;
  workoutExperience: WorkoutExperience;
  profileCompletedAt: string;
  updatedAt: string;
}

export type FitnessProfileInput = Omit<FitnessProfile, "profileCompletedAt" | "updatedAt">;

export type PlanType = "workout" | "meal";

export interface WorkoutExercise {
  name: string;
  sets: number;
  reps: string;
  rest?: string;
  notes?: string;
}

export interface WorkoutDay {
  day: string;
  focus: string;
  exercises: WorkoutExercise[];
}

export interface WorkoutPlanContent {
  summary: string;
  weeklySchedule: WorkoutDay[];
  difficulty?: WorkoutExperience;
  progressionGuidance?: string;
}

export interface MealEntry {
  meal: string;
  description: string;
  notes?: string;
}

export interface MealPlanContent {
  summary: string;
  dailyMeals: MealEntry[];
}

export type PlanContent = WorkoutPlanContent | MealPlanContent;

export interface Plan {
  planId: string;
  type: PlanType;
  content: PlanContent;
  profileSnapshot: Partial<FitnessProfile>;
  createdAt: string;
}
