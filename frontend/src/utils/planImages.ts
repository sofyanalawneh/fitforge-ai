// Derives a suitable local image for workout/meal content from text that is
// already part of the plan (summary, exercise name, meal name/description),
// rather than storing image paths in Firestore. Every lookup has a safe
// fallback so a missing/old field or an unrecognized name never breaks
// rendering — see PlanImage for the runtime <img> fallback as well.

import type { MealPlanContent, Plan, WorkoutPlanContent } from "../types";

export const WORKOUT_PLACEHOLDER = "/images/placeholders/workout-placeholder.webp";
export const MEAL_PLACEHOLDER = "/images/placeholders/meal-placeholder.webp";

function normalize(text: string | undefined | null): string {
  return (text ?? "").trim().toLowerCase();
}

const WORKOUT_COVER_BY_GOAL: ReadonlyArray<readonly [RegExp, string]> = [
  [/lose weight/, "/images/workouts/cardio.webp"],
  [/build muscle/, "/images/workouts/strength.webp"],
  [/endurance/, "/images/workouts/cardio.webp"],
  [/general fitness/, "/images/workouts/full-body.webp"],
];

/** `summaryOrGoal` is typically the plan's `summary` sentence, which already
 * names the fitness goal (see agents/src/workout_agent.py's _build_plan). */
export function getWorkoutCoverImage(summaryOrGoal?: string | null): string {
  const text = normalize(summaryOrGoal);
  for (const [pattern, image] of WORKOUT_COVER_BY_GOAL) {
    if (pattern.test(text)) return image;
  }
  return WORKOUT_PLACEHOLDER;
}

// Per-day-card visual, keyed by that day's `focus` string (e.g. "Upper Body
// (Push Focus)", "Full Body + Cardio", "Core + Balance" — see
// agents/src/workout_agent.py's _EXERCISE_POOL_BY_GOAL for every real value
// this agent currently produces). Distinct from getWorkoutCoverImage above,
// which keys off the whole-plan goal for the Dashboard/summary cover, not a
// single day's focus. Body-region matches are checked before the
// cardio/conditioning bucket so a mixed day like "Full Body + Cardio" (mostly
// strength work) still gets the full-body photo rather than the cardio one.
// "Core + Balance" and any future rest/recovery day intentionally fall
// through to an icon panel rather than being forced onto an unrelated photo.
export type WorkoutIconKey = "dumbbell" | "core" | "rest";

export type WorkoutVisual = { kind: "image"; src: string } | { kind: "icon"; icon: WorkoutIconKey };

const WORKOUT_FOCUS_IMAGES: ReadonlyArray<readonly [RegExp, string]> = [
  [/full body/, "/images/workouts/full-body.webp"],
  [/upper body|chest|\bback\b|shoulder|\barm/, "/images/workouts/upper-body.webp"],
  [/lower body|\bleg|glute|quad|hamstring/, "/images/workouts/lower-body.webp"],
  [/cardio|interval|metabolic|circuit|tempo|hill|speed|sprint|conditioning/, "/images/workouts/cardio.webp"],
  [/strength|power/, "/images/workouts/strength.webp"],
];

const WORKOUT_FOCUS_ICONS: ReadonlyArray<readonly [RegExp, WorkoutIconKey]> = [
  [/\brest\b|recovery|deload/, "rest"],
  [/\bcore\b|balance|mobility/, "core"],
];

/** `focus` is a WorkoutDay's `focus` field. Returns either a local photo or
 * an icon key for a styled visual panel — never a broken/missing image path
 * — so callers can render a consistent visual area either way. */
export function getWorkoutFocusVisual(focus?: string | null): WorkoutVisual {
  const text = normalize(focus);
  for (const [pattern, image] of WORKOUT_FOCUS_IMAGES) {
    if (pattern.test(text)) return { kind: "image", src: image };
  }
  for (const [pattern, icon] of WORKOUT_FOCUS_ICONS) {
    if (pattern.test(text)) return { kind: "icon", icon };
  }
  return { kind: "icon", icon: "dumbbell" };
}

// Per-exercise matching, NOT muscle-group matching: two exercises that train
// the same muscle (e.g. Lateral Raise vs. Bicep Curl, or Bent-Over Row vs.
// Pull-Up) must never share an image just because they're same-muscle. Every
// exercise below has its own dedicated photo (see frontend/public/images/
// exercises/) except a deliberate handful of true synonyms/close variants
// that share a photo on purpose:
//   - Bulgarian Split Squat / Walking Lunge -> lunges (split-stance family,
//     no dedicated photo exists for either variant)
//   - Tempo Run / Jog -> running (literally running at a different pace)
//   - Step-Up (unqualified) -> box-step-up (same movement, more specific name
//     is the one we have a photo for)
//   - Barbell Row / Bent-Over Row -> bent-over-row (same exercise, "barbell
//     row" and "bent-over row" are interchangeable names for it)
//   - unlisted curl variants (barbell/cable/concentration/preacher curl)
//     -> bicep-curl (same standing elbow-flexion action, different
//     grip/support)
// Ordered most-specific-first so an exact/family match is checked before any
// broader pattern it could otherwise be swept into (e.g. Front Squat before
// the generic Squat pattern, Leg Curl before the generic curl fallback).
const EXERCISE_ALIASES: ReadonlyArray<readonly [RegExp, string]> = [
  [/front squat/, "/images/exercises/front-squat.webp"],
  [/goblet squat/, "/images/exercises/goblet-squat.webp"],
  [/^squat$|bodyweight squat|^back squat$/, "/images/exercises/squat.webp"],
  [/incline push-?up/, "/images/exercises/incline-push-up.webp"],
  [/push-?up/, "/images/exercises/push-up.webp"],
  [/chin-?up/, "/images/exercises/chin-up.webp"],
  [/pull-?up/, "/images/exercises/pull-up.webp"],
  [/romanian deadlift/, "/images/exercises/romanian-deadlift.webp"],
  [/deadlift/, "/images/exercises/deadlift.webp"],
  [/bulgarian split squat|walking lunge|lunge/, "/images/exercises/lunges.webp"],
  [/incline.*press/, "/images/exercises/incline-dumbbell-press.webp"],
  [/bench press/, "/images/exercises/bench-press.webp"],
  [/side plank/, "/images/exercises/side-plank.webp"],
  [/^plank$/, "/images/exercises/plank.webp"],
  [/hammer curl/, "/images/exercises/hammer-curl.webp"],
  [/leg curl|hamstring curl/, "/images/exercises/leg-curl.webp"],
  [/curl/, "/images/exercises/bicep-curl.webp"],
  [/high knee/, "/images/exercises/high-knees.webp"],
  [/hill sprint/, "/images/exercises/hill-sprints.webp"],
  [/sprint interval/, "/images/exercises/sprint-intervals.webp"],
  [/brisk walk/, "/images/exercises/brisk-walk.webp"],
  [/\brun|\bjog/, "/images/exercises/running.webp"],
  [/barbell row|bent-over row/, "/images/exercises/bent-over-row.webp"],
  [/dumbbell row/, "/images/exercises/dumbbell-row.webp"],
  [/face pull/, "/images/exercises/face-pull.webp"],
  [/box step-?up|^step-?up$/, "/images/exercises/box-step-up.webp"],
  [/battle rope/, "/images/exercises/battle-ropes.webp"],
  [/bicycle crunch/, "/images/exercises/bicycle-crunch.webp"],
  [/bird dog/, "/images/exercises/bird-dog.webp"],
  [/burpee/, "/images/exercises/burpees.webp"],
  [/calf raise/, "/images/exercises/calf-raise.webp"],
  [/cat-cow/, "/images/exercises/cat-cow-stretch.webp"],
  [/cycling/, "/images/exercises/cycling.webp"],
  [/dumbbell fly/, "/images/exercises/dumbbell-fly.webp"],
  [/farmer'?s carry/, "/images/exercises/farmers-carry.webp"],
  [/hanging leg raise/, "/images/exercises/hanging-leg-raise.webp"],
  [/hip mobility/, "/images/exercises/hip-mobility-drills.webp"],
  [/hip thrust/, "/images/exercises/hip-thrust.webp"],
  [/jump rope/, "/images/exercises/jump-rope.webp"],
  [/jumping jack/, "/images/exercises/jumping-jacks.webp"],
  [/kettlebell swing/, "/images/exercises/kettlebell-swing.webp"],
  [/lateral raise/, "/images/exercises/lateral-raise.webp"],
  [/leg press/, "/images/exercises/leg-press.webp"],
  [/mountain climber/, "/images/exercises/mountain-climbers.webp"],
  [/overhead press/, "/images/exercises/overhead-press.webp"],
  [/russian twist/, "/images/exercises/russian-twist.webp"],
  [/single-leg balance/, "/images/exercises/single-leg-balance.webp"],
  [/sled push/, "/images/exercises/sled-push.webp"],
  [/tricep extension/, "/images/exercises/tricep-extension.webp"],
  [/wall sit/, "/images/exercises/wall-sit.webp"],
  [/weighted dip/, "/images/exercises/weighted-dip.webp"],
];

export function getExerciseImage(name?: string | null): string {
  const text = normalize(name);
  for (const [pattern, image] of EXERCISE_ALIASES) {
    if (pattern.test(text)) return image;
  }
  return WORKOUT_PLACEHOLDER;
}

// Tofu/paneer dishes have no matching local photo — critically, they must
// NOT fall through to the rice/chicken patterns below just because the dish
// also contains rice or vegetables, since showing a meat photo for a
// vegetarian/vegan dish would be actively misleading, worse than a
// placeholder. (Lentil/chickpea dishes need no such guard: chickpea ones are
// literally described as "salad" and correctly match that pattern, and the
// lentil bowl has no rice/chicken keyword to false-positive on.)
const MEAL_IMAGE_EXCLUSIONS = /tofu|paneer/;

const MEAL_ALIASES: ReadonlyArray<readonly [RegExp, string]> = [
  [/salmon|\bfish\b|tilapia|tuna/, "/images/meals/salmon.webp"],
  [/beef|steak/, "/images/meals/beef-rice.webp"],
  [/yogurt|cottage cheese/, "/images/meals/yogurt.webp"],
  [/oatmeal/, "/images/meals/oatmeal.webp"],
  [/\begg|toast|omelette/, "/images/meals/eggs.webp"],
  [/pasta|noodle/, "/images/meals/pasta.webp"],
  [/wrap|sandwich/, "/images/meals/sandwich.webp"],
  [/salad|greens/, "/images/meals/salad.webp"],
  [/chicken|turkey/, "/images/meals/chicken-rice.webp"],
  [/smoothie/, "/images/meals/smoothie.webp"],
  [/trail mix|almonds|\bnuts\b|apple|pineapple|\bfruit\b/, "/images/meals/snack.webp"],
  [/rice/, "/images/meals/chicken-rice.webp"],
];

export function getMealImage(entry?: { meal?: string | null; description?: string | null } | null): string {
  const text = normalize(`${entry?.meal ?? ""} ${entry?.description ?? ""}`);
  if (MEAL_IMAGE_EXCLUSIONS.test(text)) return MEAL_PLACEHOLDER;
  for (const [pattern, image] of MEAL_ALIASES) {
    if (pattern.test(text)) return image;
  }
  const slot = normalize(entry?.meal);
  if (slot.includes("breakfast")) return "/images/meals/oatmeal.webp";
  if (slot.includes("snack")) return "/images/meals/snack.webp";
  return MEAL_PLACEHOLDER;
}

/** Small stable hash (djb2) — used only to deterministically vary which of a
 * plan's own exercises/meals is featured as its Dashboard cover, keyed by
 * planId so the choice never changes across refreshes but differs plan to
 * plan (unlike picking a fixed slot, e.g. always the first exercise/meal). */
function hashPlanId(id: string): number {
  let hash = 5381;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 33) ^ id.charCodeAt(i);
  }
  return Math.abs(hash);
}

/** Dashboard/detail cover candidates for a plan — branches on plan type so
 * callers don't need to duplicate the workout/meal derivation logic.
 * Collects every exercise/meal in the plan, maps each to its semantic image,
 * dedupes, and drops the placeholder whenever at least one real image is
 * present (a plan is never "represented" by the placeholder if it has any
 * genuinely matched exercise/meal). The result is rotated to start at
 * hash(planId) % length so the preferred pick is deterministic and stable
 * across refreshes, but ordered — callers that need to avoid a collision
 * with another plan's chosen cover (see Dashboard.tsx) can fall through to
 * the next candidate instead of only ever seeing index 0. */
export function getPlanCoverCandidates(plan: Plan): string[] {
  let images: string[];
  let placeholder: string;

  if (plan.type === "workout") {
    const content = plan.content as WorkoutPlanContent;
    const exercises = content.weeklySchedule?.flatMap((day) => day.exercises) ?? [];
    images = exercises.length > 0 ? exercises.map((exercise) => getExerciseImage(exercise.name)) : [getWorkoutCoverImage(content.summary)];
    placeholder = WORKOUT_PLACEHOLDER;
  } else {
    const content = plan.content as MealPlanContent;
    const meals = content.dailyMeals ?? [];
    images = meals.length > 0 ? meals.map((meal) => getMealImage(meal)) : [MEAL_PLACEHOLDER];
    placeholder = MEAL_PLACEHOLDER;
  }

  const distinct = Array.from(new Set(images));
  const real = distinct.filter((src) => src !== placeholder);
  const candidates = real.length > 0 ? real : distinct;

  const start = hashPlanId(plan.planId) % candidates.length;
  return [...candidates.slice(start), ...candidates.slice(0, start)];
}

/** Single entry point for dashboard/detail cover images — the top candidate
 * from getPlanCoverCandidates. Use getPlanCoverCandidates directly when you
 * need to disambiguate covers across a list of plans (see Dashboard.tsx). */
export function getPlanCoverImage(plan: Plan): string {
  return getPlanCoverCandidates(plan)[0];
}
