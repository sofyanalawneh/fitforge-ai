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

/** Persisted at users/{uid}. See data-model.md. */
export interface FitnessProfile {
  age: number;
  gender: Gender;
  heightCm: number;
  weightKg: number;
  fitnessGoal: FitnessGoal;
  activityLevel: ActivityLevel;
  dietaryPreferences: DietaryPreference;
  workoutExperience: WorkoutExperience;
  profileCompletedAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
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

/** Persisted at users/{uid}/plans/{planId} once explicitly saved (FR-016/FR-017). */
export interface Plan {
  planId: string;
  type: PlanType;
  content: PlanContent;
  profileSnapshot: Partial<FitnessProfile>;
  createdAt: string; // ISO timestamp
}

export function isProfileComplete(profile: Partial<FitnessProfile> | null | undefined): profile is FitnessProfileInput {
  if (!profile) return false;
  return (
    profile.age !== undefined &&
    profile.gender !== undefined &&
    profile.heightCm !== undefined &&
    profile.weightKg !== undefined &&
    profile.fitnessGoal !== undefined &&
    profile.activityLevel !== undefined &&
    profile.dietaryPreferences !== undefined &&
    profile.workoutExperience !== undefined
  );
}
