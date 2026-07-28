"""Workout plan generation agent.

Exposes a synchronous REST endpoint (see contracts/agent-api.md) rather than
using the async Almanac/mailbox protocol: the backend is the only caller
(constitution Principle IV), and a plain request/response call is simpler for
that single, known, first-party caller (constitution Principle I).
"""

import logging
import os
import random

from uagents import Agent, Context

from src.shared.models import (
    HealthResponse,
    WorkoutDay,
    WorkoutExercise,
    WorkoutGenerateRequest,
    WorkoutGenerateResponse,
    WorkoutPlanContent,
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("workout_agent")

PORT = int(os.environ.get("WORKOUT_AGENT_PORT", "8001"))

agent = Agent(name="workout_agent", port=PORT, endpoint=[f"http://127.0.0.1:{PORT}/submit"])

# Difficulty level -> weekly structure (days trained, exercises per session).
# Days are spaced to leave recovery between sessions at lower levels;
# advanced trains 5 days in a row. Per-exercise volume/rest/progression is
# handled separately by _ROLE_PROGRAMMING below, keyed by each exercise's
# role rather than a single value applied to the whole plan.
_LEVEL_CONFIG = {
    "beginner": {"days": ["Monday", "Wednesday", "Friday"], "exercises_per_day": 4},
    "intermediate": {"days": ["Monday", "Tuesday", "Thursday", "Friday"], "exercises_per_day": 5},
    "advanced": {"days": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], "exercises_per_day": 6},
}

_OVERALL_PROGRESSION_NOTE = {
    "beginner": (
        "Prioritize consistent form over load — most progression below is about "
        "technique and control before adding weight."
    ),
    "intermediate": (
        "Most sessions should show a small step forward — each exercise's own note "
        "below explains what to push next."
    ),
    "advanced": (
        "Volume is high and some sets approach failure — schedule a deload every "
        "4-6 weeks and use each exercise's specific progression cue below."
    ),
}

# Exercise role -> sets/reps/rest/progression by difficulty. This replaces a
# single plan-wide (sets, reps, rest) triple: a heavy compound, an isolation
# move, and a core hold should never be programmed identically.
_ROLE_PROGRAMMING = {
    "primary": {
        "beginner": {"sets": 3, "reps": "8-10 reps", "rest": "90-120 sec"},
        "intermediate": {"sets": 4, "reps": "6-8 reps", "rest": "120-150 sec"},
        "advanced": {"sets": 5, "reps": "4-6 reps", "rest": "150-180 sec"},
        "progression": "Add load once every set hits the top of the rep range with solid form.",
    },
    "secondary": {
        "beginner": {"sets": 3, "reps": "10-12 reps", "rest": "75-90 sec"},
        "intermediate": {"sets": 4, "reps": "8-10 reps", "rest": "90-120 sec"},
        "advanced": {"sets": 4, "reps": "6-10 reps", "rest": "120-150 sec"},
        "progression": "Add a rep or a small load increase most sessions; deload if two sessions in a row stall.",
    },
    "accessory": {
        "beginner": {"sets": 3, "reps": "12-15 reps", "rest": "60-75 sec"},
        "intermediate": {"sets": 3, "reps": "10-15 reps", "rest": "60-90 sec"},
        "advanced": {"sets": 4, "reps": "10-15 reps", "rest": "75-90 sec"},
        "progression": "Add reps first, then load, once the movement feels fully controlled.",
    },
    "isolation": {
        "beginner": {"sets": 2, "reps": "12-15 reps", "rest": "45-60 sec"},
        "intermediate": {"sets": 3, "reps": "12-15 reps", "rest": "45-75 sec"},
        "advanced": {"sets": 4, "reps": "12-20 reps", "rest": "45-75 sec"},
        "progression": "Add reps, then try a slower eccentric (3-4 sec lowering), before adding load.",
    },
    "core": {
        "beginner": {"sets": 2, "reps": "12-15 reps", "rest": "30-45 sec"},
        "intermediate": {"sets": 3, "reps": "15-20 reps", "rest": "30-45 sec"},
        "advanced": {"sets": 3, "reps": "20-25 reps", "rest": "30-45 sec"},
        "progression": "Increase reps or hold time before adding resistance; slow the tempo once it feels easy.",
    },
    "finisher": {
        "beginner": {"sets": 2, "reps": "20 sec work / 40 sec rest", "rest": "60 sec"},
        "intermediate": {"sets": 1, "reps": "AMRAP in 8 min", "rest": "60 sec"},
        "advanced": {"sets": 1, "reps": "EMOM for 10 min", "rest": "60 sec"},
        "progression": "Add a round, increase reps per round, or shorten the transition between movements.",
    },
}

# Static holds get a time-based rep target instead of a rep count.
_HOLD_EXERCISES = {"Plank", "Side Plank", "Wall Sit"}
_HOLD_TIME_BY_DIFFICULTY = {
    "beginner": "20-30 sec hold",
    "intermediate": "30-45 sec hold",
    "advanced": "45-60 sec hold",
}

# Goal -> ordered day templates. Each exercise is tagged with its role so
# programming (sets/reps/rest/progression) comes from _ROLE_PROGRAMMING
# rather than a flat per-level value, and exercises within a day are ordered
# primary -> secondary -> accessory -> isolation -> core/finisher, mirroring
# how a coach would actually sequence a session. Five templates per goal
# covers the highest days-per-week (advanced); beginner/intermediate take the
# first 4/5 of each 6-exercise day, so the most essential lifts come first.
_EXERCISE_POOL_BY_GOAL = {
    "build_muscle": [
        ("Upper Body (Push Focus)", [
            ("Bench Press", "primary"),
            ("Overhead Press", "secondary"),
            ("Bent-Over Row", "accessory"),
            ("Incline Dumbbell Press", "accessory"),
            ("Lateral Raise", "isolation"),
            ("Tricep Extension", "isolation"),
        ]),
        ("Lower Body (Squat Focus)", [
            ("Squat", "primary"),
            ("Romanian Deadlift", "secondary"),
            ("Walking Lunge", "accessory"),
            ("Leg Press", "accessory"),
            ("Calf Raise", "isolation"),
            ("Leg Curl", "isolation"),
        ]),
        ("Upper Body (Pull Focus)", [
            ("Deadlift", "primary"),
            ("Pull-Up", "secondary"),
            ("Dumbbell Row", "accessory"),
            ("Face Pull", "accessory"),
            ("Hammer Curl", "isolation"),
            ("Bicep Curl", "isolation"),
        ]),
        ("Lower Body (Posterior Focus)", [
            ("Front Squat", "primary"),
            ("Hip Thrust", "secondary"),
            ("Bulgarian Split Squat", "accessory"),
            ("Farmer's Carry", "accessory"),
            ("Calf Raise", "isolation"),
            ("Leg Curl", "isolation"),
        ]),
        ("Upper Body (Push/Pull Hybrid)", [
            ("Overhead Press", "primary"),
            ("Chin-Up", "secondary"),
            ("Dumbbell Fly", "accessory"),
            ("Barbell Row", "accessory"),
            ("Weighted Dip", "isolation"),
            ("Hammer Curl", "isolation"),
        ]),
    ],
    "lose_weight": [
        ("Full Body + Cardio", [
            ("Squat", "primary"),
            ("Push-Up", "secondary"),
            ("Kettlebell Swing", "accessory"),
            ("Mountain Climbers", "core"),
            ("Plank", "core"),
            ("Jump Rope", "finisher"),
        ]),
        ("Full Body + Cardio", [
            ("Deadlift", "primary"),
            ("Dumbbell Row", "secondary"),
            ("Walking Lunge", "accessory"),
            ("Bicycle Crunch", "core"),
            ("Battle Ropes", "finisher"),
            ("Burpees", "finisher"),
        ]),
        ("Full Body + Cardio", [
            ("Goblet Squat", "primary"),
            ("Incline Push-Up", "secondary"),
            ("Box Step-Up", "accessory"),
            ("Side Plank", "core"),
            ("Jump Rope", "finisher"),
            ("Mountain Climbers", "finisher"),
        ]),
        ("Metabolic Circuit", [
            ("Kettlebell Swing", "primary"),
            ("Burpees", "secondary"),
            ("Sled Push", "accessory"),
            ("Plank", "core"),
            ("Battle Ropes", "finisher"),
            ("Jump Rope", "finisher"),
        ]),
        ("Full Body + Cardio", [
            ("Bench Press", "primary"),
            ("Walking Lunge", "secondary"),
            ("Deadlift", "accessory"),
            ("Russian Twist", "core"),
            ("Side Plank", "core"),
            ("Sprint Intervals", "finisher"),
        ]),
    ],
    "improve_endurance": [
        ("Interval Cardio", [
            ("Sprint Intervals", "primary"),
            ("Jump Rope", "secondary"),
            ("Kettlebell Swing", "accessory"),
            ("Plank", "core"),
            ("Burpees", "finisher"),
            ("Mountain Climbers", "finisher"),
        ]),
        ("Tempo Run + Core", [
            ("Tempo Run", "primary"),
            ("Brisk Walk", "secondary"),
            ("Bicycle Crunch", "core"),
            ("Russian Twist", "core"),
            ("Hanging Leg Raise", "core"),
            ("Side Plank", "core"),
        ]),
        ("Circuit Training", [
            ("Kettlebell Swing", "primary"),
            ("Box Step-Up", "secondary"),
            ("Battle Ropes", "accessory"),
            ("Plank", "core"),
            ("Burpees", "finisher"),
            ("Jump Rope", "finisher"),
        ]),
        ("Hill/Speed Work", [
            ("Hill Sprints", "primary"),
            ("High Knees", "secondary"),
            ("Sprint Intervals", "accessory"),
            ("Plank", "core"),
            ("Jumping Jacks", "finisher"),
            ("Burpees", "finisher"),
        ]),
        ("Long Steady Cardio + Core", [
            ("Cycling", "primary"),
            ("Brisk Walk", "secondary"),
            ("Bicycle Crunch", "core"),
            ("Side Plank", "core"),
            ("Russian Twist", "core"),
            ("Plank", "core"),
        ]),
    ],
    "general_fitness": [
        ("Full Body", [
            ("Squat", "primary"),
            ("Push-Up", "secondary"),
            ("Dumbbell Row", "accessory"),
            ("Walking Lunge", "accessory"),
            ("Plank", "core"),
            ("Bicycle Crunch", "core"),
        ]),
        ("Cardio + Mobility", [
            ("Brisk Walk/Jog", "primary"),
            ("Hip Mobility Drills", "secondary"),
            ("Cat-Cow Stretch", "accessory"),
            ("Side Plank", "core"),
            ("Jumping Jacks", "finisher"),
            ("Bicycle Crunch", "core"),
        ]),
        ("Full Body", [
            ("Deadlift", "primary"),
            ("Overhead Press", "secondary"),
            ("Walking Lunge", "accessory"),
            ("Dumbbell Row", "accessory"),
            ("Russian Twist", "core"),
            ("Calf Raise", "isolation"),
        ]),
        ("Core + Balance", [
            ("Plank", "core"),
            ("Side Plank", "core"),
            ("Bird Dog", "core"),
            ("Single-Leg Balance", "core"),
            ("Wall Sit", "core"),
            ("Farmer's Carry", "accessory"),
        ]),
        ("Full Body", [
            ("Squat", "primary"),
            ("Bench Press", "secondary"),
            ("Bent-Over Row", "accessory"),
            ("Step-Up", "accessory"),
            ("Bicep Curl", "isolation"),
            ("Calf Raise", "isolation"),
        ]),
    ],
}


def _build_exercise(name: str, role: str, difficulty: str, rng: random.Random) -> WorkoutExercise:
    role_table = _ROLE_PROGRAMMING.get(role, _ROLE_PROGRAMMING["accessory"])
    volume = role_table.get(difficulty, role_table["beginner"])
    reps = _HOLD_TIME_BY_DIFFICULTY[difficulty] if name in _HOLD_EXERCISES else volume["reps"]
    # Small safe jitter (+/-1 set) around the vetted baseline for this
    # role/difficulty so identical requests don't always return an identical
    # set count. Floored at 1 (never removes the exercise, never adds enough
    # volume to be unsafe).
    sets = max(1, volume["sets"] + rng.choice([-1, 0, 0, 1]))
    return WorkoutExercise(
        name=name,
        sets=sets,
        reps=reps,
        rest=volume["rest"],
        notes=role_table["progression"],
    )


def _select_day_exercises(exercise_pool, count, rng: random.Random):
    """Keeps the day's primary lift first (the heaviest compound movement
    should always lead a session), then randomly selects and orders the
    remaining slots from the rest of that day's pool. This means a
    beginner/intermediate day — which only uses a subset of the full
    6-exercise pool — doesn't always drop the same tail exercises, and the
    non-primary exercise order varies between requests."""
    primary = [ex for ex in exercise_pool if ex[1] == "primary"]
    rest = [ex for ex in exercise_pool if ex[1] != "primary"]
    rng.shuffle(rest)
    remaining_slots = max(0, count - len(primary))
    return primary + rest[:remaining_slots]


def _build_plan(
    fitness_goal: str,
    activity_level: str,
    workout_experience: str,
    variation_seed: str,
) -> WorkoutPlanContent:
    rng = random.Random(variation_seed)
    level = _LEVEL_CONFIG.get(workout_experience, _LEVEL_CONFIG["beginner"])
    templates = _EXERCISE_POOL_BY_GOAL.get(fitness_goal, _EXERCISE_POOL_BY_GOAL["general_fitness"])

    # Shuffle which day-template lands on which day of the week so the
    # training split itself varies between requests, not just the exercises
    # within a fixed split.
    shuffled_templates = list(templates)
    rng.shuffle(shuffled_templates)

    weekly_schedule = [
        WorkoutDay(
            day=day_name,
            focus=focus,
            exercises=[
                _build_exercise(name, role, workout_experience, rng)
                for name, role in _select_day_exercises(exercise_pool, level["exercises_per_day"], rng)
            ],
        )
        for day_name, (focus, exercise_pool) in zip(level["days"], shuffled_templates)
    ]

    summary = (
        f"A {workout_experience}-level, {activity_level.replace('_', ' ')} plan focused on "
        f"{fitness_goal.replace('_', ' ')}, across {len(weekly_schedule)} sessions per week "
        f"with {level['exercises_per_day']} exercises per session."
    )

    return WorkoutPlanContent(
        summary=summary,
        weekly_schedule=weekly_schedule,
        difficulty=workout_experience,
        progression_guidance=_OVERALL_PROGRESSION_NOTE.get(
            workout_experience, _OVERALL_PROGRESSION_NOTE["beginner"]
        ),
    )


@agent.on_rest_get("/health", HealthResponse)
async def handle_health(ctx: Context) -> HealthResponse:
    return HealthResponse(status="ok")


@agent.on_rest_post("/workout/generate", WorkoutGenerateRequest, WorkoutGenerateResponse)
async def handle_generate(ctx: Context, req: WorkoutGenerateRequest) -> WorkoutGenerateResponse:
    ctx.logger.info(
        "workout_agent.generate.start",
        extra={"request_id": req.request_id},
    )
    try:
        content = _build_plan(
            req.profile.fitness_goal,
            req.profile.activity_level,
            req.profile.workout_experience,
            req.request_id,
        )
    except Exception as err:  # noqa: BLE001 - log with context, then let the
        # uagents REST layer's schema-validation fallback turn this into a
        # non-200 response, which the backend already maps to agent_unavailable.
        ctx.logger.error(
            "workout_agent.generate.failed",
            extra={"request_id": req.request_id, "error": str(err)},
        )
        raise

    ctx.logger.info("workout_agent.generate.success", extra={"request_id": req.request_id})
    return WorkoutGenerateResponse(request_id=req.request_id, content=content)


if __name__ == "__main__":
    agent.run()
