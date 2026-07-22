"""Workout plan generation agent.

Exposes a synchronous REST endpoint (see contracts/agent-api.md) rather than
using the async Almanac/mailbox protocol: the backend is the only caller
(constitution Principle IV), and a plain request/response call is simpler for
that single, known, first-party caller (constitution Principle I).
"""

import logging
import os

from uagents import Agent, Context

from src.shared.models import (
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

# (experience, goal) -> per-exercise volume, kept simple and explicit for the MVP.
_VOLUME_BY_EXPERIENCE = {
    "beginner": {"sets": 3, "reps": "10-12"},
    "intermediate": {"sets": 4, "reps": "8-10"},
    "advanced": {"sets": 5, "reps": "6-8"},
}

_SPLIT_BY_GOAL = {
    "lose_weight": [
        ("Monday", "Full Body + Cardio", ["Goblet Squat", "Push-Up", "Kettlebell Swing", "Plank"]),
        ("Wednesday", "Full Body + Cardio", ["Deadlift", "Row", "Mountain Climbers", "Bicycle Crunch"]),
        ("Friday", "Full Body + Cardio", ["Lunges", "Bench Press", "Jump Rope", "Side Plank"]),
    ],
    "build_muscle": [
        ("Monday", "Upper Body", ["Bench Press", "Bent-Over Row", "Overhead Press", "Bicep Curl"]),
        ("Wednesday", "Lower Body", ["Back Squat", "Romanian Deadlift", "Leg Press", "Calf Raise"]),
        ("Friday", "Upper Body", ["Incline Dumbbell Press", "Pull-Up", "Lateral Raise", "Tricep Extension"]),
    ],
    "improve_endurance": [
        ("Monday", "Interval Cardio", ["Rowing Intervals", "Burpees", "Jump Rope"]),
        ("Wednesday", "Tempo Run + Core", ["Tempo Run", "Plank", "Russian Twist"]),
        ("Friday", "Circuit Training", ["Kettlebell Swing", "Box Step-Up", "Battle Ropes"]),
    ],
    "general_fitness": [
        ("Monday", "Full Body", ["Squat", "Push-Up", "Row", "Plank"]),
        ("Wednesday", "Cardio + Mobility", ["Brisk Walk/Jog", "Hip Mobility Drills", "Side Plank"]),
        ("Friday", "Full Body", ["Lunges", "Overhead Press", "Deadlift", "Bicycle Crunch"]),
    ],
}


def _build_plan(fitness_goal: str, activity_level: str, workout_experience: str) -> WorkoutPlanContent:
    volume = _VOLUME_BY_EXPERIENCE.get(workout_experience, _VOLUME_BY_EXPERIENCE["beginner"])
    split = _SPLIT_BY_GOAL.get(fitness_goal, _SPLIT_BY_GOAL["general_fitness"])

    weekly_schedule = [
        WorkoutDay(
            day=day,
            focus=focus,
            exercises=[
                WorkoutExercise(name=name, sets=volume["sets"], reps=volume["reps"])
                for name in exercises
            ],
        )
        for day, focus, exercises in split
    ]

    summary = (
        f"A {workout_experience}-level, {activity_level.replace('_', ' ')} plan focused on "
        f"{fitness_goal.replace('_', ' ')}, across {len(weekly_schedule)} sessions per week."
    )

    return WorkoutPlanContent(summary=summary, weekly_schedule=weekly_schedule)


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
