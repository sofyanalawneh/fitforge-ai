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

// Render's free tier spins agent/backend services down after ~15 min idle; the
// first request after that has to cold-start the service, which can exceed
// AGENT_REQUEST_TIMEOUT_MS or bounce off Render's edge with a 502/503 while the
// container is still booting. Locally, the equivalent race is the agent
// process (no hot-reload) not being listening yet or mid-restart, which
// surfaces as a connection-level fetch rejection (TypeError) rather than a
// 502/503 response, since there's no edge proxy in front of it. A single
// retry is enough for either case: by the time the retry fires, the earlier
// attempt has already woken/reconnected to the service, so it responds fast.
// Only retry signals shaped like a transient outage (timeout, connection
// failure, 502, 503) — a real 4xx/5xx from a running agent should fail
// immediately.
const MAX_ATTEMPTS = 2;
const COLD_START_STATUSES = new Set([502, 503]);

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

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), AGENT_TIMEOUT_MS);

    try {
      log.info("agent.request.start", { agent: agentName, requestId, url, attempt });
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      if (!response.ok) {
        if (COLD_START_STATUSES.has(response.status) && attempt < MAX_ATTEMPTS) {
          log.error("agent.request.cold_start_retry", { agent: agentName, requestId, attempt, status: response.status });
          continue;
        }
        throw new Error(`agent responded with status ${response.status}`);
      }

      const data = (await response.json()) as TResponse;
      log.info("agent.request.success", { agent: agentName, requestId, attempt });
      return data;
    } catch (err) {
      // AbortError (our own timeout) and TypeError (fetch's own connection-level
      // rejection, e.g. ECONNREFUSED/ECONNRESET) are both transient-outage shapes
      // worth retrying. The status-based Error thrown above for a non-cold-start
      // response is a plain Error, so it's excluded and still fails immediately.
      const timedOut = err instanceof Error && err.name === "AbortError";
      const connectionFailed = err instanceof TypeError;
      if ((timedOut || connectionFailed) && attempt < MAX_ATTEMPTS) {
        log.error("agent.request.cold_start_retry", {
          agent: agentName,
          requestId,
          attempt,
          error: timedOut ? "timeout" : "connection_failed",
        });
        continue;
      }
      log.error("agent.request.failed", { agent: agentName, requestId, attempt, error: (err as Error).message });
      throw new AgentUnavailableError(agentName, err);
    } finally {
      clearTimeout(timeout);
    }
  }

  throw new AgentUnavailableError(agentName, new Error(`${agentName} agent exhausted retries`));
}

interface WorkoutAgentResponse {
  request_id: string;
  content: {
    summary: string;
    weekly_schedule: WorkoutPlanContent["weeklySchedule"];
    difficulty?: WorkoutExperience;
    progression_guidance?: string;
  };
}

interface MealAgentIngredient {
  name: string;
  quantity: string;
}

interface MealAgentEntry {
  meal: string;
  description: string;
  notes?: string | null;
  ingredients?: MealAgentIngredient[] | null;
  calories?: number | null;
  protein_g?: number | null;
  carbs_g?: number | null;
  fat_g?: number | null;
}

interface MealAgentResponse {
  request_id: string;
  content: {
    summary: string;
    daily_meals: MealAgentEntry[];
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
    difficulty: response.content.difficulty,
    progressionGuidance: response.content.progression_guidance,
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
    dailyMeals: response.content.daily_meals.map((entry) => ({
      meal: entry.meal,
      description: entry.description,
      notes: entry.notes ?? undefined,
      ingredients: entry.ingredients ?? undefined,
      calories: entry.calories ?? undefined,
      protein: entry.protein_g ?? undefined,
      carbs: entry.carbs_g ?? undefined,
      fat: entry.fat_g ?? undefined,
    })),
  };
}
