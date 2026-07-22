import { randomUUID } from "node:crypto";
import type { Logger } from "../middleware/logging";
import type {
  ActivityLevel,
  DietaryPreference,
  FitnessGoal,
  MealPlanContent,
  WorkoutExperience,
  WorkoutPlanContent,
} from "../models/types";

const AGENT_TIMEOUT_MS = Number(process.env.AGENT_REQUEST_TIMEOUT_MS ?? 30_000);

export class AgentUnavailableError extends Error {
  constructor(agent: "workout" | "meal", cause: unknown) {
    super(`${agent} agent unavailable: ${(cause as Error)?.message ?? String(cause)}`);
  }
}

async function postToAgent<TResponse>(
  url: string | undefined,
  agentName: "workout" | "meal",
  body: unknown,
  log: Logger,
  requestId: string,
): Promise<TResponse> {
  if (!url) {
    throw new AgentUnavailableError(agentName, new Error(`no URL configured for ${agentName} agent`));
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), AGENT_TIMEOUT_MS);

  try {
    log.info("agent.request.start", { agent: agentName, requestId, url });
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`agent responded with status ${response.status}`);
    }

    const data = (await response.json()) as TResponse;
    log.info("agent.request.success", { agent: agentName, requestId });
    return data;
  } catch (err) {
    log.error("agent.request.failed", { agent: agentName, requestId, error: (err as Error).message });
    throw new AgentUnavailableError(agentName, err);
  } finally {
    clearTimeout(timeout);
  }
}

interface WorkoutAgentResponse {
  request_id: string;
  content: {
    summary: string;
    weekly_schedule: WorkoutPlanContent["weeklySchedule"];
  };
}

interface MealAgentResponse {
  request_id: string;
  content: {
    summary: string;
    daily_meals: MealPlanContent["dailyMeals"];
  };
}

export async function generateWorkoutPlan(
  profile: { fitnessGoal: FitnessGoal; activityLevel: ActivityLevel; workoutExperience: WorkoutExperience },
  log: Logger,
): Promise<WorkoutPlanContent> {
  const requestId = randomUUID();
  const response = await postToAgent<WorkoutAgentResponse>(
    process.env.WORKOUT_AGENT_URL,
    "workout",
    {
      request_id: requestId,
      profile: {
        fitness_goal: profile.fitnessGoal,
        activity_level: profile.activityLevel,
        workout_experience: profile.workoutExperience,
      },
    },
    log,
    requestId,
  );

  return {
    summary: response.content.summary,
    weeklySchedule: response.content.weekly_schedule,
  };
}

export async function generateMealPlan(
  profile: { fitnessGoal: FitnessGoal; dietaryPreferences: DietaryPreference },
  log: Logger,
): Promise<MealPlanContent> {
  const requestId = randomUUID();
  const response = await postToAgent<MealAgentResponse>(
    process.env.MEAL_AGENT_URL,
    "meal",
    {
      request_id: requestId,
      profile: {
        fitness_goal: profile.fitnessGoal,
        dietary_preferences: profile.dietaryPreferences,
      },
    },
    log,
    requestId,
  );

  return {
    summary: response.content.summary,
    dailyMeals: response.content.daily_meals,
  };
}
