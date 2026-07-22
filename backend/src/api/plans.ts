import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import { requireAuth } from "../middleware/auth";
import { AgentUnavailableError, generateMealPlan, generateWorkoutPlan } from "../services/agentClient";
import { getProfile } from "../services/profileService";
import { createPlan, deletePlan, getPlan, listPlans } from "../services/planService";
import { isProfileComplete, type PlanContent, type PlanType } from "../models/types";

export const plansRouter = Router();

plansRouter.use(requireAuth);

plansRouter.post(
  "/workout/generate",
  asyncHandler(async (req, res) => {
    const { uid } = req;
    const profile = await getProfile(uid);

    if (!isProfileComplete(profile)) {
      req.log.info("plans.workout.generate.profile_incomplete", { uid });
      res.status(409).json({ error: "profile_incomplete" });
      return;
    }

    try {
      const content = await generateWorkoutPlan(
        {
          fitnessGoal: profile.fitnessGoal,
          activityLevel: profile.activityLevel,
          workoutExperience: profile.workoutExperience,
        },
        req.log,
      );
      req.log.info("plans.workout.generate.success", { uid });
      res.status(200).json({ type: "workout", content });
    } catch (err) {
      if (err instanceof AgentUnavailableError) {
        req.log.error("plans.workout.generate.agent_unavailable", { uid, error: err.message });
        res.status(502).json({ error: "agent_unavailable" });
        return;
      }
      throw err;
    }
  }),
);

plansRouter.post(
  "/meal/generate",
  asyncHandler(async (req, res) => {
    const { uid } = req;
    const profile = await getProfile(uid);

    if (!isProfileComplete(profile)) {
      req.log.info("plans.meal.generate.profile_incomplete", { uid });
      res.status(409).json({ error: "profile_incomplete" });
      return;
    }

    try {
      const content = await generateMealPlan(
        { fitnessGoal: profile.fitnessGoal, dietaryPreferences: profile.dietaryPreferences },
        req.log,
      );
      req.log.info("plans.meal.generate.success", { uid });
      res.status(200).json({ type: "meal", content });
    } catch (err) {
      if (err instanceof AgentUnavailableError) {
        req.log.error("plans.meal.generate.agent_unavailable", { uid, error: err.message });
        res.status(502).json({ error: "agent_unavailable" });
        return;
      }
      throw err;
    }
  }),
);

plansRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const { uid } = req;
    const { type, content } = req.body as { type?: PlanType; content?: PlanContent };

    if (type !== "workout" && type !== "meal") {
      res.status(400).json({ error: "invalid_plan_type" });
      return;
    }
    if (!content) {
      res.status(400).json({ error: "missing_content" });
      return;
    }

    const profile = await getProfile(uid);
    const plan = await createPlan(uid, type, content, profile ?? {});
    req.log.info("plans.save.success", { uid, planId: plan.planId, type });
    res.status(201).json({ plan });
  }),
);

plansRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const { uid } = req;
    const plans = await listPlans(uid);
    req.log.info("plans.list", { uid, count: plans.length });
    res.status(200).json({ plans });
  }),
);

plansRouter.get(
  "/:planId",
  asyncHandler(async (req, res) => {
    const { uid } = req;
    const plan = await getPlan(uid, req.params.planId);
    if (!plan) {
      res.status(404).json({ error: "not_found" });
      return;
    }
    res.status(200).json({ plan });
  }),
);

plansRouter.delete(
  "/:planId",
  asyncHandler(async (req, res) => {
    const { uid } = req;
    const deleted = await deletePlan(uid, req.params.planId);
    if (!deleted) {
      res.status(404).json({ error: "not_found" });
      return;
    }
    req.log.info("plans.delete.success", { uid, planId: req.params.planId });
    res.status(204).send();
  }),
);
