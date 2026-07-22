import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import { requireAuth } from "../middleware/auth";
import { getProfile, upsertProfile } from "../services/profileService";
import type { FitnessProfileInput } from "../models/types";

export const profileRouter = Router();

profileRouter.use(requireAuth);

profileRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const { uid } = req;
    const profile = await getProfile(uid);
    req.log.info("profile.get", { uid, found: profile !== null });
    res.status(200).json({ profile });
  }),
);

const GENDERS = ["male", "female", "other", "prefer_not_to_say"];
const FITNESS_GOALS = ["lose_weight", "build_muscle", "improve_endurance", "general_fitness"];
const ACTIVITY_LEVELS = ["sedentary", "lightly_active", "moderately_active", "very_active"];
const DIETARY_PREFERENCES = ["none", "vegetarian", "vegan", "other"];
const WORKOUT_EXPERIENCES = ["beginner", "intermediate", "advanced"];

function validateProfileInput(body: unknown): { fields: Record<string, string> } | { value: FitnessProfileInput } {
  const fields: Record<string, string> = {};
  const b = (body ?? {}) as Partial<Record<keyof FitnessProfileInput, unknown>>;

  const age = Number(b.age);
  if (!Number.isFinite(age) || age < 13 || age > 100) {
    fields.age = "age must be a number between 13 and 100";
  }

  if (typeof b.gender !== "string" || !GENDERS.includes(b.gender)) {
    fields.gender = `gender must be one of: ${GENDERS.join(", ")}`;
  }

  const heightCm = Number(b.heightCm);
  if (!Number.isFinite(heightCm) || heightCm < 100 || heightCm > 250) {
    fields.heightCm = "heightCm must be a number between 100 and 250";
  }

  const weightKg = Number(b.weightKg);
  if (!Number.isFinite(weightKg) || weightKg < 30 || weightKg > 300) {
    fields.weightKg = "weightKg must be a number between 30 and 300";
  }

  if (typeof b.fitnessGoal !== "string" || !FITNESS_GOALS.includes(b.fitnessGoal)) {
    fields.fitnessGoal = `fitnessGoal must be one of: ${FITNESS_GOALS.join(", ")}`;
  }

  if (typeof b.activityLevel !== "string" || !ACTIVITY_LEVELS.includes(b.activityLevel)) {
    fields.activityLevel = `activityLevel must be one of: ${ACTIVITY_LEVELS.join(", ")}`;
  }

  if (typeof b.dietaryPreferences !== "string" || !DIETARY_PREFERENCES.includes(b.dietaryPreferences)) {
    fields.dietaryPreferences = `dietaryPreferences must be one of: ${DIETARY_PREFERENCES.join(", ")}`;
  }

  if (typeof b.workoutExperience !== "string" || !WORKOUT_EXPERIENCES.includes(b.workoutExperience)) {
    fields.workoutExperience = `workoutExperience must be one of: ${WORKOUT_EXPERIENCES.join(", ")}`;
  }

  if (Object.keys(fields).length > 0) {
    return { fields };
  }

  return {
    value: {
      age,
      gender: b.gender as FitnessProfileInput["gender"],
      heightCm,
      weightKg,
      fitnessGoal: b.fitnessGoal as FitnessProfileInput["fitnessGoal"],
      activityLevel: b.activityLevel as FitnessProfileInput["activityLevel"],
      dietaryPreferences: b.dietaryPreferences as FitnessProfileInput["dietaryPreferences"],
      workoutExperience: b.workoutExperience as FitnessProfileInput["workoutExperience"],
    },
  };
}

profileRouter.put(
  "/",
  asyncHandler(async (req, res) => {
    const { uid } = req;
    const validation = validateProfileInput(req.body);

    if ("fields" in validation) {
      req.log.info("profile.put.validation_failed", { uid, fields: Object.keys(validation.fields) });
      res.status(400).json({ error: "invalid_profile", fields: validation.fields });
      return;
    }

    const profile = await upsertProfile(uid, validation.value);
    req.log.info("profile.put.success", { uid });
    res.status(200).json({ profile });
  }),
);
